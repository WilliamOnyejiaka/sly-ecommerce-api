import Repo from "./bases/Repo";

export default class Inventory extends Repo {

    private productDetails = {
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            discountPrice: true,
            isAvailable: true,
            attributes: true,
            additionalInfo: true,
            metaData: true,
            averageRating: true,
            isFeatured: true,
            draft: true,
            link: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    CategoryImage: true
                }
            },
            subcategory: {
                select: {
                    id: true,
                    name: true,
                    SubCategoryImage: true
                }
            },
            productImage: true,
            createdAt: true,
            updatedAt: true
        }
    };

    public constructor() {
        super('inventory');
    }

    public async findInventoryWithId(id: number) {
        try {
            const data = await this.prisma.inventory.findUnique({
                where: { id },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            price: true,
                            discountPrice: true,
                            isAvailable: true,
                            attributes: true,
                            additionalInfo: true,
                            metaData: true,
                            averageRating: true,
                            isFeatured: true,
                            draft: true,
                            link: true,
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    CategoryImage: true
                                }
                            },
                            subcategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    SubCategoryImage: true
                                }
                            },
                            productImage: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}