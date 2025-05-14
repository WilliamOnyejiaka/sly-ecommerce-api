import constants, { http, HttpStatus, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { VendorCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import VendorDto from "../types/dtos";
import { CdnFolders, StreamGroups, UserType } from "../types/enums";
import { streamRouter } from "../config";
import { Prisma } from "@prisma/client";

export default class Vendor extends UserService<VendorRepo, VendorCache, VendorProfilePicture> {

    public constructor() {
        super(new VendorRepo(), new VendorCache(), new VendorProfilePicture(), UserType.VENDOR, CdnFolders.VENDOR_PROFILE_PIC);
    }

    public async createVendor(vendorDto: VendorDto) {
        const passwordHash: string = Password.hashPassword(vendorDto.password!, this.storedSalt);
        vendorDto.password = passwordHash;

        const repoResult = await this.repo!.insert(vendorDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const vendor = repoResult.data!;
        delete vendor.password;
        await streamRouter.addEvent(StreamGroups.USER, {
            type: 'vendor:create',
            data: vendor,
        });
        return super.responseData(201, false, "Vendor has been created successfully", vendor);
    }

    public async updateFirstName(id: number, firstName: string) {
        const repoResult = await this.repo!.updateFirstName(id, firstName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateLastName(id: number, lastName: string) {
        const repoResult = await this.repo!.updateLastName(id, lastName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateEmail(id: number, email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);
        if (emailExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return super.responseData(400, true, "Email already exists.");
        }

        const repoResult = await this.repo!.updateEmail(id, email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateProfile(id: number, data: any) {
        const profileRepoResult = await this.repo!.getItemWithId(id);
        const repoResultError = this.handleRepoError(profileRepoResult);
        if (repoResultError) return repoResultError;
        const profile = profileRepoResult.data;
        if (!profile) return this.responseData(404, true, "User was not found");

        // Check if email is taken (excluding current user)
        const newEmail = data.email
        if (newEmail && newEmail !== profile.email) {
            const emailRepoResult = await this.repo?.emailExists(newEmail);
            const repoResultError = this.handleRepoError(profileRepoResult);
            if (repoResultError) return repoResultError;
            const { exists } = emailRepoResult!.data as any;
            if (exists) return this.responseData(400, true, "Email is already taken");
        }

        const updateData: Prisma.VendorUpdateInput = {};

        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.email) {
            updateData.email = data.email;
            updateData.verified = false;
        }
        if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
        if (data.password) {
            const passwordHash: string = Password.hashPassword(data.password!, this.storedSalt);
            updateData.password = passwordHash;
        }

        const updateRepoResult = await this.repo!.updateProfile(id, updateData);
        const updateRepoResultError = this.handleRepoError(updateRepoResult);
        if (updateRepoResultError) return updateRepoResultError;

        return this.responseData(200, false, "User has been updated successfully", updateRepoResult.data);
    }

    // public async delete(vendorId: number) {
    //     const repoResult = await this.repo!.deleteWithId(vendorId); // ! TODO: add cloudinary image delete
    //     const errorResponse = this.handleRepoError(repoResult);
    //     if (errorResponse) return errorResponse;

    //     const deleted = await this.cache.delete(String(vendorId));

    //     return deleted ?
    //         super.responseData(200, false, "Vendor was deleted successfully") :
    //         super.responseData(500, true, http('500')!);
    // }

}

