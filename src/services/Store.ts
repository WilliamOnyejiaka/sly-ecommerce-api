import mime from "mime";
import Service from "./Service";
import constants, { http, urls } from "../constants";
import { getPagination, processImage } from "../utils";
import { Banner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";
import { PictureData } from "../interfaces/PictureData";

export default class Store extends Service {

    private readonly storeLogoRepo: StoreLogo = new StoreLogo();
    private readonly bannerRepo: Banner = new Banner();
    private readonly storeRepo: StoreDetails = new StoreDetails();

    public constructor() {
        super();
    }

    public async createStoreAll(storeDetailsDto: StoreDetailsDto, images: Express.Multer.File[], baseUrl: string) {

        let base64Images: any = {
            firstBanner: null,
            secondBanner: null,
            storeLogo: null
        };

        try {
            for (const image of images) {
                let mimeType = mime.lookup(image.path);
                let base64Image = await processImage(image);
                if (base64Image.error) {
                    return super.responseData(
                        500,
                        true,
                        http("500")!
                    );
                }
                base64Images[image.fieldname] = {
                    mimeType: mimeType,
                    picture: base64Image.data!,
                };
            }
        } catch (error) {
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await this.storeRepo.insertWithRelations(
            storeDetailsDto,
            base64Images.storeLogo as PictureData,
            base64Images.firstBanner as PictureData,
            base64Images.secondBanner as PictureData
        );

        if (repoResult) {
            const storeId: string = (repoResult as any).id;
            const baseImageUrl: string = urls("baseImageUrl")!;

            (repoResult as any)['storeLogoUrl'] =
                base64Images.storeLogo ? baseUrl + baseImageUrl + urls("storeLogo")!.split(":")[0] + storeId : null;
            (repoResult as any)['firstBannerUrl'] =
                base64Images.firstBanner ? baseUrl + baseImageUrl + urls("firstBanner")!.split(":")[0] + storeId : null;
            (repoResult as any)['secondBannerUrl'] =
                base64Images.secondBanner ? baseUrl + baseImageUrl + urls("secondBanner")!.split(":")[0] + storeId : null;

            return super.responseData(
                201,
                false,
                "Store was created successfully",
                repoResult
            );
        }

        return super.responseData(500, true, http("500")!);
    }

    public async createStore(storeDetailsDto: StoreDetailsDto) {

        const repoResult = await this.storeRepo.insert(storeDetailsDto);

        return repoResult ? super.responseData(201, false, "Store was created successfully", repoResult) :
            super.responseData(500, true, http("500")!);
    }

    public async storeNameExists(name: string) {
        const nameExists = await this.storeRepo.getStoreWithName(name);

        if (nameExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const statusCode = nameExists.data ? 400 : 200;
        const error: boolean = nameExists.data ? true : false;

        return super.responseData(statusCode, error, error ? "This name already exists" : null);
    }

    public async storeExists(vendorId: number) {
        const storeExists = await this.storeRepo.getStoreWithVendorId(vendorId);

        if (storeExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const statusCode = storeExists.data ? 400 : 200;
        const error: boolean = storeExists.data ? true : false;

        return super.responseData(statusCode, error, error ? "This vendor already has a store" : null);
    }

    public async getStoreWithId(id: number) {
        const repoResult = await this.storeRepo.getStoreWithId(id);

        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
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

    public async uploadStoreLogo(image: Express.Multer.File, storeId: number, baseUrl: string) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await this.storeLogoRepo.insert({
            mimeType: mime.lookup(image.path),
            picture: result.data,
            storeId: storeId
        });

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("storeLogo")!.split(":")[0] + storeId;

        return repoResult ?
            super.responseData(
                201,
                false,
                "store logo was created successfully",
                { imageUrl: imageUrl }
            ) :
            super.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public async uploadBanners(banners: Express.Multer.File[], storeId: number, baseUrl: string) {
        let base64Banners: any = {
            firstBanner: null,
            secondBanner: null
        };

        try {
            for (const banner of banners) {
                let mimeType = mime.lookup(banner.path);
                let base64Banner = await processImage(banner);
                if (base64Banner.error) {
                    return super.responseData(
                        500,
                        true,
                        http("500")!
                    );
                }
                base64Banners[banner.fieldname] = {
                    mimeType: mimeType,
                    picture: base64Banner.data!,
                    storeId: storeId
                };
            }
        } catch (error) {
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await Banner.insertFirstStoreBanner(base64Banners.firstBanner);
        const repoResult1 = await Banner.insertSecondStoreBanner(base64Banners.secondBanner);
        const firstStoreBannerUrl = baseUrl + urls("baseImageUrl")! + urls("firstBanner")!.split(":")[0] + storeId;
        const secondStoreBannerUrl = baseUrl + urls("baseImageUrl")! + urls("secondBanner")!.split(":")[0] + storeId;

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

    public async getStoreAll(vendorId: number, baseUrl: string) {
        const repoResult = await this.storeRepo.getStoreAndRelationsWithVendorId(vendorId) as any;
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
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

        Store.setUrls(repoResult.data, baseUrl);

        if (repoResult.error) {
            return super.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems!;

        const pagination = getPagination(page, pageSize, totalRecords);

        return super.responseData(200, false, constants('200Stores')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async getAllStores(baseUrl: string) {
        const repoResult = await this.storeRepo.getAllStores();

        if (repoResult.error) {
            return super.responseData(500, true, http('500')!);
        }
        Store.setUrls(repoResult.data, baseUrl);

        return super.responseData(200, false, constants('200Stores')!, repoResult.data);
    }
}