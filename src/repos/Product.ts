import { UploadedFiles } from "../types";
import { InventoryDto, ProductDto } from "../types/dtos";
import AssetRepo from "./bases/AssetRepo";

export default class Product extends AssetRepo {

    public constructor() {
        super('product', 'productImage');
    }

    public async getProduct(id: number) {
        try {
            const product = await this.prisma.product.findFirst({
                where: { id },
                include: {
                    productImage: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            })

            return this.repoResponse(false, 200, "Product was retrieved successfully", product);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getProducts(skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const items = await tx.product.findMany({
                    skip,
                    take,
                    include: {
                        productImage: {
                            select: {
                                imageUrl: true
                            }
                        }
                    }
                });
                const totalItems = await tx.newProductInbox.count();
                return { items, totalItems }
            });

            return this.repoResponse(false, 200, "Products were retrieved successfully", data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertProduct(productData: ProductDto, inventoryData: InventoryDto) {
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
                    isFeatured: productData.isFeatured,
                    storeId: productData.storeId,
                    categoryId: productData.categoryId,
                    subcategoryId: productData.subcategoryId
                },
            })

            return this.repoResponse(false, 201, "Product was created successfully", createdProduct);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertProductAll(productData: ProductDto, inventoryData: InventoryDto, productImages: { publicId: string, size: number, imageUrl: string, mimeType: string }[]) {
        try {
            const createdProduct = await this.prisma.product.create({
                data: {
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    discountPrice: productData.discountPrice,
                    isAvailable: productData.isAvailable,
                    attributes: productData.attributes,
                    additionalInfo: productData.additionalInfo,
                    metaData: productData.metaData,
                    isFeatured: productData.isFeatured,
                    storeId: productData.storeId, // Make sure the storeId is correct
                    categoryId: productData.categoryId,
                    subcategoryId: productData.subcategoryId,
                    inventory: {
                        create: {
                            stock: inventoryData.stock,
                            soldCount: inventoryData.soldCount,
                            lowStockThreshold: inventoryData.lowStockThreshold,
                            storeId: inventoryData.storeId // Ensure consistency with productData.storeId
                        }
                    },
                    productImage: {
                        createMany: {
                            data: productImages as any
                        }
                    }
                },
                include: { inventory: true, productImage: true },
            });

            return this.repoResponse(false, 201, "Product was created successfully", createdProduct);
        } catch (error) {
            console.error("Error inserting product with inventory:", error); // Log the error
            return this.handleDatabaseError(error); // Ensure this method handles the error correctly
        }
    }

    public async insertProductWithInventory(productData: ProductDto, inventoryData: InventoryDto) {
        try {
            // Validate the incoming data before proceeding
            if (!productData || !inventoryData) {
                throw new Error("Invalid product or inventory data");
            }

            const createdProduct = await this.prisma.product.create({
                data: {
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    discountPrice: productData.discountPrice,
                    isAvailable: productData.isAvailable,
                    attributes: productData.attributes,
                    additionalInfo: productData.additionalInfo,
                    metaData: productData.metaData,
                    isFeatured: productData.isFeatured,
                    storeId: productData.storeId, // Make sure the storeId is correct
                    categoryId: productData.categoryId,
                    subcategoryId: productData.subcategoryId,
                    inventory: {
                        create: {
                            stock: inventoryData.stock,
                            soldCount: inventoryData.soldCount,
                            lowStockThreshold: inventoryData.lowStockThreshold,
                            storeId: inventoryData.storeId // Ensure consistency with productData.storeId
                        }
                    },
                },
                include: { inventory: true, productImage: true },
            });

            return this.repoResponse(false, 201, "Product was created successfully", createdProduct);
        } catch (error) {
            console.error("Error inserting product with inventory:", error); // Log the error
            return this.handleDatabaseError(error); // Ensure this method handles the error correctly
        }
    }


}