import Service, { OTP, Token } from ".";
import { Vendor } from "../repos";
import { Password } from "../utils";
import { env } from "../config";
import { IVendor } from "../types";
import constants, { http } from "../constants";
import { json } from "stream/consumers";

class Authentication {

    private static readonly storedSalt: string = env("storedSalt")!;

    public static async vendorSignUp(signUpData: IVendor) {
        const passwordHash = Password.hashPassword(signUpData.password, Authentication.storedSalt);
        signUpData.password = passwordHash;

        const result = await Vendor.insert(signUpData);
        const error: boolean = result ? false : true
        const statusCode = error ? 500 : 201;
        const message: string = !error ? "user has been created successfully" : http("500")!;

        if (!error) {
            delete (result as any).password;
            return Service.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, result),
                vendor: result
            });
        }
        return Service.responseData(statusCode, error, message, result);
    }

    public static async vendorLogin(email: string, password: string) {
        const repoResult = await Vendor.getVendorWithEmail(email);

        if (repoResult.error) {
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
            return Service.responseData(400, true, "Invalid password");
        }
        return Service.responseData(404, true, constants("404Vendor")!);
    }

    public static async vendorEmailOTP(email: string) {
        const repoResult = await Vendor.getVendorWithEmail(email);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500")!);
        }

        const vendor = repoResult.data;

        if (vendor) {
            const vendorName = (vendor as IVendor).firstName + " " + (vendor as IVendor).lastName;
            const otpService = new OTP((vendor as IVendor).email, { name: vendorName });
            const otpServiceResult = await otpService.send();
            return Service.responseData(otpServiceResult.statusCode, otpServiceResult.json.error, otpServiceResult.json.message);
        }

        return Service.responseData(404, true, constants("404Vendor")!);
    }


    public static async vendorEmailVerification(vendorEmail: string, otpCode: string) {
        const otp = new OTP(vendorEmail);
        const otpServiceResult = await otp.confirmOTP(otpCode);
        if (otpServiceResult.json.error) {
            return Service.responseData(
                otpServiceResult.statusCode,
                true,
                otpServiceResult.json.message
            );

        }

        return Service.responseData(
            otpServiceResult.statusCode,
            otpServiceResult.json.error,
            otpServiceResult.json.message
        );


    }
}

export default Authentication;