import mime from "mime";
import Service from ".";
import { http, urls } from "../constants";
import { convertImage, processImage } from "../utils";
import { Banner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";
import { PictureData } from "../interfaces/PictureData";

export default class Store {

    private static readonly storeLogoRepo: StoreLogo = new StoreLogo();
    private static readonly bannerRepo: Banner = new Banner();


    public static async createStoreAll(storeDetailsDto: StoreDetailsDto, images: Express.Multer.File[], baseUrl: string) {

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
                    return Service.responseData(
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
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await StoreDetails.insertWithRelations(
            storeDetailsDto,
            base64Images.storeLogo as PictureData,
            base64Images.firstBanner as PictureData,
            base64Images.secondBanner as PictureData
        );

        if (repoResult) {
            const storeId: string = (repoResult as any).id;
            const baseImageUrl: string = urls("baseImageUrl")!;

            (repoResult as any)['storeLogoUrl'] = baseUrl + baseImageUrl + urls("storeLogo")!.split(":")[0] + storeId;
            (repoResult as any)['firstBannerUrl'] = baseUrl + baseImageUrl + urls("firstBanner")!.split(":")[0] + storeId;
            (repoResult as any)['secondBannerUrl'] = baseUrl + baseImageUrl + urls("secondBanner")!.split(":")[0] + storeId;

            return Service.responseData(201, false, "Store was created successfully", repoResult);
        }

        return Service.responseData(500, true, http("500")!);
    }

    public static async createStore(storeDetailsDto: StoreDetailsDto) {

        const repoResult = await StoreDetails.insert(storeDetailsDto);

        return repoResult ? Service.responseData(201, false, "Store was created successfully", repoResult) :
            Service.responseData(500, true, http("500")!);
    }

    public static async storeNameExists(name: string) {
        const nameExists = await StoreDetails.getStoreWithName(name);

        if (nameExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = nameExists.data ? 400 : 200;
        const error: boolean = nameExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "This name already exists" : null);
    }

    public static async storeExists(vendorId: number) {
        const storeExists = await StoreDetails.getStoreWithVendorId(vendorId);

        if (storeExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = storeExists.data ? 400 : 200;
        const error: boolean = storeExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "This vendor already has a store" : null);
    }

    public static async getStoreWithId(id: number) {
        const repoResult = await StoreDetails.getStoreWithId(id);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        return Service.responseData(
            statusCode,
            error,
            error ? "Store was not found" : "Store details was retrieved successfully",
            repoResult.data
        );
    }

    public static async uploadStoreLogo(image: Express.Multer.File, storeId: number, baseUrl: string) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await Store.storeLogoRepo.insert({
            mimeType: mime.lookup(image.path),
            picture: result.data,
            storeId: storeId
        });

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("storeLogo")!.split(":")[0] + storeId;

        return repoResult ?
            Service.responseData(
                201,
                false,
                "store logo was created successfully",
                { imageUrl: imageUrl }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async uploadBanners(banners: Express.Multer.File[], storeId: number, baseUrl: string) {
        let base64Banners: any = {
            firstBanner: null,
            secondBanner: null
        };

        try {
            for (const banner of banners) {
                let mimeType = mime.lookup(banner.path);
                let base64Banner = await processImage(banner);
                if (base64Banner.error) {
                    return Service.responseData(
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
            return Service.responseData(
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
            Service.responseData(
                201,
                false,
                "banners were created successfully",
                {
                    firstStoreBannerUrl: firstStoreBannerUrl,
                    secondStoreBannerUrl: secondStoreBannerUrl
                }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async getStoreLogo(storeId: any) {
        const repoResult = await Store.storeLogoRepo.getImage(storeId);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

            return Service.responseData(statusCode, error, null, {
                imageBuffer: imageBuffer,
                bufferLength: imageBuffer.length,
                mimeType: (repoResult.data as any).mimeType
            });
        }

        return Service.responseData(statusCode, error, null, repoResult.data);
    }

    public static async getFirstStoreBanner(storeId: any) {
        const repoResult = await Store.bannerRepo.getFirstStoreBanner(storeId)
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

            return Service.responseData(statusCode, error, null, {
                imageBuffer: imageBuffer,
                bufferLength: imageBuffer.length,
                mimeType: (repoResult.data as any).mimeType
            });
        }

        return Service.responseData(statusCode, error, null, repoResult.data);
    }

    public static async getSecondStoreBanner(storeId: any) {
        const repoResult = await Store.bannerRepo.getSecondStoreBanner(storeId)
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

            return Service.responseData(statusCode, error, null, {
                imageBuffer: imageBuffer,
                bufferLength: imageBuffer.length,
                mimeType: (repoResult.data as any).mimeType
            });
        }

        return Service.responseData(statusCode, error, null, repoResult.data);
    }
}