import constants from "../constants";
import { Vendor } from "../repos";
import UserRepo from "../repos/bases/UserRepo";
import { UserType } from "../types/enums";
import Authentication from "./bases/Authentication";

export default class PasswordReset extends Authentication {

    // private async sendPasswordResetOTP<T extends UserRepo>(repo: T, email: string, user: UserType) {
    //     const repoResult = await repo.getUserProfileWithEmail(email);
    //     const repoResultError = this.handleRepoError(repoResult);
    //     if (repoResultError) return repoResultError;

    //     const userProfile = repoResult.data;

    //     if (userProfile) {
    //         const userName = userProfile.firstName + " " + userProfile.lastName;
    //         const service = new PasswordToken(userProfile.email, user, { name: userName });
    //         const serviceResult = await service.send({ email: email }, user);
    //         return serviceResult
    //     }

    //     return super.responseData(404, true, constants('404User')!);
    // }

    // public async sendVendorResetToken(email: string) {
    //     return await this.sendPasswordResetToken<Vendor>(this.vendorRepo, email, UserType.Vendor);
    // }
}