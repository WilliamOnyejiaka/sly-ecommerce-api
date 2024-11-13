import { create } from "domain";
import prisma from ".";
import { PictureData } from "../interfaces/PictureData";
import { StoreDetailsDto } from "../types/dtos";

export default class StoreDetails {

    static async insert(storeDetailsDto: StoreDetailsDto) {
        try {
            const newStore = await prisma.storeDetails.create({ data: storeDetailsDto as any });
            return newStore;
        } catch (error) {
            console.error("Failed to create store: ", error);
            return {};
        }
    }

    static async insertWithRelations(
        storeDetailsDto: StoreDetailsDto,
        storeLogo: PictureData | null,
        firstStoreBanner: PictureData | null,
        secondStoreBanner: PictureData | null
    ) {
        try {
            const data: any = {
                ...storeDetailsDto as any
            };

            storeLogo && (data['storeLogo'] = { create: storeLogo });
            secondStoreBanner && (data['secondStoreBanner'] = { create: secondStoreBanner });
            firstStoreBanner && (data['firstStoreBanner'] = { create: firstStoreBanner });

            const newStore = await prisma.storeDetails.create({
                data: data
            });

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

    public async getStoreAndRelationsWithId(id: number) {
        try {
            const store = await prisma.storeDetails.findUnique({
                where: { id: id },
                include: {
                    storeLogo: {
                        select: {
                            mimeType: true
                        }
                    },
                    firstStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    },
                    secondStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            return {
                error: false,
                data: store
            };
        } catch (error) {
            console.error("Failed to find store with id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    public async delete(id: number) {
        try {
            const store = await prisma.storeDetails.delete({
                where: {
                    id: id,
                    // vendorId: vendorId
                }
            });
            return {
                error: false,
                updated: true
            };
        } catch (error: any) {

            if (error.code === 'P2025') {
                console.error(`Store with id ${id} does not exist.`);
                return {
                    error: true,
                    updated: false
                };
            } else {
                console.error('Error deleting store:', error);
                return {
                    error: true,
                    updated: false
                };
            }
        }
    }
}