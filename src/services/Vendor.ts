import mime from "mime";
import Service from ".";
import constants, { http, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import {  processImage } from "../utils";
import { VendorCache } from "../cache";

export default class Vendor {

    private static readonly repo: VendorRepo = new VendorRepo();
    private static readonly profilePicRepo = new VendorProfilePicture();
    private static readonly cache = new VendorCache();

    public static async emailExists(email: string) {
        const emailExists = await Vendor.repo.getVendorWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "Email already exists" : null);
    }

    public static async getVendorWithEmail(email: string) {
        const repoResult = await Vendor.repo.getVendorWithEmail(email);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const vendor = repoResult.data;
        const statusCode = vendor ? 200 : 404;
        const error: boolean = vendor ? false : true;
        const message = error ? http("404")! : "Vendor has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return Service.responseData(statusCode, error, message, vendor);
    }

    public static async getVendorAll(vendorId: number, baseUrl: string) {
        const repoResult = await Vendor.repo.getVendorAndRelationsWithId(vendorId) as any;
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const baseImageUrl: string = urls("baseImageUrl")!;

            repoResult.data.profilePictureUrl = repoResult.data.profilePicture.length != 0 ? baseUrl + baseImageUrl + urls("vendorPic")!.split(":")[0] + vendorId : null;
            delete repoResult.data.profilePicture;
            delete repoResult.data.password;

            return Service.responseData(statusCode, error, "Vendor was retrieved successfully", repoResult.data);
        }

        return Service.responseData(statusCode, error, "Vendor was not found", repoResult.data);
    }


    public static async uploadProfilePicture(image: Express.Multer.File, vendorId: number, baseUrl: string) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const mimeType = mime.lookup(image.path);
        const repoResult = await Vendor.profilePicRepo.insert({
            mimeType: mimeType,
            picture: result.data,
            vendorId: vendorId
        });

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("vendorPic")!.split(":")[0] + vendorId;

        return repoResult ?
            Service.responseData(
                201,
                false,
                "Profile picture was created successfully",
                { imageUrl: imageUrl }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async updateFirstName(id: number, firstName: string) {
        const repoResult = await Vendor.repo.updateFirstName(id, firstName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public static async updateLastName(id: number, lastName: string) {
        const repoResult = await Vendor.repo.updateLastName(id, lastName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public static async updateEmail(id: number, email: string) {
        const emailExists = await Vendor.repo.getVendorWithEmail(email);
        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return Service.responseData(400, true, "Email already exists.");
        }

        const repoResult = await Vendor.repo.updateEmail(id, email);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public static async delete(email: string) {
        const repoResult = await Vendor.repo.delete(email);
        if (repoResult.error) {
            return Service.responseData(repoResult.type!, true, repoResult.message!);
        }

        const deleted = await Vendor.cache.delete(email);

        return deleted ?
            Service.responseData(200, false, "Vendor was deleted successfully") :
            Service.responseData(500, true, http('500')!);
    }

    public static async getProfilePic(id: any) {
        const repoResult = await Vendor.profilePicRepo.getImage(id);
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