
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, ImageMeta } from "../../../types";
import { CdnFolders, Queues, SSEEvents, ResourceType } from "../../../types/enums";
import { redisBull } from "../../../config";
import { uploadProductQueue } from "../../queues";
import { InventoryDto, ProductDto } from "../../../types/dtos";
import { Cloudinary } from "../../../services";
import { Product } from "../../../repos";
import BaseService from "../../../services/bases/BaseService";


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
        const service = new BaseService();
        const files = service.convertMetaToFiles(data.images);

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
        const repoResultError = service.handleRepoError(result);
        if (repoResultError) return repoResultError;
        return service.responseData(201, false, "Product has been uploaded successfully", result.data);
    }
}