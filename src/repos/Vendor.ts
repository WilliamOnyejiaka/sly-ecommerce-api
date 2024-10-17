import prisma from ".";
import { IVendor} from "../types";

// const tbl = prisma.vendor;

export default class Vendor {

    static async insert(vendorData: IVendor){
        try {
            const newVendor = await prisma.vendor.create({ data: vendorData as any });
            return newVendor;
        }catch(error){
            console.error("Failed to create vendor: ",error);
            return {};
        }
        
    }

    static async getVendorWithEmail(email: string){
        try{
            const vendor = await prisma.vendor.findUnique({
                where: {
                    email
                }
            });
            return vendor;
        }catch(error){
            console.error("Failed to find vendor: ", error);
            return {};
        }
    }
}