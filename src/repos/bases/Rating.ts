import { PrismaClient } from "@prisma/client";
import Repo from "./Repo";

export default class Rating extends Repo {

    public constructor(protected tblName: keyof PrismaClient, protected parentColumn: string) {
        super(tblName);
    }

    public async rate(parentId: number, customerId: number, rating: number) {
        try {
            const result = await (this.prisma[this.tblName] as any).upsert({
                where: { [`${this.parentColumn}_customerId`]: { [this.parentColumn]: parentId, customerId: customerId } },
                update: { rating },
                create: {
                    rating,
                    customerId,
                    [this.parentColumn]: parentId
                }
            });
            return this.repoResponse(false, 200, "Customer has rated", result);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getRating(id: number) {
        try {
            let data = await (this.prisma[this.tblName] as any).findUnique({
                where: { id },
                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            CustomerProfilePic: {
                                select: {
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getRatings(parentId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { [this.parentColumn]: parentId };
                let ratings = await (tx[this.tblName as any] as any).findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                CustomerProfilePic: {
                                    select: {
                                        imageUrl: true
                                    }
                                }
                            }
                        }
                    }
                });

                const totalItems = await (tx[this.tblName as any] as any).count({ where: where })

                return { items: ratings, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}