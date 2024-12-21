import BaseService from "./bases/BaseService";
import constants, { http, urls } from "../constants";
import { getPagination } from "../utils";
import { FirstBanner, SecondBanner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";
import ImageService from "./Image";

export default class Store extends BaseService {

    private readonly storeRepo: StoreDetails = new StoreDetails();
    private readonly secondBannerRepo: SecondBanner = new SecondBanner();
    private readonly firstBannerRepo: FirstBanner = new FirstBanner();
    private readonly imageService: ImageService = new ImageService();


    public constructor() {
        super();
    }

    public async createStoreAll(
        storeDetailsDto: StoreDetailsDto,
        images: Express.Multer.File[]
    ) {
        const uploadFolders: Record<string, string> = {
            storeLogo: "storeLogo",
            firstBanner: "firstStoreBanner",
            secondBanner: "secondStoreBanner",
        };

        const uploadResults = await this.imageService.uploadImages(images, uploadFolders);
        const storeImages = uploadResults.data;

        if (storeImages) {

            const repoResult = await this.storeRepo.insertWithRelations(
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
        const repoResult = await this.storeRepo.insert(storeDetailsDto);
        return !repoResult.error ? super.responseData(201, false, "Store was created successfully", repoResult) :
            super.responseData(repoResult.type, true, repoResult.message!);
    }

    public async storeNameExists(name: string) {
        const nameExists = await this.storeRepo.getItemWithName(name);
        if (nameExists.error) {
            return super.responseData(nameExists.type, true, nameExists.message as string);
        }

        const statusCode = nameExists.data ? 400 : 200;
        const error: boolean = nameExists.data ? true : false;

        return super.responseData(statusCode, error, error ? "This name already exists" : null);
    }

    public async storeExists(vendorId: number) {
        const storeExists = await this.storeRepo.getStoreWithVendorId(vendorId);

        if (storeExists.error) {
            super.responseData(storeExists.type, true, storeExists.message!);
        }

        const statusCode = storeExists.data ? 400 : 200;
        const error: boolean = storeExists.data ? true : false;

        return super.responseData(statusCode, error, error ? "This vendor already has a store" : null);
    }

    public async getStoreWithId(id: number) {
        const repoResult = await this.storeRepo.getItemWithId(id);

        if (repoResult.error) {
            super.responseData(repoResult.type, true, repoResult.message!);
        }

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

        const uploadFolders: Record<string, string> = {
            firstBanner: "firstStoreBanner",
            secondBanner: "secondStoreBanner"
        };

        const uploadResults = await this.imageService.uploadImages(banners, uploadFolders);
        const storeBanners = uploadResults.data;
        const repoResult = await this.firstBannerRepo.insertImage({ ...storeBanners?.firstBanner, parentId: storeId });
        const repoResult1 = await this.secondBannerRepo.insertImage({ ...storeBanners?.secondBanner, parentId: storeId });
        const firstStoreBannerUrl = storeBanners?.firstBanner.imageUrl ?? null;
        const secondStoreBannerUrl = storeBanners?.secondBanner.imageUrl ?? null;

        return repoResult && repoResult1 ?
            super.responseData(
                201,
                false,
                "banners were created successfully",
                {
                    firstStoreBannerUrl: firstStoreBannerUrl,
                    secondStoreBannerUrl: secondStoreBannerUrl
                }
            ) :
            super.responseData(
                500,
                true,
                http("500")!,
            );
    }


    // public async uploadBanners(banners: Express.Multer.File[], storeId: number) { // ! TODO: update this method
    //     let storeBanners: any = {
    //         firstBanner: null,
    //         secondBanner: null
    //     };

    //     const uploadFolders: Record<string, string > = {
    //         firstBanner: "firstStoreBanner",
    //         secondBanner: "secondStoreBanner"
    //     };

    //     for (const banner of banners) {
    //         const fieldName: string = banner.fieldname;
    //         const uploadFolder = uploadFolders[fieldName];
    //         let uploadResult = await this.imageService.processAndUpload(banner, uploadFolder);
    //         if (uploadResult.json.error) {
    //             return uploadResult;
    //         }
    //         storeBanners[fieldName] = {
    //             mimeType: uploadResult.json.data.imageData.format,
    //             imageUrl: uploadResult.json.data.url,
    //             publicId: uploadResult.json.data.imageData.public_id,
    //             size: uploadResult.json.data.imageData.bytes,
    //             parentId: storeId
    //         };
    //     }

    //     const repoResult = await this.firstBannerRepo.insertImage(storeBanners.firstBanner);
    //     const repoResult1 = await this.secondBannerRepo.insertImage(storeBanners.secondBanner);
    //     const firstStoreBannerUrl = storeBanners.firstBanner;
    //     const secondStoreBannerUrl = storeBanners.secondBanner;

    //     return repoResult && repoResult1 ?
    //         super.responseData(
    //             201,
    //             false,
    //             "banners were created successfully",
    //             {
    //                 firstStoreBannerUrl: firstStoreBannerUrl,
    //                 secondStoreBannerUrl: secondStoreBannerUrl
    //             }
    //         ) :
    //         super.responseData(
    //             500,
    //             true,
    //             http("500")!,
    //         );
    // }

    public async getStoreAll(vendorId: number, baseUrl: string) {
        const repoResult = await this.storeRepo.getStoreAndRelationsWithVendorId(vendorId);
        if (repoResult.error) {
            super.responseData(repoResult.type, true, repoResult.message!);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const baseImageUrl: string = urls("baseImageUrl")!;
            const storeId = repoResult.data.id;
            repoResult.data.storeLogoUrl = repoResult.data.storeLogo.length != 0 ? baseUrl + baseImageUrl + urls("storeLogo")!.split(":")[0] + storeId : null;
            repoResult.data.firstStoreBannerUrl = repoResult.data.firstStoreBanner.length != 0 ? baseUrl + baseImageUrl + urls("firstBanner")!.split(":")[0] + storeId : null;
            repoResult.data.secondBannerUrl = repoResult.data.secondStoreBanner.length != 0 ? baseUrl + baseImageUrl + urls("secondBanner")!.split(":")[0] + storeId : null;

            delete repoResult.data.storeLogo;
            delete repoResult.data.firstStoreBanner;
            delete repoResult.data.secondStoreBanner;

            return super.responseData(statusCode, error, "Store was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "This vendor does not have a store", repoResult.data);
    }

    public async delete(vendorId: number) {
        const repoResult = await this.storeRepo.delete(vendorId);
        if (repoResult.error) {
            return super.responseData(repoResult.type!, true, repoResult.message!);
        }

        return super.responseData(200, false, "Store was deleted successfully");
    }

    private static setUrls(data: any, baseUrl: string): void {
        for (const item of data) {
            item.storeLogoUrl = item.storeLogo.length != 0 ? baseUrl + "baseImageUrl" + urls("storeLogo")!.split(":")[0] + item.id : null;
            item.firstStoreBannerUrl = item.firstStoreBanner.length != 0 ? baseUrl + "baseImageUrl" + urls("firstBanner")!.split(":")[0] + item.id : null;
            item.secondBannerUrl = item.secondStoreBanner.length != 0 ? baseUrl + "baseImageUrl" + urls("secondBanner")!.split(":")[0] + item.id : null;

            delete item.storeLogo;
            delete item.firstStoreBanner;
            delete item.secondStoreBanner;
        }
    }

    public async paginateStores(page: number, pageSize: number, baseUrl: string) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.storeRepo.paginateStore(skip, take);

        Store.setUrls(repoResult.data.items, baseUrl);

        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const totalRecords = repoResult.data.totalItems!;

        const pagination = getPagination(page, pageSize, totalRecords);

        return super.responseData(200, false, constants('200Stores')!, {
            data: repoResult.data.items,
            pagination
        });
    }

    public async getAllStores(baseUrl: string) {
        const repoResult = await this.storeRepo.getAllStoresAndRelations();

        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        Store.setUrls(repoResult.data, baseUrl);

        return super.responseData(200, false, constants('200Stores')!, repoResult.data);
    }
}