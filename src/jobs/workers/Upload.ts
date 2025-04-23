
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker } from "../../types";
import { Queues, UserType } from "../../types/enums";
import { redisBull } from "../../config";
import { uploadQueue } from "../queues";

interface IJob {
    imageUrl: string,
    clientId: number,
    userType: UserType
}

export class Upload implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.UPLOAD;
    public eventName: string = "upload";
    public queue: Queue = uploadQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id, data } = job;
        return { message: "Image was uploaded successfully", data };
    }
}