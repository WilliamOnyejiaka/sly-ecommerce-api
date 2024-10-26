import prisma from ".";
import { StoreDetailsDto } from "../types/dtos";

export default class StoreDetails {

    static async insert(storeDetailsDto: StoreDetailsDto) {
        try {
            const newStore = await prisma.storeDetails.create({ data: storeDetailsDto as any});
            return newStore;
        } catch (error) {
            console.error("Failed to create store: ", error);
            return {};
        }
    }

    static async getStoreWithName(name: string) {
        try {
            const store = await prisma.storeDetails.findUnique({
                where: {
                    name
                }
            });
            return {
                error: false,
                data: store
            };
        } catch (error) {
            console.error("Failed to find store with name: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    static async getStoreWithVendorId(vendorId: number) {
        try {
            const store = await prisma.storeDetails.findFirst({
                where: {
                    vendorId: vendorId
                }
            });
            return {
                error: false,
                data: store as StoreDetailsDto
            };
        } catch (error) {
            console.error("Failed to find store with vendor id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    static async getStoreWithId(id: number) {
        try {
            const store = await prisma.storeDetails.findUnique({
                where: {
                    id: id
                }
            });
            return {
                error: false,
                data: store as StoreDetailsDto
            };
        } catch (error) {
            console.error("Failed to find store with id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }
}