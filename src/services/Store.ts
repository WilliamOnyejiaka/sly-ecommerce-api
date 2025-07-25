import BaseService from "./bases/BaseService";
import constants, { http, HttpStatus, urls } from "../constants";
import { getPagination } from "../utils";
import { FirstBanner, SecondBanner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";
import ImageService from "./Image";
import { CdnFolders, StreamEvents, StreamGroups, UserType } from "../types/enums";
import { streamRouter } from "../config";
import { createStoreQueue } from "../jobs/queues";

export default class Store extends BaseService<StoreDetails> {

    private readonly imageService: ImageService = new ImageService();
    private readonly imageDatas: string[] = ['storeLogo', 'firstStoreBanner', 'secondStoreBanner'];

    public constructor() {
        super(new StoreDetails());
    }

    public async createStoreAll(storeDetailsDto: StoreDetailsDto, images: Express.Multer.File[], userType: UserType) {
        const storeRepoResult = await this.repo!.getStoreWithVendorId(storeDetailsDto.vendorId!);
        const storeRepoResultError = this.handleRepoError(storeRepoResult);
        if (storeRepoResultError || storeRepoResult.data) return storeRepoResultError ?? super.responseData(HttpStatus.BAD_REQUEST, true, "This vendor already has a store");

        const storeNameRepoResult = await this.repo!.getItemWithName(storeDetailsDto.name); // TODO: check if the name exits properly
        const storeNameRepoResultError = this.handleRepoError(storeNameRepoResult);

        if (storeNameRepoResultError || storeNameRepoResult.data) return storeNameRepoResultError ?? super.responseData(HttpStatus.BAD_REQUEST, true, "Store name already exists");

        const imageMetadata = super.convertFilesToMeta(images);

        const job = await createStoreQueue.add('createStore', {
            images: imageMetadata,
            storeDetailsDto,
            userType: userType,
            clientId: storeDetailsDto.vendorId!
        });
        return super.responseData(200, false, `Job ${job.id} added to queue for client ${userType} - ${storeDetailsDto.vendorId!}`)
    }

    public async createStore(storeDetailsDto: StoreDetailsDto) {
        const storeRepoResult = await this.repo!.getStoreWithVendorId(storeDetailsDto.vendorId!);
        const storeRepoResultError = this.handleRepoError(storeRepoResult);
        if (storeRepoResultError) return storeRepoResultError;

        const storeNameRepoResult = await this.repo!.getItemWithName(storeDetailsDto.name); // TODO: try to remove this part and check the top on too
        const storeNameRepoResultError = this.handleRepoError(storeNameRepoResult);
        if (storeNameRepoResultError) return storeNameRepoResultError;

        const repoResult = await this.repo!.insert(storeDetailsDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const result = repoResult.data;
        await streamRouter.addEvent(StreamGroups.STORE, {
            type: StreamEvents.STORE_CREATE,
            data: result,
        });

        return super.responseData(201, false, "Store was created successfully", result);
    }

    public async getStoreWithId(id: number) {
        const repoResult = await this.repo!.getItemWithId(id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        super.setImageUrls([repoResult.data], this.imageDatas);

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        return super.responseData(
            statusCode,
            error,
            error ? "Store was not found" : "Store was retrieved successfully",
            repoResult.data
        );
    }

    public async uploadBanners(banners: Express.Multer.File[], storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) return checkStoreImages;

        if (checkStoreImages.json.data.hasFirstBanner || checkStoreImages.json.data.hasSecondBanner) return super.responseData(400, true, "A banner already exists");

        const uploadFolders: Record<string, CdnFolders> = {
            firstBanner: CdnFolders.FIRST_STORE_BANNER,
            secondBanner: CdnFolders.SECOND_STORE_BANNER
        };

        const uploadResults = await this.imageService.uploadImages(banners, uploadFolders);
        const storeBanners = uploadResults.data;

        if (storeBanners) {
            const repoResult = await this.repo!.insertBanners(storeId, storeBanners?.firstBanner, storeBanners?.secondBanner);
            const firstStoreBannerUrl = storeBanners?.firstBanner?.imageUrl ?? null;
            const secondStoreBannerUrl = storeBanners?.secondBanner?.imageUrl ?? null;

            const error = this.handleRepoError(repoResult);
            if (error) {
                const deleted = await this.imageService.deleteImages(uploadResults.publicIds!);
                return error;
            }

            return super.responseData(
                201,
                false,
                "banners were created successfully",
                {
                    firstStoreBannerUrl: firstStoreBannerUrl,
                    secondStoreBannerUrl: secondStoreBannerUrl
                }
            );
        }
        return super.responseData(500, true, "Error processing images");
    }

    private async checkStoreImages(storeId: number) {
        const storeDetailsRepoResult = await this.repo!.getStore(storeId);
        const storeDetailsRepoResultError = this.handleRepoError(storeDetailsRepoResult);
        if (storeDetailsRepoResultError) return storeDetailsRepoResultError;

        const storeDetails = storeDetailsRepoResult.data as any;
        if (!storeDetails) return super.responseData(HttpStatus.NOT_FOUND, true, "Store was not found");

        const data = {
            hasStoreLogo: storeDetails.storeLogo.length > 0,
            hasFirstBanner: storeDetails.firstStoreBanner.length > 0,
            hasSecondBanner: storeDetails.secondStoreBanner.length > 0
        };

        return super.responseData(200, false, null, data);
    }

    public async uploadStoreLogo(image: Express.Multer.File, storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) return checkStoreImages;
        if (checkStoreImages.json.data.hasStoreLogo) return super.responseData(400, true, "A store logo already exists");

        const serviceResult = await this.imageService.uploadImage<StoreLogo>(
            image,
            storeId,
            new StoreLogo(),
            CdnFolders.STORE_LOGO
        );

        if (!serviceResult.json.error) {
            await streamRouter.addEvent(StreamGroups.STORE, {
                type: StreamEvents.UPLOAD,
                data: {
                    storeId,
                    imageUrl: serviceResult.json.data.imageUrl
                },
            });
        }

        return serviceResult;
    }

    public async uploadFirstBanner(image: Express.Multer.File, storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) return checkStoreImages;
        if (checkStoreImages.json.data.hasFirstBanner) return super.responseData(400, true, "A banner already exists");

        return await this.imageService.uploadImage<FirstBanner>(
            image,
            storeId,
            new FirstBanner(),
            CdnFolders.FIRST_STORE_BANNER
        );
    }

    public async uploadSecondBanner(image: Express.Multer.File, storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) return checkStoreImages;
        if (checkStoreImages.json.data.hasSecondBanner) return super.responseData(400, true, "A banner already exists");

        return await this.imageService.uploadImage<SecondBanner>(
            image,
            storeId,
            new SecondBanner(),
            CdnFolders.SECOND_STORE_BANNER
        );
    }

    public async getStoreAllWithVendorId(vendorId: number) {
        const repoResult = await this.repo!.getStoreAndRelationsWithVendorId(vendorId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            super.setImageUrls([repoResult.data], this.imageDatas);
            return super.responseData(statusCode, error, "Store was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "This vendor does not have a store", repoResult.data);
    }

    public async getStoreAllWithId(id: number) {
        const repoResult = await this.repo!.getStoreAndRelationsWithId(id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            super.setImageUrls([repoResult.data], this.imageDatas);
            return super.responseData(statusCode, error, "Store was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "Store was not found", repoResult.data);
    }

    public async getStoreAllWithName(name: string) {
        const repoResult = await this.repo!.getStoreAndRelationsWithName(name);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            super.setImageUrls([repoResult.data], this.imageDatas);
            return super.responseData(statusCode, error, "Store was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "Store was not found", repoResult.data);
    }

    public async paginateStores(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const take = limit;
        const repoResult = await this.repo!.paginateStore(skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems!;
        const pagination = getPagination(page, limit, totalRecords);
        super.setImageUrls(data.items, this.imageDatas);

        return super.responseData(200, false, constants('200Stores')!, {
            data: data.items,
            pagination
        });
    }

    public async getAllStores() {
        const repoResult = await this.repo!.getAllStoresAndRelations();
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        super.setImageUrls(repoResult.data as any, this.imageDatas);
        return super.responseData(200, false, constants('200Stores')!, repoResult.data);
    }

    public async delete(vendorId: number) {
        const storeRepoResult = await this.repo!.getStoreAndRelationsWithVendorId(vendorId);
        const storeRepoResultError = super.handleRepoError(storeRepoResult);
        if (storeRepoResultError) return storeRepoResultError;

        const storeData = storeRepoResult.data;
        if (!storeData) return super.responseData(404, true, "This vendor does not have a store");

        const storeLogoDetails = storeData.storeLogo.length > 0 ? storeData.storeLogo[0] : null;
        const firstStoreBannerDetails = storeData.firstStoreBanner.length > 0 ? storeData.firstStoreBanner[0] : null;
        const secondStoreBannerDetails = storeData.secondStoreBanner.length > 0 ? storeData.secondStoreBanner[0] : null;

        let publicIDs: string[] = [];
        [storeLogoDetails, firstStoreBannerDetails, secondStoreBannerDetails].forEach(imageDetail => {
            if (imageDetail) publicIDs.push(imageDetail.publicId);
        });

        if (publicIDs.length > 0) {
            const deletedResult = await this.imageService.deleteImages(publicIDs);
            if (deletedResult.json.error) return deletedResult;
        }

        const repoResult = await this.repo!.delete(vendorId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        await streamRouter.addEvent(StreamGroups.STORE, {
            type: StreamEvents.DELETE,
            data: { vendorId },
        });

        return super.responseData(200, false, "Store was deleted successfully");
    }
}