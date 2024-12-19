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
                            imageUrl: true
                        }
                    }
                }
            });
            return super.repoResponse(false, 200, null, customer);
        } catch (error) {
            super.handleDatabaseError(error);
        }
    }

    public async getAll(filter?: any): Promise<{ error: boolean; message: string | null; type: number; data: any; } | { error: boolean; message: string | undefined; type: number; data: {}; }> {
        return await super.getAll({
            include: {
                CustomerProfilePic: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    // public async updateVerifiedStatus(email: string) {
    //     return await super.update({ email: email }, { verified: true });
    // }

    public async updateActiveStatus(id: number, activate: boolean = true) {
        return await super.update({ id: id }, { active: activate });
    }
}