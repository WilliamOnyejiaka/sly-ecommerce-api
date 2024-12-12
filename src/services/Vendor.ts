import Service from "./Service";
import constants, { http, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { getPagination } from "../utils";
import { VendorCache } from "../cache";

export default class Vendor extends Service<VendorRepo> {

    private readonly profilePicRepo = new VendorProfilePicture();
    private readonly cache = new VendorCache();

    public constructor() {
        super(new VendorRepo());
    }

    public async getVendorWithEmail(email: string) {
        const repoResult = await this.repo!.getVendorWithEmail(email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const vendor = repoResult.data;
        const statusCode = vendor ? 200 : 404;
        const error: boolean = repoResult.error;
        const message = error ? http("404")! : "Vendor has been retrieved";

        if (!error) {
            delete repoResult.data.password;
        }

        return super.responseData(statusCode, error, message, vendor);
    }

    public async getVendorAll(vendorId: number, baseUrl: string) {
        const repoResult = await this.repo!.getVendorAndRelationsWithId(vendorId);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.error;

        if (repoResult.data) {
            const baseImageUrl: string = urls("baseImageUrl")!;

            repoResult.data.profilePictureUrl = repoResult.data.profilePicture.length != 0 ? baseUrl + baseImageUrl + urls("vendorPic")!.split(":")[0] + vendorId : null;
            delete repoResult.data.profilePicture;
            delete repoResult.data.password;

            return super.responseData(statusCode, error, "Vendor was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "Vendor was not found", repoResult.data);
    }

    public async updateFirstName(id: number, firstName: string) {
        const repoResult = await this.repo!.updateFirstName(id, firstName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true,repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateLastName(id: number, lastName: string) {
        const repoResult = await this.repo!.updateLastName(id, lastName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true,repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateEmail(id: number, email: string) {
        const emailExists = await this.repo!.getVendorWithEmail(email);
        if (emailExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return super.responseData(400, true, "Email already exists.");
        }

        const repoResult = await this.repo!.updateEmail(id, email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true,repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async delete(vendorId: number) {
        const repoResult = await this.repo!.deleteWithId(vendorId);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(String(vendorId));

        return deleted ?
            super.responseData(200, false, "Vendor was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async paginateVendors(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo!.paginate(skip, take);

        if (repoResult.error) {
            return super.responseData(repoResult.type, true,repoResult.message!);
        }

        const totalRecords = repoResult.data.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        repoResult.data.items.forEach((item: any) => delete item.password);

        return super.responseData(200, false, constants('200Vendors')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async getAllVendors() {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return super.responseData(repoResult.type, true,repoResult.message!);
        }

        repoResult.data.forEach((item: any) => delete item.password);
        return super.responseData(200, false, constants('200Vendors')!, repoResult.data);
    }

    private async toggleActiveStatus(id: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(id, true) : await this.repo!.updateActiveStatus(id, false);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }
        //Cache here
        const message = activate ? "Vendor was activated successfully" : "Vendor was deactivated successfully";
        return super.responseData(200, false, message,repoResult.data);
    }

    public async activateVendor(id: number){
        return await this.toggleActiveStatus(id);
    }

    public async deActivateVendor(id: number) {
        return await this.toggleActiveStatus(id, false);
    }
}

