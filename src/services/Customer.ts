import constants, { http, urls } from "../constants";
import { Customer as CustomerRepo } from "../repos";
import { CustomerCache } from "../cache";
import UserService from "./bases/UserService";

export default class Customer extends UserService<CustomerRepo, CustomerCache> {

    public constructor() {
        super(new CustomerRepo(), new CustomerCache());
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
        const repoResult = await this.repo!.deleteWithId(customerId); // ! TODO: add cloudinary delete
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(String(customerId));

        return deleted ?
            super.responseData(200, false, "Customer was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async getAllCustomers() {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        super.sanitizeUserImageItems(repoResult.data);
        return super.responseData(200, false, constants('200Customers')!, repoResult.data);
    }
}