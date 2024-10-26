import prisma from ".";
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

    public async getUserWithEmail(email: string){
        return await this.getVendorWithEmail(email);
    }

    private async update(idOrEmail: number | string,data: UpdateData){
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

    public async updateFirstName(id: number,firstName: string){
        return await this.update(id,{firstName: firstName});
    }

    public async updateLastName(id: number, lastName: string) {
        return await this.update(id, { lastName: lastName });
    }

    public async updateVerifiedStatus(email: string) {
        return await this.update(email, { verified: true });
        // try {
        //     const vendor = await prisma.vendor.update({
        //         where: {
        //             email: email,
        //         },
        //         data: {
        //             verified: true,
        //         },
        //     });

        //     return {
        //         error: false,
        //         updated: true
        //     };
        // } catch (error) {
        //     console.error("Failed to update vendor verified status: ", error);
        //     return {
        //         error: true,
        //         updated: false
        //     };
        // }
    }
}