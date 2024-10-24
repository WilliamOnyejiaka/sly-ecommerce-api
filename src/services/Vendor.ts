import mime from "mime";
import Service from ".";
import { http } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { convertImage } from "../utils";

export default class Vendor {

    public static async emailExists(email: string) {
        const emailExists = await VendorRepo.getVendorWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "Email already exists" : null);
    }

    public static async getVendorWithEmail(email: string) {
        const repoResult = await VendorRepo.getVendorWithEmail(email);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const vendor = repoResult.data;
        const statusCode = vendor ? 200 : 404;
        const error: boolean = vendor ? false : true;
        const message = error ? http("404")! : "Vendor has been retrieve";

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
}