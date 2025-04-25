import Repo from "./bases/Repo";

export default class FavoriteStore extends Repo {


    public constructor() {
        super('favoriteStore');
    }

    public async insertFavorite(storeId: number, customerId: number) {
        try {
            const savedProduct = await this.prisma.favoriteStore.create({
                data: { storeId, customerId },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            address: true,
                            city: true,
                            tagLine: true,
                            updatedAt: true,
                            createdAt: true,
                            storeLogo: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            firstStoreBanner: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            secondStoreBanner: {
                                select: {
                                    imageUrl: true
                                }
                            },
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, savedProduct);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getFavoriteStore(storeId: number, customerId: number) {
        try {
            const savedProduct = await this.prisma.favoriteStore.findFirst({
                where: { storeId, customerId },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            address: true,
                            city: true,
                            tagLine: true,
                            updatedAt: true,
                            createdAt: true,
                            storeLogo: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            firstStoreBanner: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            secondStoreBanner: {
                                select: {
                                    imageUrl: true
                                }
                            },
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, savedProduct);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getFavoriteStores(customerId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { customerId };
                let savedProducts = await tx.favoriteStore.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        store: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                address: true,
                                city: true,
                                tagLine: true,
                                updatedAt: true,
                                createdAt: true,
                                storeLogo: {
                                    select: {
                                        imageUrl: true
                                    }
                                },
                                firstStoreBanner: {
                                    select: {
                                        imageUrl: true
                                    }
                                },
                                secondStoreBanner: {
                                    select: {
                                        imageUrl: true
                                    }
                                },
                            }
                        }
                    }
                });

                const totalItems = await tx.savedProduct.count({ where: where })

                return { items: savedProducts, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}