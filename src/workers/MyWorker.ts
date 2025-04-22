
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, CompletedJob, FailedJob } from "../types";
import { Queues, UserType } from "../types/enums";
import { redisBull, redisPub } from "../config";
import { myQueue } from "../config/bullmq";
import { completedJob, failedJob } from ".";

interface IJob {
    task: string,
    clientId: number,
    userType: UserType
}

export class MyWorker implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.MY_QUEUE;
    public eventName: string = "myWorker";
    public queue: Queue = myQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id, data } = job;
        return { result: `Job ${id} completed successfully` };
    }
}