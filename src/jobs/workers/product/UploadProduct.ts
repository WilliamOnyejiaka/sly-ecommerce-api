
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, ImageMeta, CompletedJob, FailedJob } from "../../../types";
import { CdnFolders, Queues, SSEEvents, ResourceType, NotificationType, StreamEvents, StreamGroups } from "../../../types/enums";
import { logger, redisBull, streamRouter } from "../../../config";
import { notifyCustomersQueue, uploadProductQueue } from "../../queues";
import { InventoryDto, ProductDto } from "../../../types/dtos";
import { Cloudinary } from "../../../services";
import { Product } from "../../../repos";
import { WorkerUtil } from "../../../utils";

interface IJob {
    images: ImageMeta[],
    inventoryDto: InventoryDto,
    productDto: ProductDto,
    clientId: number,
    userType: string
}

export default class UploadProduct implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.UPLOAD_PRODUCT;
    public eventName: string = SSEEvents.UPLOAD_PRODUCT;
    public queue: Queue = uploadProductQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id: jobId, data } = job;
        const repo = new Product();
        const files = WorkerUtil.convertMetaToFiles(data.images);

        const { uploadedFiles, publicIds, failedFiles } = await (new Cloudinary()).upload(files as any, ResourceType.IMAGE, CdnFolders.PR0DUCT_IMAGES)
        let uploaded = [];

        for (const file of uploadedFiles) {
            const item = {
                publicId: file.publicId,
                size: Math.ceil(Number(file.size)),
                imageUrl: file.url,
                mimeType: file.mimeType
            };
            uploaded.push(item)
        }
        const result = await repo!.insertProductAll(data.productDto, data.inventoryDto, uploaded as any); // TODO: create a type for uploaded
        const repoResultError = WorkerUtil.handleRepoError(result);
        if (repoResultError) return repoResultError;

        logger.info("👍 Product upload has ended");
        return WorkerUtil.processResponse(NotificationType.UPLOAD_PRODUCT, false, "Product has been uploaded successfully", result.data);
    }

    public async completed({ jobId, returnvalue }: CompletedJob) {
        const job = await uploadProductQueue.getJob(jobId);
        const clientId = job?.data.clientId;
        const userType = job?.data.userType;

        const storeId = returnvalue.data.storeId;
        const product = returnvalue.data;

        delete product.draft
        delete product.inventory

        await notifyCustomersQueue.add('notifyCustomersQueue', { // TODO: handle later
            storeId,
            product: returnvalue.data
        });

        await streamRouter.addEvent(
            StreamGroups.NOTIFICATION,
            WorkerUtil.notificationData(StreamEvents.NOTIFY, returnvalue, {
                userType,
                userId: clientId,
            }));
    }

    // public async failed({ jobId, failedReason }: FailedJob) {
    //     // const job = await IWorker.queue.getJob(jobId);
    //     // await SSE.failedJob(job, IWorker.eventName, jobId, failedReason);
    // }
}