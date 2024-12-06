import Service from "./Service";
import constants, { http, urls } from "../constants";
import { Customer as CustomerRepo, CustomerProfilePic } from "../repos";

export default class Customer extends Service<CustomerRepo> {

    private readonly profilePicRepo = new CustomerProfilePic();
    // private readonly cache = new VendorCache();

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
}