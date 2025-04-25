import Repo from "./bases/Repo";

export default class SavedProduct extends Repo {


    public constructor() {
        super('savedProduct');
    }

    public async insertProduct(productId: number, customerId: number) {
        try {
            const savedProduct = await this.prisma.savedProduct.create({
                data: { productId, customerId },
                include: {
                    product: {
                        select: {
                            id: true,
                            productImage: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            name: true,
                            price: true,
                            description: true,
                            storeId: true,
                            discountPrice: true,
                            metaData: true,
                            isAvailable: true,
                            attributes: true,
                            additionalInfo: true,
                            isFeatured: true,
                            categoryId: true,
                            subcategoryId: true,
                            updatedAt: true,
                            createdAt: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, savedProduct);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getSavedProduct(productId: number, customerId: number) {
        try {
            const savedProduct = await this.prisma.savedProduct.findFirst({
                where: { productId, customerId },
                include: {
                    product: {
                        select: {
                            id: true,
                            productImage: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            name: true,
                            price: true,
                            description: true,
                            storeId: true,
                            discountPrice: true,
                            metaData: true,
                            isAvailable: true,
                            attributes: true,
                            additionalInfo: true,
                            isFeatured: true,
                            categoryId: true,
                            subcategoryId: true,
                            updatedAt: true,
                            createdAt: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, savedProduct);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getSavedProducts(customerId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { customerId };
                let savedProducts = await tx.savedProduct.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        product: {
                            select: {
                                id: true,
                                productImage: {
                                    select: {
                                        imageUrl: true
                                    }
                                },
                                name: true,
                                price: true,
                                description: true,
                                storeId: true,
                                discountPrice: true,
                                metaData: true,
                                isAvailable: true,
                                attributes: true,
                                additionalInfo: true,
                                isFeatured: true,
                                categoryId: true,
                                subcategoryId: true,
                                updatedAt: true,
                                createdAt: true
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