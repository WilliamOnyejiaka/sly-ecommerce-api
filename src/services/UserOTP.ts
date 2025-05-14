import { OTP } from ".";
import { AdminCache, CustomerCache, VendorCache } from "../cache";
import BaseCache from "../cache/bases/BaseCache";
import UserCache from "../cache/bases/UserCache";
import { env } from "../config";
import constants, { http } from "../constants";
import { Admin, Customer, Vendor } from "../repos";
import UserRepo from "../repos/bases/UserRepo";
import { OTPType, UserType } from "../types/enums";
import { Password } from "../utils";
import Authentication from "./bases/Authentication";

export default class UserOTP extends Authentication {

    public constructor() {
        super();
    }

    public async sendUserOTP<T extends UserRepo>(repo: T, email: string, otpType: OTPType, userType: UserType) {
        const repoResult = await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            const userName = userProfile.firstName + " " + userProfile.lastName;
            const otpService = new OTP(userProfile.email, otpType, userType);
            const otpServiceResult = await otpService.send(userName);
            return otpServiceResult
        }

        return super.responseData(404, true, constants('404User')!);
    }

    public async sendVendorOTP(email: string, otpType: OTPType) {
        return await this.sendUserOTP<Vendor>(this.vendorRepo, email, otpType, UserType.VENDOR);
    }

    public async sendCustomerOTP(email: string, otpType: OTPType) {
        return await this.sendUserOTP<Customer>(this.customerRepo, email, otpType, UserType.CUSTOMER);
    }

    public async sendAdminOTP(email: string, otpType: OTPType) {
        return await this.sendUserOTP<Admin>(this.adminRepo, email, otpType, UserType.ADMIN);
    }

    private async emailVerification<T extends UserRepo, U extends UserCache>(repo: T, cache: U, email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.Verification, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updatedResult = await repo.updateVerifiedStatus(email);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = userType === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(email) : await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture<T>(userProfile, repo);
            delete userProfile.password;
            delete userProfile[repo.imageRelation];

            const cacheSuccessful = await cache.set(
                userProfile.id,
                userProfile
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: userType === "admin" ? this.generateAdminToken(userProfile) : this.generateUserToken(userProfile.id, userType),
                vendor: userProfile
            }) : super.responseData(500, true, http('500')!);
        }
        return super.responseData(404, true, constants('404User')!);
    }

    public async vendorEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Vendor, VendorCache>(
            this.vendorRepo,
            this.vendorCache,
            email,
            otpCode,
            UserType.VENDOR
        );
    }

    public async customerEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Customer, CustomerCache>(
            this.customerRepo,
            this.customerCache,
            email,
            otpCode,
            UserType.CUSTOMER
        );
    }

    public async adminEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Admin, AdminCache>(
            this.adminRepo,
            this.adminCache,
            email,
            otpCode,
            UserType.ADMIN
        );
    }

    public async otpConfirmation(email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.Reset, userType);

        const otpServiceResult = await otp.confirmOTP(otpCode);
        if (otpServiceResult.json.error) return otpServiceResult;
        const deletedOTPServiceResult = await otp.deleteOTP();
        if (deletedOTPServiceResult.json.error) return deletedOTPServiceResult;

        const token = this.generateOTPToken(email, userType);
        return super.responseData(200, false, "OTP confirmation was successful", { token: token });
    }

    private async passwordReset<T extends UserRepo>(repo: T, email: string, password: string, userType: UserType) {
        const repoResult = userType === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(email) : await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            const hashedPassword = Password.hashPassword(password, this.storedSalt);
            const updatedResult = await repo.updatePassword(email, hashedPassword);
            const updatedResultError = this.handleRepoError(updatedResult);
            if (updatedResultError) return updatedResultError;
            this.setUserProfilePicture<T>(userProfile, repo);
            delete userProfile.password;
            delete userProfile[repo.imageRelation];

            return super.responseData(200, false, "Password has been reset successfully", {
                user: userProfile,
                token: userType === "admin" ? super.generateAdminToken(userProfile) : super.generateUserToken(userProfile.id, userType)
            });
        }
        return super.responseData(404, true, constants('404User')!);
    }

    public async adminPasswordReset(email: string, password: string) {
        return await this.passwordReset<Admin>(
            this.adminRepo,
            email,
            password,
            UserType.ADMIN
        );
    }

    public async vendorPasswordReset(email: string, password: string) {
        return await this.passwordReset<Vendor>(
            this.vendorRepo,
            email,
            password,
            UserType.VENDOR
        );
    }

    public async customerPasswordReset(email: string, password: string) {
        return await this.passwordReset<Customer>(
            this.customerRepo,
            email,
            password,
            UserType.CUSTOMER
        );
    }
} 