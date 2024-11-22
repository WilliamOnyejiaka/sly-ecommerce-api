import mime from "mime";
import Service from ".";
import constants, { http, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import {  getPagination, processImage } from "../utils";
import { VendorCache } from "../cache";

export default class Vendor {

    private readonly repo: VendorRepo = new VendorRepo();
    private readonly profilePicRepo = new VendorProfilePicture();
    private readonly cache = new VendorCache();

    public async emailExists(email: string) {
        const emailExists = await this.repo.getVendorWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "Email already exists" : null);
    }

    public async getVendorWithEmail(email: string) {
        const repoResult = await this.repo.getVendorWithEmail(email);
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

    public async getVendorAll(vendorId: number, baseUrl: string) {
        const repoResult = await this.repo.getVendorAndRelationsWithId(vendorId) as any;
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


    public async uploadProfilePicture(image: Express.Multer.File, vendorId: number, baseUrl: string) {
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
        const repoResult = await this.profilePicRepo.insert({
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

    public async updateFirstName(id: number, firstName: string) {
        const repoResult = await this.repo.updateFirstName(id, firstName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public  async updateLastName(id: number, lastName: string) {
        const repoResult = await this.repo.updateLastName(id, lastName);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public async updateEmail(id: number, email: string) {
        const emailExists = await this.repo.getVendorWithEmail(email);
        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return Service.responseData(400, true, "Email already exists.");
        }

        const repoResult = await this.repo.updateEmail(id, email);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.updated ? 200 : 500;
        const message = !repoResult.updated ? http("500")! : constants('updatedVendor')!;

        return Service.responseData(statusCode, !repoResult.updated, message);
    }

    public async delete(vendorId: number) {
        const repoResult = await this.repo.delete(vendorId);
        if (repoResult.error) {
            return Service.responseData(repoResult.type!, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(String(vendorId));

        return deleted ?
            Service.responseData(200, false, "Vendor was deleted successfully") :
            Service.responseData(500, true, http('500')!);
    }

    public async getProfilePic(id: any) {
        const repoResult = await this.profilePicRepo.getImage(id);
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

    public async paginateVendors(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo.paginateVendors(skip, take);

        console.log("here");
        

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return Service.responseData(200, false, constants('200Vendors')!, {
            data: repoResult.data,
            pagination
        });
    }
    public async getAllVendors() {
        const repoResult = await this.repo.getAllVendors();

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, false, constants('200Vendors')!, repoResult.data);
    }
}