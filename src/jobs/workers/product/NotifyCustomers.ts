
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, ImageMeta } from "../../../types";
import { CdnFolders, Queues, SSEEvents, ResourceType } from "../../../types/enums";
import { redisBull } from "../../../config";
import { notifyCustomersQueue, uploadProductQueue } from "../../queues";
import { InventoryDto, ProductDto } from "../../../types/dtos";
import { Cloudinary } from "../../../services";
import { Product } from "../../../repos";
import BaseService from "../../../services/bases/BaseService";


interface IJob {
    images: ImageMeta[],
    productId: number,
    storeId: number,
    clientId?: number,
    userType?: string
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
        
        // return service.responseData(201, false, "Product has been uploaded successfully", result.data);
    }
}