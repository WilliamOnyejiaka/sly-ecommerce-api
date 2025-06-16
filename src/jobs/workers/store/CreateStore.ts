
import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker } from "../../../types";
import { CdnFolders, Queues, SSEEvents, StreamGroups, StreamEvents, NotificationType } from "../../../types/enums";
import { redisBull, redisPub, streamRouter } from "../../../config";
import { createStoreQueue } from "../../queues";
import { ImageService } from "../../../services";
import { StoreDetails } from "../../../repos";
import { StoreDetailsDto } from "../../../types/dtos";
import { WorkerUtil } from "../../../utils";


interface IJob {
    images: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: any;
    }[],
    storeDetailsDto: StoreDetailsDto,
    clientId: number,
    userType: string
}

export default class CreateStore implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.CREATE_STORE;
    public eventName: string = SSEEvents.CREATE_STORE;
    public queue: Queue = createStoreQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id: jobId, data } = job;

        const imageService = new ImageService();
        const repo = new StoreDetails();

        const uploadFolders: Record<string, CdnFolders> = {
            storeLogo: CdnFolders.STORE_LOGO,
            firstBanner: CdnFolders.FIRST_STORE_BANNER,
            secondBanner: CdnFolders.SECOND_STORE_BANNER,
        };

        for (const [index, item] of data.images.entries()) {
            data.images[index].buffer = Buffer.from(item.buffer, 'base64');
        }

        const uploadResults = await imageService.uploadImages(data.images as any, uploadFolders);
        const storeImages = uploadResults.data;

        if (storeImages) {
            const repoResult = await repo.insertWithRelations(
                data.storeDetailsDto,
                storeImages?.storeLogo,
                storeImages?.firstBanner,
                storeImages?.secondBanner
            );

            if (!repoResult.error) {
                const result = {
                    ...repoResult.data,
                    storeLogoUrl: storeImages.storeLogo?.imageUrl ?? null,
                    firstBannerUrl: storeImages.firstBanner?.imageUrl ?? null,
                    secondBannerUrl: storeImages.secondBanner?.imageUrl ?? null,
                };

                await streamRouter.addEvent(StreamGroups.STORE, {
                    type: StreamEvents.STORE_CREATE,
                    data: result,
                });

                return WorkerUtil.processResponse(
                    NotificationType.CREATE_STORE,
                    false,
                    "Store was created successfully",
                    result
                );
            }
            const deleted = await imageService.deleteImages(uploadResults.publicIds!); // TODO: cache failed deletes
            return WorkerUtil.processResponse(NotificationType.ERROR, true, repoResult.message!);
        }
        return WorkerUtil.processResponse(NotificationType.ERROR, true, "Error processing images");
    }
}