import { redisBull, redisPub } from "../config";

export async function completedJob(job: any, event: string, jobId: string, data: any) {
    const clientId = job?.data.clientId;
    const userType = job?.data.userType;

    if (clientId && (await redisBull.exists(`client:${userType}:${clientId}`))) {
        await redisPub.publish(
            `job:${userType}:${clientId}`,
            JSON.stringify({ event, jobId, data, error: false }),
        );
        // Remove job from client's job list
        const jobIdsStr = await redisBull.hget(`client:${userType}:${clientId}`, 'jobIds');
        const jobIds = jobIdsStr ? JSON.parse(jobIdsStr) : [];
        const updatedJobIds = jobIds.filter((id: string) => id !== jobId);
        await redisBull.hset(`client:${userType}:${clientId}`, 'jobIds', JSON.stringify(updatedJobIds));
    }
}

export async function failedJob(job: any, event: string, jobId: string, data: any) {
    const clientId = job?.data.clientId;
    const userType = job?.data.userType;

    if (clientId && (await redisBull.exists(`client:${userType}:${clientId}`))) {
        await redisPub.publish(
            `job:${userType}:${clientId}`,
            JSON.stringify({ event, jobId, data, error: true }),
        );
        // Remove job from client's job list
        const jobIdsStr = await redisBull.hget(`client:${userType}:${clientId}`, 'jobIds');
        const jobIds = jobIdsStr ? JSON.parse(jobIdsStr) : [];
        const updatedJobIds = jobIds.filter((id: string) => id !== jobId);
        await redisBull.hset(`client:${userType}:${clientId}`, 'jobIds', JSON.stringify(updatedJobIds));
    }
}