import mime from "mime";
import Service from ".";
import { http } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { convertImage } from "../utils";

export default class Vendor {

    private static readonly repo: VendorRepo = new VendorRepo();;

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

        return Service.responseData(statusCode, error, message, vendor);
    }

    public static async addProfilePicture(image: Express.Multer.File, vendorId: number) {
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

        const repoResult = await VendorProfilePicture.insert({
            mimeType: mimeType,
            picture: result.data,
            vendorId: vendorId
        });

        return repoResult ?
            Service.responseData(
                201,
                false,
                "profile picture was created successfully"
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }

    public static async updateFirstName(id: number,firstName: string) {
        const repoResult = await Vendor.repo.updateFirstName(id,firstName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : "Vendor has been updated successfully";

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public static async updateLastName(id: number, lastName: string) {
        const repoResult = await Vendor.repo.updateLastName(id, lastName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : "Vendor has been updated successfully";

        return Service.responseData(statusCode, !repoResult.updated, message);
    }
}