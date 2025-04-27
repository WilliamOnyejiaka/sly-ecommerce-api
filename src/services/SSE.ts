import cluster from "cluster";
import { logger, redisBull, redisPub, redisClient } from "../config";

interface SSEEvent {
    error: boolean;
    event: string;
    data: any;
    id?: string;
};

export default class SSE {

    private static readonly redisPub = redisPub;
    private static readonly redisBull = redisBull;

    public static channel(userType: string, clientId: number, key: string = "user") {
        return `${key}:${userType}:${clientId}`;
    }

    public static clientKey(userType: string, clientId: number) {
        return `client:${userType}:${clientId}`;
    }

    public static async publishSSEEvent(userType: string, clientId: number, event: SSEEvent, key: string = "user") {
        const myWorkerId = cluster.worker?.id;
        const REDIS_ACTIVE_PUBLISHER = "cluster:active_publisher";
        let activePublisher;
        try {
            activePublisher = await redisClient.get(REDIS_ACTIVE_PUBLISHER);
        } catch (error) {
            console.log("An error occurred in the publishSSEEvent function: ", error);

        }
        if (activePublisher === myWorkerId?.toString()) {
            console.log(`Worker ${myWorkerId} (PID ${process.pid}) is active publisher. Publishing now...`);

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
    }

    // public static async publishSSEEvent(userType: string, clientId: number, event: SSEEvent, key: string = "user") {
    //     // Validate inputs
    //     if (!userType || typeof userType !== 'string') {
    //         throw new Error('userType must be a non-empty string');
    //     }
    //     if (!Number.isInteger(clientId) || clientId <= 0) {
    //         throw new Error('clientId must be a positive integer');
    //     }
    //     if (!event) {
    //         throw new Error('Event is required');
    //     }
    //     if (!key || typeof key !== 'string') {
    //         throw new Error('Key must be a non-empty string');
    //     }

    //     const channel = SSE.channel(userType, clientId, key);
    //     // Generate unique key for deduplication
    //     const DEDUP_KEY_PREFIX = 'sse:';
    //     let dedupKey: string;
    //     try {
    //         dedupKey = `${DEDUP_KEY_PREFIX}${userType}:${clientId}:${key}:${JSON.stringify(event)}`;
    //     } catch (error: any) {
    //         throw new Error(`Failed to serialize event: ${error.message}`);
    //     }

    //     try {
    //         // Attempt to set deduplication key if it doesn't exist
    //         const published = await SSE.redisPub.setnx(dedupKey, 'published');

    //         if (published) {
    //             // Publish event to Redis channel
    //             await SSE.redisPub.publish(channel, JSON.stringify(event));
    //             logger.info(`🤝 Event published for ${userType} - ${clientId} on channel ${channel}`, { event });

    //             // Delete deduplication key after publishing
    //             await SSE.redisPub.del(dedupKey);
    //         } else {
    //             logger.info(`🤝 Event already published for ${userType} - ${clientId} on channel ${channel}`, { event });
    //         }
    //     } catch (error: unknown) {
    //         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    //         const errorStack = error instanceof Error ? error.stack : undefined;
    //         logger.error(`🛑 Failed to publish event for ${userType} - ${clientId} on channel ${channel}: ${errorMessage}`, { error: errorStack });
    //         throw error; // Re-throw to allow caller to handle
    //     }
    // }

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