import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./Repo";

export default class Customer extends Repo {

    public constructor() {
        super('customer');
    }

    public override async insert(data: any) {
        const insertData = {
            ...data.customerData,
            Address: {
                create: data.addressData
            }
        };
        return await super.insert(insertData);
    }

    public async getCustomerAndProfilePictureWithId(id: number) {
        try {
            const customer = await prisma.customer.findUnique({
                where: { id: id },
                include: {
                    CustomerProfilePic: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            return super.repoResponse(false, 200, null, customer);
        } catch (error) {
            super.handleDatabaseError(error);
        }
    }
}