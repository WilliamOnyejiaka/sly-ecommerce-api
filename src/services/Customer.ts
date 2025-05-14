import constants, { http, urls } from "../constants";
import { CustomerProfilePic, Customer as CustomerRepo } from "../repos";
import { CustomerCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import { CustomerAddressDto } from "../types/dtos";
import { CdnFolders, StreamGroups, UserType } from "../types/enums";
import { streamRouter, env } from "../config";
import { Prisma } from "@prisma/client";


export default class Customer extends UserService<CustomerRepo, CustomerCache, CustomerProfilePic> {

    public constructor() {
        super(new CustomerRepo(), new CustomerCache(), new CustomerProfilePic(), UserType.CUSTOMER, CdnFolders.CUSTOMER_PROFILE_PIC);
    }

    public async createCustomer(
        customerData: {
            firstName: string,
            lastName: string,
            password: string,
            email: string,
            phoneNumber: string
        }, addressData: CustomerAddressDto) {

        const passwordHash: string = Password.hashPassword(customerData.password, this.storedSalt);
        customerData.password = passwordHash;

        const repoResult = await this.repo!.insert({ customerData, addressData });
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const customer = repoResult.data!;
        delete customer.password;
        await streamRouter.addEvent(StreamGroups.USER, {
            type: 'customer:create',
            data: customer,
        });
        return super.responseData(201, false, "Customer has been created successfully", customer);
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

        const updateData: Prisma.CustomerUpdateInput = {};

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

    public async delete(customerId: number) {
        const repoResult = await this.repo!.deleteWithId(customerId); // ! TODO: add cloudinary delete
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(customerId);

        return deleted ?
            super.responseData(200, false, "Customer was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async getAllCustomers() {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        super.sanitizeUserImageItems(repoResult.data);
        return super.responseData(200, false, constants('200Customers')!, repoResult.data);
    }
}