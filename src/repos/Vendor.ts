import prisma from ".";
import { http } from "../constants";
import Repository from "../interfaces/Repository";
import VendorDto from "../types/dtos";

interface UpdateData {
    firstName?: string,
    lastName?: string,
    password?: string,
    email?: string,
    verified?: boolean
}

export default class Vendor implements Repository {

    public async insert(vendorData: VendorDto) {
        try {
            const newVendor = await prisma.vendor.create({ data: vendorData as any });
            return newVendor;
        } catch (error) {
            console.error("Failed to create vendor: ", error);
            return {};
        }

    }

    public async getVendorAndRelationsWithId(id: number) {
        try {
            const vendor = await prisma.vendor.findUnique({
                where: { id: id },
                include: {
                    profilePicture: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            return {
                error: false,
                data: vendor
            };
        } catch (error) {
            console.error("Failed to find vendor with id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    public async getVendorWithEmail(email: string) {
        try {
            const vendor = await prisma.vendor.findUnique({
                where: {
                    email
                }
            });
            return {
                error: false,
                data: vendor as VendorDto
            };
        } catch (error) {
            console.error("Failed to find vendor with email: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    public async getUserWithEmail(email: string) {
        return await this.getVendorWithEmail(email);
    }

    private async update(idOrEmail: number | string, data: UpdateData) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        try {
            const vendor = await prisma.vendor.update({
                where: where,
                data: data
            });

            return {
                error: false,
                updated: true
            };
        } catch (error) {
            console.error("Failed to update vendor: ", error);
            return {
                error: true,
                updated: false
            };
        }
    }

    public async updateFirstName(id: number, firstName: string) {
        return await this.update(id, { firstName: firstName });
    }

    public async updateLastName(id: number, lastName: string) {
        return await this.update(id, { lastName: lastName });
    }

    public async updateEmail(id: number, email: string) {
        return await this.update(id, { email: email, verified: false });
    }

    public async updateVerifiedStatus(email: string) {
        return await this.update(email, { verified: true });
    }

    public async delete(email: string) {
        try {
            const vendor = await prisma.vendor.delete({
                where: { email: email }
            });
            return {
                error: false,
            };
        } catch (error: any) {

            if (error.code === 'P2025') {
                const message = `Vendor with id ${email} does not exist.`;
                console.error(message);
                return {
                    error: true,
                    message: message,
                    type: 404
                };
            } else {
                console.error('Error deleting vendor:', error);
                return {
                    error: true,
                    message: http('500')!,
                    type: 500
                };
            }
        }
    }
}