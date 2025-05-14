import { Prisma } from "@prisma/client";
import prisma from ".";
import UserRepo from "./bases/UserRepo";

export default class Customer extends UserRepo {

    public constructor() {
        super('customer', 'CustomerProfilePic');
    }

    public override async insert(data: any) {
        const insertData = {
            ...data.customerData,
            Address: {
                create: data.addressData
            }
        };
        const customerAddress = {
            Address: {
                select: {
                    street: true,
                    city: true,
                    zip: true
                }
            },
        };
        return await super.insert(insertData, customerAddress);
    }

    public async getCustomer(id: number) {
        return this.getItemWithId(id);
    }

    // public async updateProfile(id: number, updateData: Prisma.CustomerUpdateInput) {
    //     try {
    //         const updatedUser = await prisma.customer.update({
    //             where: { id },
    //             data: updateData,
    //             select: {
    //                 id: true,
    //                 firstName: true,
    //                 lastName: true,
    //                 email: true,
    //                 phoneNumber: true,
    //                 active: true,
    //                 verified: true,
    //                 isOauth: true,
    //                 oAuthDetails: true,
    //                 createdAt: true,
    //                 updatedAt: true
    //             },
    //         });
    //         return super.repoResponse(false, 200, "User has been updated successfully", updatedUser);
    //     } catch (error) {
    //         return super.handleDatabaseError(error);
    //     }
    // }
}