import constants, { http, HttpStatus, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { VendorCache } from "../cache";
import UserService from "./bases/UserService";

export default class Vendor extends UserService<VendorRepo, VendorCache, VendorProfilePicture> {

    public constructor() {
        super(new VendorRepo(), new VendorCache(), new VendorProfilePicture(), 'vendorProfilePic');
    }

    public async updateFirstName(id: number, firstName: string) {
        const repoResult = await this.repo!.updateFirstName(id, firstName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateLastName(id: number, lastName: string) {
        const repoResult = await this.repo!.updateLastName(id, lastName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateEmail(id: number, email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);
        if (emailExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return super.responseData(400, true, "Email already exists.");
        }

        const repoResult = await this.repo!.updateEmail(id, email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    // public async delete(vendorId: number) {
    //     const repoResult = await this.repo!.deleteWithId(vendorId); // ! TODO: add cloudinary image delete
    //     const errorResponse = this.handleRepoError(repoResult);
    //     if (errorResponse) return errorResponse;

    //     const deleted = await this.cache.delete(String(vendorId));

    //     return deleted ?
    //         super.responseData(200, false, "Vendor was deleted successfully") :
    //         super.responseData(500, true, http('500')!);
    // }

    private async toggleActiveStatus(id: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(id, true) : await this.repo!.updateActiveStatus(id, false);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        //Cache here
        const message = activate ? "Vendor was activated successfully" : "Vendor was deactivated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async activateVendor(id: number) {
        return await this.toggleActiveStatus(id);
    }

    public async deActivateVendor(id: number) {
        return await this.toggleActiveStatus(id, false);
    }
}

