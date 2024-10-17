import { Token } from ".";
import { Vendor } from "../repos";
import { Password } from "../utils";
import { env } from "../config";
import {IVendor} from "../types";

class Authentication {


    public static async vendorSignUp(signUpData: IVendor) {
        const passwordHash = Password.hashPassword(signUpData.password,env("storedSalt")!);
        signUpData.password = passwordHash;

        const result = await Vendor.insert(signUpData);
        const statusCode = result ? 200 : 500;

        return {
            statusCode: statusCode,
            json: {
                error: result ? true : false,
                message: result ? "user has been created successfully" : "something went wrong",
                data: {
                    user: result,
                    // token: userData ? Token.createToken(userData) : null
                }
            }
        };
    }

    public static async emailExists(email: string){
        const emailExists = await Vendor.getVendorWithEmail(email);
        return {
            statusCode: 400,
            json: {
                error: emailExists ? true : false,
                message: emailExists ? "email already exists" : "something went wrong",
                data: {}
            }
        };
    }
}

export default Authentication;