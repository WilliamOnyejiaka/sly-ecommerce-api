import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, CompletedJob } from "../../../types";
import { NotificationType, Queues, SSEEvents, StreamEvents, StreamGroups, UserType } from "../../../types/enums";
import { logger, redisBull, streamRouter, env } from "../../../config";
import { notifyCustomersQueue } from "../../queues";
import prisma from "../../../repos";
import { WorkerUtil } from "../../../utils";


interface IJob {
    product: any,
    storeId: number,
    clientId: number,
    userType: string
}

export default class NotifyCustomers implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.NOTIFY_CUSTOMERS;
    public eventName: string = SSEEvents.NOTIFY_CUSTOMERS;
    public queue: Queue = notifyCustomersQueue;
    private batchSize: number;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
        this.batchSize = Number(env('batchSize'));
    }

    public async process(job: Job<IJob>) {
        const { id: jobId, data } = job;
        const { storeId, product } = job.data;

        // Use pagination to fetch followers
        let cursor = undefined;
        do {
            const batch: any = await prisma.storeFollower.findMany({
                where: { storeId },
                take: 500,
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
                select: { customerId: true }
            });
            await this.processBatch(batch, product);
            cursor = batch.length ? batch[batch.length - 1].id : undefined;
        } while (cursor);

        return true;
    }

    private async processBatch(batch: { customerId: number }[], product: any) {
        await Promise.all(
            batch.map(async (follower) => {
                try {
                    const returnvalue = {
                        message: "New product notification",
                        error: false,
                        notificationType: NotificationType.NEW_PRODUCT,
                        data: product
                    };

                    logger.info(`New product notification for customer:${follower.customerId}`);
                    await streamRouter.addEvent(
                        StreamGroups.NOTIFICATION,
                        WorkerUtil.notificationData(StreamEvents.NOTIFY, returnvalue, {
                            userType: UserType.CUSTOMER,
                            userId: follower.customerId,
                        })
                    );

                } catch (error) {
                    logger.error(`Failed to notify customer ${follower.customerId}: ${error}`);
                }
            })
        );
    }

    public async completed({ jobId, returnvalue }: CompletedJob) {
        logger.info("New product notification queue has finished processing successfully");
    }
}
