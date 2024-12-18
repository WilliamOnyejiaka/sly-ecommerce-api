import Service from "./Service";
import constants, { http, urls } from "../constants";
import { Customer as CustomerRepo, CustomerProfilePic } from "../repos";
import { CustomerCache } from "../cache";

export default class Customer extends Service<CustomerRepo> {

    private readonly profilePicRepo = new CustomerProfilePic();
    private readonly cache: CustomerCache = new CustomerCache();

    public constructor() {
        super(new CustomerRepo());
    }

    public async getCustomerWithId(customerId: number) {
        return await super.getItemWithId(customerId, constants('200Customer'));
    }

    public async getCustomerAll(customerId: number, baseUrl: string) {
        const repoResult = await this.repo!.getCustomerAndProfilePictureWithId(customerId) as any;
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const baseImageUrl: string = urls("baseImageUrl")!;

            repoResult.data.profilePictureUrl = repoResult.data.CustomerProfilePic.length != 0 ? baseUrl + baseImageUrl + urls("customerPic")!.split(":")[0] + customerId : null;
            delete repoResult.data.CustomerProfilePic;
            delete repoResult.data.password;

            return super.responseData(statusCode, error, "Customer was retrieved successfully", repoResult.data);
        }

        return super.responseData(statusCode, error, "Customer was not found", repoResult.data);
    }

    private async toggleActiveStatus(id: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(id) : await this.repo!.updateActiveStatus(id, false);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }
        //Cache here
        const message = activate ? "Customer was activated successfully" : "Customer was deactivated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async activateCustomer(id: number) {
        return await this.toggleActiveStatus(id);
    }

    public async deActivateCustomer(id: number) {
        return await this.toggleActiveStatus(id, false);
    }

    public async delete(customerId: number) {
        const repoResult = await this.repo!.deleteWithId(customerId);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(String(customerId));

        return deleted ?
            super.responseData(200, false, "Customer was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async getAllCustomers() {
        const repoResult = await this.repo!.getAllCustomersAndProfilePictures();

        if (repoResult!.error) {
            return super.responseData(repoResult!.type, true, repoResult!.message);
        }

        // if (repoResult!.data) {
        //     const baseImageUrl: string = urls("baseImageUrl")!;

        //     repoResult!.data.profilePictureUrl = repoResult!.data.profilePicture.length != 0 ? baseUrl + baseImageUrl + urls("vendorPic")!.split(":")[0] + vendorId : null;
        //     delete repoResult!.data.profilePicture;
        repoResult!.data.forEach((item: any) => delete item.password);
        //     return super.responseData(statusCode, error, "Vendor was retrieved successfully", repoResult.data);
        // }

        // repoResult!.data.forEach((item: any) => delete item.password);
        return super.responseData(200, false, constants('200Vendors')!, repoResult!.data);
    }
}