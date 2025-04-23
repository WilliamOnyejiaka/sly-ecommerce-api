import { logger, redisBull, redisPub } from "../config";

interface SSEEvent {
    error: boolean;
    event: string;
    data: any;
    id?: string;
};

export default class SSE {

    private static readonly redisPub = redisPub;
    private static readonly redisBull = redisBull;

    public static channel(userType: string, clientId: number, key: string = "job") {
        return `${key}:${userType}:${clientId}`;
    }

    public static clientKey(userType: string, clientId: number) {
        return `client:${userType}:${clientId}`;
    }

    public static async publishSSEEvent(userType: string, clientId: number, event: SSEEvent, key: string = "job") {
        const channel = SSE.channel(userType, clientId, key);
        try {
            await SSE.redisPub.publish(
                channel,
                JSON.stringify(event),
            );
            logger.info(`🤝 Event was successfully published for ${userType} - ${clientId}`);
        } catch (error) {
            logger.error(`🛑 Failed to publish event for ${userType} - ${clientId}`);
            console.log(error);
        }
    }

    public static async clientExists(userType: string, clientId: number) {
        const clientKey = SSE.clientKey(userType, clientId);
        try {
            return await SSE.redisBull.exists(clientKey);
        } catch (error) {
            logger.error(`🛑 Failed to check existence for ${userType} - ${clientId}\n`);
            console.log(error);
        }
    }

    public static async removeJob(jobId: string, userType: string, clientId: number) {
        const clientKey = SSE.clientKey(userType, clientId);
        try {
            const jobIdsStr = await SSE.redisBull.hget(clientKey, 'jobIds');
            const jobIds = jobIdsStr ? JSON.parse(jobIdsStr) : [];
            const updatedJobIds = jobIds.filter((id: string) => id !== jobId);
            await redisBull.hset(clientKey, 'jobIds', JSON.stringify(updatedJobIds));
            logger.info(`🤝 Job was successfully removed for ${userType} - ${clientId}`);
        } catch (error) {
            logger.error(`🛑 Failed to remove job for ${userType} - ${clientId}`);
            console.log(error);
        }
    }

    public static async completedJob(job: any, event: string, jobId: string, data: any) {
        const clientId = job?.data.clientId;
        const userType = job?.data.userType;

        if (clientId && (await SSE.clientExists(userType, clientId))) {
            await SSE.publishSSEEvent(userType, clientId, { id: jobId, event, data, error: false })
            await SSE.removeJob(jobId, userType, clientId);
        }
    }

    public static async failedJob(job: any, event: string, jobId: string, data: any) {
        const clientId = job?.data.clientId;
        const userType = job?.data.userType;

        if (clientId && (await SSE.clientExists(userType, clientId))) {
            await SSE.publishSSEEvent(userType, clientId, { event, id: jobId, data, error: true });
            await SSE.removeJob(jobId, userType, clientId);
        }
    }

    public static async storeClient(userType: string, clientId: number, TTL: number = 3600) {
        try {
            const clientKey = SSE.clientKey(userType, clientId);
            const pipeline = SSE.redisBull.pipeline();
            pipeline.hset(clientKey, {
                active: 'true',
                jobIds: JSON.stringify([]),
            });
            pipeline.expire(clientKey, TTL); // TODO: whats the point. Expire in 1 hour
            await pipeline.exec();
            logger.info(`🤝 ${userType} - ${clientId} was successfully stored`);
            return true;
        } catch (error) {
            logger.error(`🛑 Failed to store ${userType} - ${clientId}`);
            console.log('Failed to store client: ', error);
            return false;
        }
    }

    // Update client's job list in Redis
    public static async addJob(jobId: any, userType: string, clientId: number) {
        try {
            const clientKey = SSE.clientKey(userType, clientId);
            const jobIdsStr = await redisBull.hget(clientKey, 'jobIds');
            const jobIds: any[] = jobIdsStr ? JSON.parse(jobIdsStr) : [];
            jobIds.push(jobId);
            await redisBull.hset(clientKey, 'jobIds', JSON.stringify(jobIds));
            logger.info(`✅ ${userType} - ${clientId}, job - ${jobId} successfully stored`);
            return true;
        } catch (error) {
            logger.error(`🛑 ${userType} - ${clientId}, job - ${jobId} was not stored`);
            console.log("Failed to store job", error);
            return false;
        }
    }

    public static write(event: string, data: any = {}) {
        return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    }
}