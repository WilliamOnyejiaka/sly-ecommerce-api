import BaseService from "../../services/bases/BaseService";

export default class BaseFacade {

    protected readonly service: BaseService = new BaseService();

    // public static readonly UserType = class {
    //     static readonly Admin = "admin";
    //     static readonly Vendor = "vendor";
    //     static readonly Customer = "customer";
    // }


    protected handleServiceError(serviceResult: any) {
        if (serviceResult.json.error) {
            return serviceResult;
        }
        return null;
    }

}