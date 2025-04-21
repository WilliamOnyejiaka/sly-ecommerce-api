import { InventoryDto, ProductDto } from "../types/dtos";
import AssetRepo from "./bases/AssetRepo";

export default class Product extends AssetRepo {

    public constructor() {
        super('product', 'productImage');
    }

    public async insertProduct(productData: ProductDto, inventoryData: InventoryDto, productImages?: any) {
        try {
            const createdProduct = this.prisma.product.create({
                data: {
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    discountPrice: productData.discountPrice,
                    isAvailable: productData.isAvailable,
                    attributes: productData.attributes,
                    additionalInfo: productData.additionalInfo,
                    metaData: productData.metaData,
                    averageRating: productData.averageRating,
                    reviewCount: productData.reviewCount,
                    isFeatured: productData.isFeatured,
                    storeId: productData.storeId,
                    categoryId: productData.categoryId,
                    subcategoryId: productData.subcategoryId,
                    inventory: {
                        create: {
                            stock: inventoryData.stock,
                            soldCount: inventoryData.soldCount,
                            lowStockThreshold: inventoryData.lowStockThreshold,
                            storeId: inventoryData.storeId
                        }
                    },
                    productImage: {
                        createMany: {
                            data: [...productImages]
                        }
                    }
                },
                include: { inventory: true, productImage: true },
            })

            return createdProduct;
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertProducte(productData: ProductDto, inventoryData: InventoryDto, productImages: any) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<any> => {

                const createdProduct = tx.product.create({
                    data: {
                        name: productData.name,
                        description: productData.description,
                        price: productData.price,
                        discountPrice: productData.discountPrice,
                        isAvailable: productData.isAvailable,
                        attributes: productData.attributes,
                        additionalInfo: productData.additionalInfo,
                        metaData: productData.metaData,
                        averageRating: productData.averageRating,
                        reviewCount: productData.reviewCount,
                        isFeatured: productData.isFeatured,
                        storeId: productData.storeId,
                        categoryId: productData.categoryId,
                        subcategoryId: productData.subcategoryId,
                        inventory: {
                            create: {
                                stock: inventoryData.stock,
                                soldCount: inventoryData.soldCount,
                                lowStockThreshold: inventoryData.lowStockThreshold,
                                storeId: inventoryData.storeId
                            }
                        },
                        productImage: {
                            createMany: {
                                data: [...productImages]
                            }
                        }
                    },
                    include: { inventory: true, productImage: true },
                })

                return createdProduct;
            });
            return this.repoResponse(false, 201, "Product has been created successfully", data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}