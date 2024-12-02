import prisma from ".";
import { PictureData } from "../interfaces/PictureData";
import { StoreDetailsDto } from "../types/dtos";
import { http } from "../constants";
import Repo from "./Repo";

export default class StoreDetails extends Repo {

    public constructor() {
        super('storeDetails');
    }

    public async insert(storeDetailsDto: StoreDetailsDto) {
        try {
            const newStore = await prisma.storeDetails.create({ data: storeDetailsDto as any });
            return newStore;
        } catch (error) {
            console.error("Failed to create store: ", error);
            return {};
        }
    }

    public async insertWithRelations(
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

    public async getStoreWithName(name: string) {
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

    public async getStoreWithVendorId(vendorId: number) {
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

    public async getStoreWithId(id: number) {
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

    public async getStoreAndRelationsWithVendorId(vendorId: number) {
        try {
            const store = await prisma.storeDetails.findUnique({
                where: { vendorId: vendorId },
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

    public async delete(vendorId: number) {
        try {
            const store = await prisma.storeDetails.delete({
                where: {
                    vendorId: vendorId,
                }
            });
            return {
                error: false,
            };
        } catch (error: any) {

            if (error.code === 'P2025') {
                const message = `Store with vendor id ${vendorId} does not exist.`;
                console.error(message);
                return {
                    error: true,
                    message: message,
                    type: 404
                };
            } else {
                console.error('Error deleting store:', error);
                return {
                    error: true,
                    message: http('500')!,
                    type: 500
                };
            }
        }
    }

    public async getAllStores() {
        return await this.getAll();
    }

    public async getAll() {
        try {
            const items = await prisma.storeDetails.findMany({
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
                data: items
            };

        } catch (error) {
            console.error(`Failed to get all ${this.tblName} items: `, error);
            return {
                error: true,
                data: {}
            }
        }
    }

    public async paginateStore(skip: number, take: number) {
        try {
            const items = await prisma.storeDetails.findMany({
                skip,
                take,
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
            const totalItems = await prisma.storeDetails.count();

            return {
                error: false,
                data: items,
                totalItems: totalItems
            };

        } catch (error) {
            console.error(`Failed to paginate ${this.tblName} items: `, error);
            return {
                error: true,
                data: {}
            }
        }
    }
}