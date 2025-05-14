import { PrismaClient, Prisma } from "@prisma/client";
import prisma from "..";
import Repo from "./Repo";

export default class UserRepo extends Repo {

    public imageRelation: string;

    public constructor(tblName: keyof PrismaClient, imageRelation: string) {
        super(tblName);
        this.imageRelation = imageRelation;
    }

    public async updateProfile(id: number, updateData: Prisma.CustomerUpdateInput | Prisma.VendorUpdateInput) {
        try {
            const updatedUser = await (this.prisma[this.tblName] as any).update({
                where: { id },
                data: updateData as any,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    active: true,
                    verified: true,
                    isOauth: true,
                    oAuthDetails: true,
                    createdAt: true,
                    updatedAt: true
                },
            });
            return super.repoResponse(false, 200, "User has been updated successfully", updatedUser);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async emailExists(email: string) {
        try {
            const item = await (this.prisma[this.tblName] as any).findUnique({
                // const item = await this.prisma.customer.findUnique({
                where: { email }
            });
            return this.repoResponse(false, 200, null, { exists: item?.email ? true : false });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getUserWithId(userId: number) {
        return await super.getItemWithId(userId);
    }

    public async getUserWithPhoneNumber(phoneNumber: string) {
        return await super.getItem({ 'phoneNumber': phoneNumber });
    }

    public async getUserProfile(userIdOrEmail: number | string) {
        const where = typeof userIdOrEmail == "number" ? { id: userIdOrEmail } : { email: userIdOrEmail };
        const customerAddress = this.tblName === "customer" ? {
            Address: {
                select: {
                    street: true,
                    city: true,
                    zip: true
                }
            },
        } : {};
        const store = this.tblName === "vendor" ? {
            storeDetails: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    description: true,
                    tagLine: true,
                    createdAt: true,
                    updatedAt: true,
                    vendorId: true,
                    storeLogo: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            }
        } : {};
        return await super.getItem(where, {
            include: {
                ...store,
                ...customerAddress,
                [this.imageRelation]: {
                    select: {
                        imageUrl: true,
                        publicId: true,
                        mimeType: true
                    },
                }
            }
        });
    }

    public async getUserProfileWithId(userId: number) {
        return await this.getUserProfile(userId);
    }

    public async getUserProfileWithEmail(userEmail: string) {
        return await this.getUserProfile(userEmail);
    }

    public async getAll(filter?: any) {
        return await super.getAll({}, {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    protected async updateWithIdOrEmail(idOrEmail: number | string, data: any) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        return await this.update(where, data);
    }

    public async updateActiveStatus(userId: number, activate: boolean = true) {
        return await this.updateWithIdOrEmail(userId, { active: activate });
    }

    public async updatePassword(email: string, password: string) {
        return await this.updateWithIdOrEmail(email, { password: password });
    }

    public async updateVerifiedStatus(email: string) {
        return await super.update({ email: email }, { verified: true });
    }

    public async paginate(skip: number, take: number) {
        return super.paginate(skip, take, {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    public async countAllUsers() {
        try {
            const [adminCount, vendorCount, customerCount] = await Promise.all([
                prisma.admin.count(),
                prisma.vendor.count(),
                prisma.customer.count(),
            ]);
            const totalCount = adminCount + vendorCount + customerCount;
            return this.repoResponse(false, 200, null, totalCount);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    };

    public async countAllNoAdminUsers() {
        try {
            const [vendorCount, customerCount] = await Promise.all([
                prisma.vendor.count(),
                prisma.customer.count(),
            ]);
            const totalCount = vendorCount + customerCount;
            return this.repoResponse(false, 200, null, totalCount);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    };

}