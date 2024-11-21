import Token from "./Token";
import Authentication from "./Authentication";
import Vendor from "./Vendor";
import Email from "./Email";
import OTP from "./OTP";
import Store from "./Store";
import Admin from "./Admin";
import ImageService from "./Image";
import Seed from "./Seed";
import Role from "./Role";

export default class Service {

    constructor() { }

    public static responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }
}



export { Token, Authentication, Vendor, Email, OTP, Store, Admin, ImageService, Seed, Role };