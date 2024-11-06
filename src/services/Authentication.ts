import Service, { OTP, Token } from ".";
import { Admin, Vendor } from "../repos";
import { Password } from "../utils";
import { env } from "../config";
import VendorDto from "../types/dtos";
import constants, { http } from "../constants";
import { VendorCache } from "../cache";
class Authentication {

    private static readonly storedSalt: string = env("storedSalt")!;
    private static readonly vendorRepo: Vendor = new Vendor();
    private static readonly vendorCache: VendorCache = new VendorCache();

    public static async vendorSignUp(vendorDto: VendorDto) {
        const passwordHash: string = Password.hashPassword(vendorDto.password!, Authentication.storedSalt);
        vendorDto.password = passwordHash;

        const result = await Authentication.vendorRepo.insert(vendorDto);
        const error: boolean = result ? false : true
        const statusCode = error ? 500 : 201;
        const message: string = !error ? "Vendor has been created successfully" : http("500")!;

        if (!error) {
            delete (result as VendorDto).password;
            const cacheSuccessful = await Authentication.vendorCache.set(
                (result as VendorDto).email,
                result as VendorDto
            );
            return cacheSuccessful ? Service.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, result, ["vendor"]),
                vendor: result
            }) : Service.responseData(statusCode, error, message);
        }
        return Service.responseData(statusCode, error, message, result);
    }

    public static async adminSignUp(signUpData: any) {
        const passwordHash = Password.hashPassword(signUpData.password, Authentication.storedSalt);
        signUpData.password = passwordHash;

        const result = await Admin.insert(signUpData);
        const error: boolean = result ? false : true
        const statusCode = error ? 500 : 201;
        const message: string = !error ? "Admin has been created successfully" : http("500")!;

        if (!error) {
            delete (result as any).password;
            return Service.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, result, []),
                vendor: result
            });
        }
        return Service.responseData(statusCode, error, message, result);
    }

    public static async vendorLogin(email: string, password: string) {
        const repoResult = await Authentication.vendorRepo.getVendorWithEmail(email);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500")!);
        }

        const vendor: VendorDto = (repoResult.data as VendorDto);

        if (vendor) {
            const hashedPassword = vendor.password
            const validPassword = Password.compare(password, hashedPassword!, Authentication.storedSalt);

            if (validPassword) {
                delete vendor.password;
                const cacheSuccessful = await Authentication.vendorCache.set(
                    vendor.email,
                    vendor
                );

                return cacheSuccessful ? Service.responseData(200, false, "login successful", {
                    token: Token.createToken(env('tokenSecret')!, vendor, ["vendor"]),
                    vendor: vendor
                }) : Service.responseData(500, true, http('500')!);
            }
            return Service.responseData(400, true, "Invalid password");
        }
        return Service.responseData(404, true, constants("404Vendor")!);
    }

    public static async vendorEmailOTP(email: string) {
        const repoResult = await Authentication.vendorRepo.getVendorWithEmail(email);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500")!);
        }

        const vendor = repoResult.data;

        if (vendor) {
            const vendorName = (vendor as VendorDto).firstName + " " + (vendor as VendorDto).lastName;
            const otpService = new OTP((vendor as VendorDto).email, { name: vendorName });
            const otpServiceResult = await otpService.send();
            return Service.responseData(otpServiceResult.statusCode, otpServiceResult.json.error, otpServiceResult.json.message);
        }

        return Service.responseData(404, true, constants("404Vendor")!);
    }


    public static async vendorEmailVerification(vendorEmail: string, otpCode: string) {
        const otp = new OTP(vendorEmail);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) {
            return otpServiceResult;
        }

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updated = await Authentication.vendorRepo.updateVerifiedStatus(vendorEmail);

        if (updated.error) {
            return Service.responseData(500, true, http("500")!);
        }

        if (otpServiceResult.json.error){
            return otpServiceResult;
        }

        const repoResult = await Authentication.vendorRepo.getVendorWithEmail(vendorEmail);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500")!);
        }

        const vendor: VendorDto = (repoResult.data as VendorDto);

        if (vendor) {
            delete vendor.password;
            const cacheSuccessful = await Authentication.vendorCache.set(
                vendor.email,
                vendor
            );

            return cacheSuccessful ? Service.responseData(200, false, otpServiceResult.json.message , {
                token: Token.createToken(env('tokenSecret')!, vendor, ["vendor"]),
                vendor: vendor
            }) : Service.responseData(500, true, http('500')!);
        }
        return Service.responseData(404, true, constants("404Vendor")!);
    }
}

export default Authentication;