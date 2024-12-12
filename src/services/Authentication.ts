import { OTP, Token } from ".";
import { Admin, Vendor, Customer } from "../repos";
import { Password } from "../utils";
import { env } from "../config";
import VendorDto, { AdminDto, CustomerAddressDto, CustomerDto } from "../types/dtos";
import constants, { http } from "../constants";
import { TokenBlackList, VendorCache } from "../cache";
import Service from "./Service";
export default class Authentication extends Service {

    private readonly storedSalt: string = env("storedSalt")!;
    private readonly tokenSecret: string = env('tokenSecret')!;
    private readonly vendorRepo: Vendor = new Vendor();
    private readonly vendorCache: VendorCache = new VendorCache();
    private readonly adminRepo: Admin = new Admin();
    private readonly customerRepo: Customer = new Customer();
    private readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();

    public constructor() {
        super();
    }

    public async vendorSignUp(vendorDto: VendorDto) {
        const passwordHash: string = Password.hashPassword(vendorDto.password!, this.storedSalt);
        vendorDto.password = passwordHash;

        const repoResult = await this.vendorRepo.insert(vendorDto);
        const error: boolean = repoResult.error
        const statusCode = repoResult.type;
        const message: string = !error ? "Vendor has been created successfully" : repoResult.message!;

        if (!error) {
            const result = repoResult.data!;
            delete (result as VendorDto).password;
            const cacheSuccessful = await this.vendorCache.set(
                String((result as VendorDto).id),
                result as VendorDto
            );
            return cacheSuccessful ? super.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, result, ["vendor"]),
                vendor: result
            }) : super.responseData(statusCode, error, message);
        }
        return super.responseData(statusCode, error, message);
    }

    public async vendorLogin(email: string, password: string) { // TODO: create a general login method
        const repoResult = await this.vendorRepo.getVendorWithEmail(email);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const vendor: VendorDto = (repoResult.data as VendorDto);

        if (vendor) {
            const hashedPassword = vendor.password
            const validPassword = Password.compare(password, hashedPassword!, this.storedSalt);

            if (validPassword) {
                delete vendor.password;
                const cacheSuccessful = await this.vendorCache.set(
                    String(vendor.id),
                    vendor
                );

                return cacheSuccessful ? super.responseData(200, false, "Login successful", {
                    token: Token.createToken(env('tokenSecret')!, { id: vendor.id }, ["vendor"]), // TODO: testing here
                    vendor: vendor
                }) : super.responseData(500, true, http('500')!);
            }
            return super.responseData(400, true, "Invalid password");
        }
        return super.responseData(404, true, constants("404Vendor")!);
    }

    public async customerSignUp(
        customerData: {
            firstName: string,
            lastName: string,
            password: string,
            email: string
        }, addressData: CustomerAddressDto) {

        const passwordHash: string = Password.hashPassword(customerData.password, this.storedSalt);
        customerData.password = passwordHash;

        const repoResult = await this.customerRepo.insert({ customerData, addressData });
        const error: boolean = repoResult.error;
        const statusCode = repoResult.type;
        const message: string = !error ? "Customer has been created successfully" : repoResult.message!;
        const result = repoResult.data;


        if (!error) {
            delete result.password;
            // const cacheSuccessful = await this.vendorCache.set(
            //     String((result as VendorDto).id),
            //     result as VendorDto
            // );
            // return cacheSuccessful ? super.responseData(statusCode, error, message, {
            //     token: Token.createToken(env('tokenSecret')!, result, ["vendor"]),
            //     vendor: result
            // }) : super.responseData(statusCode, error, message);
            return super.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, result, ["customer"]),
                customer: result
            });
        }
        return super.responseData(statusCode, error, message, result);
    }

    public async customerLogin(email: string, password: string) {
        const repoResult = await this.customerRepo.getItemWithEmail(email);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const customer: CustomerDto = repoResult.data;

        if (customer) {
            const hashedPassword = customer.password
            const validPassword = Password.compare(password, hashedPassword!, this.storedSalt);

            if (validPassword) {
                delete customer.password;
                // const cacheSuccessful = await this.vendorCache.set(
                //     String(vendor.id),
                //     vendor
                // );

                return super.responseData(200, false, "Login successful", {
                    token: Token.createToken(env('tokenSecret')!, customer, ["customer"]),
                    customer: customer
                });
            }
            return super.responseData(400, true, "Invalid password");
        }
        return super.responseData(404, true, constants("404Customer")!);
    }

    public async adminLogin(email: string, password: string) {
        const repoResult = await this.adminRepo.getAdminAndRoleWithEmail(email);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const admin: AdminDto = (repoResult.data as AdminDto);

        if (admin) {
            const hashedPassword = admin.password
            const validPassword = Password.compare(password, hashedPassword!, this.storedSalt);

            if (validPassword) {
                delete admin.password;
                const token = Token.createToken(env('tokenSecret')!, admin, ["admin"]);
                delete admin.role;
                delete admin.directPermissions;

                // const cacheSuccessful = await Authentication.vendorCache.set(
                //     admin.email,
                //     admin
                // );

                return super.responseData(200, false, "Login successful", {
                    token: token,
                    admin: admin
                })

                // return cacheSuccessful ? Service.responseData(200, false, "login successful", {
                //     token: Token.createToken(env('tokenSecret')!, admin, ["vendor"]),
                //     vendor: admin
                // }) : Service.responseData(500, true, http('500')!);
            }
            return super.responseData(400, true, "Invalid password");
        }
        return super.responseData(404, true, constants("404Vendor")!);
    }


    public async vendorEmailOTP(email: string) {
        const repoResult = await this.vendorRepo.getVendorWithEmail(email);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const vendor = repoResult.data;

        if (vendor) {
            const vendorName = (vendor as VendorDto).firstName + " " + (vendor as VendorDto).lastName;
            const otpService = new OTP((vendor as VendorDto).email, { name: vendorName });
            const otpServiceResult = await otpService.send();
            return super.responseData(otpServiceResult.statusCode, otpServiceResult.json.error, otpServiceResult.json.message);
        }

        return super.responseData(404, true, constants("404Vendor")!);
    }


    public async vendorEmailVerification(vendorEmail: string, otpCode: string) {
        const otp = new OTP(vendorEmail);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) {
            return otpServiceResult;
        }

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updated = await this.vendorRepo.updateVerifiedStatus(vendorEmail);

        if (updated.error) {
            return super.responseData(500, true, http("500")!);
        }

        if (otpServiceResult.json.error) {
            return otpServiceResult;
        }

        const repoResult = await this.vendorRepo.getVendorWithEmail(vendorEmail);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const vendor: VendorDto = (repoResult.data as VendorDto);

        if (vendor) {
            delete vendor.password;
            const cacheSuccessful = await this.vendorCache.set(
                vendor.email,
                vendor
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: Token.createToken(env('tokenSecret')!, vendor, ["vendor"]),
                vendor: vendor
            }) : super.responseData(500, true, http('500')!);
        }
        return super.responseData(404, true, constants("404Vendor")!);
    }

    public async logoOut(token: string) {
        const tokenValidationResult: any = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, { data: decoded.data, types: decoded.types }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "Logged out successfully") :
            super.responseData(500, true, http('500')!);
    }

    // public async getToken(user: any,types: string[]){
    //     const token = Token.createToken(env('tokenSecret')!, admin, ["admin"]);
    //     return 
    // }
}