import BaseService from "./bases/BaseService";
import constants, { http, HttpStatus, urls } from "../constants";
import { getPagination } from "../utils";
import { FirstBanner, SecondBanner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";
import ImageService from "./Image";

export default class Store extends BaseService<StoreDetails> {

    private readonly imageService: ImageService = new ImageService();
    private readonly imageDatas: string[] = ['storeLogo', 'firstStoreBanner', 'secondStoreBanner'];

    public constructor() {
        super(new StoreDetails());
    }

    public async createStoreAll(storeDetailsDto: StoreDetailsDto, images: Express.Multer.File[]) {
        const storeRepoResult = await this.repo!.getStoreWithVendorId(storeDetailsDto.vendorId!);
        const storeRepoResultError = this.handleRepoError(storeRepoResult);
        if (storeRepoResultError || storeRepoResult.data) {
            if (!(await this.imageService.deleteFiles(images))) return storeRepoResultError ?? super.responseData(HttpStatus.BAD_REQUEST, true, "This vendor already has a store");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const storeNameRepoResult = await this.repo!.getItemWithName(storeDetailsDto.name); // ! TODO: check if the name exits properly
        const storeNameRepoResultError = this.handleRepoError(storeNameRepoResult);

        if (storeNameRepoResultError) {
            if (!(await this.imageService.deleteFiles(images))) return storeNameRepoResultError;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        if (storeNameRepoResult.data) {
            if (!(await this.imageService.deleteFiles(images))) return super.responseData(HttpStatus.BAD_REQUEST, true, "Store name already exists");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const uploadFolders: Record<string, string> = {
            storeLogo: "storeLogo",
            firstBanner: "firstStoreBanner",
            secondBanner: "secondStoreBanner",
        };


        const uploadResults = await this.imageService.uploadImages(images, uploadFolders);
        const storeImages = uploadResults.data;

        if (storeImages) {

            const repoResult = await this.repo!.insertWithRelations(
                storeDetailsDto,
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

                return super.responseData(
                    201,
                    false,
                    "Store was created successfully",
                    result
                );
            }

            return super.responseData(repoResult.type, true, repoResult.message!);
        }
        return super.responseData(500, true, "Error processing images");
    }

    public async createStore(storeDetailsDto: StoreDetailsDto) {
        const storeRepoResult = await this.repo!.getStoreWithVendorId(storeDetailsDto.vendorId!);
        const storeRepoResultError = this.handleRepoError(storeRepoResult);
        if (storeRepoResultError) return storeRepoResultError;

        const storeNameRepoResult = await this.repo!.getItemWithName(storeDetailsDto.name);
        const storeNameRepoResultError = this.handleRepoError(storeNameRepoResult);
        if (storeNameRepoResultError) return storeNameRepoResultError;

        const repoResult = await this.repo!.insert(storeDetailsDto);
        return !repoResult.error ? super.responseData(201, false, "Store was created successfully", repoResult) :
            super.responseData(repoResult.type, true, repoResult.message!);
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
        if (checkStoreImages.json.error) {
            if (!(await this.imageService.deleteFiles(banners))) return checkStoreImages;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }
        if (checkStoreImages.json.data.hasFirstBanner || checkStoreImages.json.data.hasSecondBanner) {
            if (!(await this.imageService.deleteFiles(banners))) return super.responseData(400, true, "A banner already exists");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const uploadFolders: Record<string, string> = {
            firstBanner: "firstStoreBanner",
            secondBanner: "secondStoreBanner"
        };

        const uploadResults = await this.imageService.uploadImages(banners, uploadFolders);
        const storeBanners = uploadResults.data;

        if (storeBanners) {
            const repoResult = await this.repo!.insertBanners(storeId, storeBanners?.firstBanner, storeBanners?.secondBanner);
            const firstStoreBannerUrl = storeBanners?.firstBanner?.imageUrl ?? null;
            const secondStoreBannerUrl = storeBanners?.secondBanner?.imageUrl ?? null;

            const error = this.handleRepoError(repoResult);
            if (error) return error;

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

        const storeDetails = storeDetailsRepoResult.data;
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
        if (checkStoreImages.json.error) {
            if (!(await this.imageService.deleteFiles([image]))) return checkStoreImages;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        if (checkStoreImages.json.data.hasStoreLogo) {
            if (!(await this.imageService.deleteFiles([image]))) return super.responseData(400, true, "A store logo already exists");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        return await this.imageService.uploadImage<StoreLogo>(
            image,
            storeId,
            new StoreLogo(),
            'storeLogo'
        );
    }

    public async uploadFirstBanner(image: Express.Multer.File, storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) {
            if (!(await this.imageService.deleteFiles([image]))) return checkStoreImages;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }
        if (checkStoreImages.json.data.hasFirstBanner) {
            if (!(await this.imageService.deleteFiles([image]))) return super.responseData(400, true, "A banner already exists");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        return await this.imageService.uploadImage<FirstBanner>(
            image,
            storeId,
            new FirstBanner(),
            'firstStoreBanner'
        );
    }

    public async uploadSecondBanner(image: Express.Multer.File, storeId: number) {
        const checkStoreImages = await this.checkStoreImages(storeId);
        if (checkStoreImages.json.error) {
            if (!(await this.imageService.deleteFiles([image]))) return checkStoreImages;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }
        if (checkStoreImages.json.data.hasSecondBanner) {
            if (!(await this.imageService.deleteFiles([image]))) return super.responseData(400, true, "A banner already exists");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        return await this.imageService.uploadImage<SecondBanner>(
            image,
            storeId,
            new SecondBanner(),
            'secondStoreBanner'
        );
    }

    public async getStoreAll(vendorId: number) {
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

    public async paginateStores(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginateStore(skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const totalRecords = repoResult.data.totalItems!;
        const pagination = getPagination(page, pageSize, totalRecords);
        super.setImageUrls(repoResult.data.items, this.imageDatas);

        return super.responseData(200, false, constants('200Stores')!, {
            data: repoResult.data.items,
            pagination
        });
    }

    public async getAllStores() {
        const repoResult = await this.repo!.getAllStoresAndRelations();
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        super.setImageUrls(repoResult.data, this.imageDatas);
        return super.responseData(200, false, constants('200Stores')!, repoResult.data);
    }

    public async delete1(vendorId: number) {
        const repoResult = await this.repo!.delete(vendorId);
        if (repoResult.error) {
            return super.responseData(repoResult.type!, true, repoResult.message!);
        }

        return super.responseData(200, false, "Store was deleted successfully");
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
            const cloudinaryResult = await this.imageService.deleteCloudinaryImages(publicIDs);
            for (const result of cloudinaryResult) {
                if (result.statusCode >= 500) return result;
            }
        }

        const repoResult = await this.repo!.delete(vendorId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, "Store was deleted successfully");
    }
}