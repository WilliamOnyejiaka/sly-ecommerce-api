import mime from "mime";
import Service from ".";
import constants, { http } from "../constants";
import { Admin as AdminRepo, Vendor as VendorRepo, VendorProfilePicture, AdminProfilePicture } from "../repos";
import { convertImage, Password, processImage } from "../utils";
import { env } from "../config";

export default class Admin {

    private static readonly profilePicRepo: AdminProfilePicture = new AdminProfilePicture();

    public static async defaultAdmin() {
        const email = env('defaultAdminEmail')!
        const emailExistsResult = await Admin.emailExists(email);

        if (emailExistsResult.json.error) {
            return Service.responseData(400, true, "This admin Already exists");
        }

        let defaultAminData = {
            firstName: "Super",
            lastName: "Admin",
            email: email,
            role: 'SUPER_ADMIN',
            createdBy: "self",
            password: env('defaultAdminPassword')!
        }
        const passwordHash = Password.hashPassword(defaultAminData.password, env("storedSalt")!);
        defaultAminData.password = passwordHash;

        const result = await AdminRepo.insert(defaultAminData);
        const error: boolean = result ? false : true
        const statusCode = error ? 500 : 201;
        const message: string = !error ? "Admin has been created successfully" : http("500")!;

        if (!error) {
            return Service.responseData(statusCode, error, message);
        }
        return Service.responseData(statusCode, error, message, result);
    }


    public static async emailExists(email: string) {
        const emailExists = await AdminRepo.getAdminWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? constants("400Email")! : null);
    }

    public static async uploadProfilePicture(image: Express.Multer.File, adminId: number) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const mimeType = await mime.lookup(image.path);
        const repoResult = await Admin.profilePicRepo.insert({
            mimeType: mimeType,
            picture: result.data!,
            adminId: adminId
        });

        return repoResult ?
            Service.responseData(
                201,
                false,
                constants('201ProfilePic')!
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }
}