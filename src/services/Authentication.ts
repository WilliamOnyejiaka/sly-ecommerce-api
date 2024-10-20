import Service, { Token } from ".";
import { Vendor } from "../repos";
import { Password } from "../utils";
import { env } from "../config";
import { IVendor } from "../types";
import { http } from "../constants";

class Authentication {

    private static readonly storedSalt: string = env("storedSalt")!;

    public static async vendorSignUp(signUpData: IVendor) {
        const passwordHash = Password.hashPassword(signUpData.password, Authentication.storedSalt);
        signUpData.password = passwordHash;

        const result = await Vendor.insert(signUpData);
        const error: boolean = result ? false : true
        const statusCode = error ? 500 : 201;
        const message: string=  error ? "user has been created successfully" : http("500")!;

        if(!error){
            delete (result as any).password;
            return Service.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!,result),
                vendor: result
            });
        }
        return Service.responseData(statusCode, error, message, result);
    }

    public static async vendorLogin(email: string,password: string){
        const repoResult = await Vendor.getVendorWithEmail(email);

        if(repoResult.error){
            return Service.responseData(500, true, http("500")!);
        }

        const vendor: IVendor = (repoResult.data as IVendor);
        if (vendor) {
            const hashedPassword = vendor.password
            const validPassword = Password.compare(password, hashedPassword, Authentication.storedSalt);
            console.log(validPassword, password, hashedPassword);
            
            if (validPassword) {
                delete vendor.password;
                return Service.responseData(200, false, "login successful", {
                    token: Token.createToken(env('tokenSecret')!, vendor.data),
                    vendor: vendor
                });
            }
            return Service.responseData(400, true, "invalid password");
        }
        return Service.responseData(404, true, "vendor was not found");
    }
}

export default Authentication;