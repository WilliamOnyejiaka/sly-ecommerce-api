import mime from "mime";
import Service from ".";
import { http } from "../constants";
import { convertImage } from "../utils";
import { Banner, StoreDetails, StoreLogo } from "./../repos";

export default class Store {

    public static async createStore(name: string, address: string, vendorId: number) {

        const repoResult = await StoreDetails.insert({
            name: name,
            address: address,
            vendorId: vendorId
        });

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
            error ? "Store details was retrieved successfully" : "Store was not found",
            repoResult.data
        );
    }

    public static async addStoreLogo(image: Express.Multer.File, storeId: number) {
        const filePath = image.path;
        const outputPath = `compressed/${image.filename}`;
        const mimeType = mime.lookup(filePath);
        const fileName = image.filename;

        const result = await convertImage(fileName, filePath, outputPath, mimeType);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const repoResult = await StoreLogo.insert({
            mimeType: mimeType,
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

    private static async processImage(image: Express.Multer.File) {
        const filePath = image.path;
        const outputPath = `compressed/${image.filename}`;
        const mimeType = mime.lookup(filePath);
        const fileName = image.filename;

        return await convertImage(fileName, filePath, outputPath, mimeType);
    }

    public static async addBanners(banners: Express.Multer.File[], storeId: number) {
        let base64Banners: any = {
            firstBanner: null,
            secondBanner: null
        };

        try {
            for (const banner of banners) {
                let mimeType = mime.lookup(banner.path);
                let base64Banner = await Store.processImage(banner);
                if (base64Banner.error) {
                    return Service.responseData(
                        500,
                        true,
                        http("500")!
                    );
                }

                if (banner.fieldname === 'firstBanner' || banner.fieldname === 'secondBanner') {
                    base64Banners[banner.fieldname] = {
                        mimeType: mimeType,
                        picture: base64Banner.data!
                    };
                }
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
}