    import prisma from ".";
    import { IVendor } from "../types";

    export default class Vendor {

        static async insert(vendorData: IVendor) {
            try {
                const newVendor = await prisma.vendor.create({ data: vendorData as any });
                return newVendor;
            } catch (error) {
                console.error("Failed to create vendor: ", error);
                return {};
            }

        }

    static async getVendorWithEmail(email: string) {
        try {
            const vendor = await prisma.vendor.findUnique({
                where: {
                    email
                }
            });
            return {
                error: false,
                data: vendor
            };
        } catch (error) {
            console.error("Failed to find vendor with email: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    static async updateVerifiedStatus(email: string){
        try {
            const vendor = await prisma.vendor.update({
                where: {
                    email: email,
                },
                data: {
                    verified: true,
                },
            });
            
            return {
                error: false,
                updated: true
            };
        } catch (error) {
            console.error("Failed to find vendor with business name: ", error);
            return {
                error: true,
                updated: false
            };
        }
    }
}