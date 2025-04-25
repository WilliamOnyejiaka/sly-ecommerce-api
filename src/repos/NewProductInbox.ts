import Repo from "./bases/Repo";

export default class NewProductInbox extends Repo {

    public constructor() {
        super('newProductInbox');
    }

    public async getInbox(customerId: number, skip: number, take: number, viewed?: boolean) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = typeof viewed === "undefined" ? { customerId } : { customerId, viewed }
                let inbox = await tx.newProductInbox.findMany({
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

                const totalItems = await tx.newProductInbox.count({ where: where })

                return { items: inbox, totalItems };
            });
            return super.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async markAsViewed(customerId: number, id: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<any> => {
                const updatedData = await tx.newProductInbox.update({
                    where: { customerId, id },
                    data: { viewed: true }
                });
                const product = await tx.product.findFirst({ where: { id: updatedData.productId } });
                return { inbox: updatedData, product }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async deleteItem(customerId: number, id: number) {
        try {
            const deletedData = await this.prisma.newProductInbox.delete({
                where: {
                    id: id,
                    customerId: customerId
                }
            });
            return this.repoResponse(false, 200, null, deletedData);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

}