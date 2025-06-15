import { QueueEvents, Worker } from "bullmq";
import { CompletedJob, IWorker, FailedJob } from "../../types";
import { MyWorker } from "./MyWorker";
import { Upload } from "./Upload";
import CreateStore from "./../workers/store/CreateStore";
import UploadProduct from "./product/UploadProduct";
import NotifyCustomers from "./notification/NotifyCustomers";
import NewFollower from "./notification/NewFollower";
import { logger, streamRouter } from "../../config";

const IWorkers: IWorker<any>[] = [
    new MyWorker(),
    new Upload(),
    new CreateStore(),
    new UploadProduct(),
    new NotifyCustomers(),
    new NewFollower()
];

export function initializeQueues() {
    // for (const IWorker of IWorkers) {
    //     const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
    //     const queueEvents = new QueueEvents(IWorker.queueName, { ...IWorker.config });

    //     if (IWorker.completed) {
    //         queueEvents.on('completed', IWorker.completed.bind(IWorker));
    //     } else {
    //         queueEvents.on('completed', async ({ jobId, returnvalue }: CompletedJob) => {
    //             const job = await IWorker.queue.getJob(jobId);
    //             await SSE.completedJob(job, IWorker.eventName, jobId, returnvalue);
    //         });
    //     }

    //     if (IWorker.failed) {
    //         queueEvents.on('failed', IWorker.failed.bind(IWorker));
    //     } else {
    //         queueEvents.on('failed', async ({ jobId, failedReason }: FailedJob) => {
    //             const job = await IWorker.queue.getJob(jobId);
    //             await SSE.failedJob(job, IWorker.eventName, jobId, failedReason);
    //         });
    //     }
    //     if (IWorker.drained) queueEvents.on('drained', IWorker.drained.bind(IWorker));
    // }
}



export default function initializeWorkers() {
    for (const IWorker of IWorkers) {
        const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
        const queueEvents = new QueueEvents(IWorker.queueName, { ...IWorker.config });

        if (IWorker.completed) {
            queueEvents.on('completed', IWorker.completed.bind(IWorker));
        } else {
            queueEvents.on('completed', async ({ jobId, returnvalue }: CompletedJob) => {
                const job = await IWorker.queue.getJob(jobId);
                const userType = job?.data.userType;
                const clientId = job?.data.clientId;

                await streamRouter.addEvent('notification', {
                    type: 'notification:users',
                    data: {
                        error: returnvalue.json.error,
                        message: returnvalue.json.message,
                        // type: returnvalue.json.notificationType,
                        userDetails: {
                            userType,
                            userId: clientId,
                        },
                        data: returnvalue.json.data
                    },
                });

                logger.info(`Queue for ${userType}:${clientId} has been competed successfully`);
            });
        }

        if (IWorker.failed) {
            queueEvents.on('failed', IWorker.failed.bind(IWorker));
        } else {
            queueEvents.on('failed', async ({ jobId, failedReason }: FailedJob) => {
                const job = await IWorker.queue.getJob(jobId);
                const userType = job?.data.userType;
                const clientId = job?.data.clientId;

                logger.info(`Queue for ${userType}:${clientId} failed`);



                // await streamRouter.addEvent('notification', {
                //     type: 'notification:users',
                //     data: {
                //         error: returnvalue.json.error,
                //         message: returnvalue.json.message,
                //         userDetails: {
                //             userType,
                //             userId: clientId,
                //         },
                //         data: returnvalue.json.data
                //     },
                // });
            });
        }
        if (IWorker.drained) queueEvents.on('drained', IWorker.drained.bind(IWorker));
    }
}