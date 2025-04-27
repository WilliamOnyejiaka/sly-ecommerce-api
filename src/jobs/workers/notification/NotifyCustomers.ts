import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, CompletedJob } from "../../../types";
import { Queues, SSEEvents, UserType } from "../../../types/enums";
import { redisBull, redisClient } from "../../../config";
import { notifyCustomersQueue } from "../../queues";
import { SSE } from "../../../services";
import prisma from "../../../repos";
import BaseService from "../../../services/bases/BaseService";
import cluster from "cluster";


interface IJob {
    productId: number,
    storeId: number,
    clientId: number,
    userType: string
}

export default class NotifyCustomers implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.NOTIFY_CUSTOMERS;
    public eventName: string = SSEEvents.NOTIFY_CUSTOMERS;
    public queue: Queue = notifyCustomersQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id: jobId, data } = job;
        const { productId, storeId } = job.data;

        const service = new BaseService();

        const followers = await prisma.storeFollower.findMany({
            where: { storeId },
        });

        const followersData = followers.map(follower => ({
            productId,
            storeId,
            customerId: follower.customerId,
        }));

        const chunkSize = 500;
        for (let i = 0; i < followersData.length; i += chunkSize) {
            const chunk = followersData.slice(i, i + chunkSize);
            await prisma.newProductInbox.createMany({
                data: chunk,
                skipDuplicates: true,
            });
        }

        return service.responseData(201, false, "Product has been uploaded successfully", {
            productId,
            followers,
        });
    }

    public async completed({ jobId, returnvalue }: CompletedJob) {
        const job = await notifyCustomersQueue.getJob(jobId); // ! Remove if not needed

        const followers: { id: number, storeId: number, customerId: number }[] = returnvalue.json.data.followers;
        const batchSize = 500;

        for (let i = 0; i < followers.length; i += batchSize) {
            const batch = followers.slice(i, i + batchSize);
            const key = UserType.Customer + "s";


            await Promise.all(
                batch.map(async (follower) => {
                    const isMember = await redisClient.sismember(key, String(follower.customerId));
                    if (isMember === 1) {
                        console.log("Yes");

                        const data = {
                            message: "A store has uploaded a product",
                            productId: returnvalue.json.data.productId,
                            storeId: follower.storeId
                        }
                        await SSE.publishSSEEvent(UserType.Customer, follower.customerId, { id: jobId, event: this.eventName, data, error: false }, "notification");/*  */
                    }
                })
            );

        }
    }
}