import mime from "mime";
import Service from ".";
import { http } from "../constants";
import { convertImage, processImage } from "../utils";
import { Banner, StoreDetails, StoreLogo } from "./../repos";
import { StoreDetailsDto } from "../types/dtos";

export default class Store {

    private static readonly storeLogoRepo: StoreLogo = new StoreLogo();

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

    public static async uploadStoreLogo(image: Express.Multer.File, storeId: number) {
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

        return repoResult ?
            Service.responseData(
                201,
                false,
                "store logo was created successfully"
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async uploadBanners(banners: Express.Multer.File[], storeId: number) {
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
        return repoResult && repoResult1 ?
            Service.responseData(
                201,
                false,
                "banners were created successfully"
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async getStoreLogo(storeId: any) {
        const repoResult = await Store.storeLogoRepo.getStoreLogo(storeId);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        // if(repoResult.data){
        //     const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

        //     return Service.responseData(statusCode, error, null,{
        //         imageBuffer: imageBuffer,
        //         bufferLength: imageBuffer.length,
        //         mimeType: (repoResult.data as any).mimeType
        //     });
        // }

        return Service.responseData(statusCode, error, null, repoResult.data);

    }
}