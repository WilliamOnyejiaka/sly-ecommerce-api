import Service from ".";
import { http } from "../constants";
import { Vendor as VendorRepo} from "../repos";


export default class Vendor {

    public static async emailExists(email: string){
        const emailExists = await VendorRepo.getVendorWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "email already exists" : null);
    }

    public static async businessNameExists(businessName: string) {
        const businessNameExists = await VendorRepo.getVendorWithBusinessName(businessName);

        if (businessNameExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = businessNameExists.data ? 400 : 200;
        const error: boolean = businessNameExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? "business already exists" : null);
    }
}