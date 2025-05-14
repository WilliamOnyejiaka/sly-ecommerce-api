import { PrismaClient } from "@prisma/client";
import Repo from "./Repo";

export default class Like extends Repo {

    public constructor(protected likeTbl: keyof PrismaClient, protected parentColumn: string) {
        super(likeTbl);
    }

    public async toggleLike(customerId: number, parentId: number | string) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{
                action: 'liked' | 'unlike';
                totalLikes: number;
            }> => {
                // Check if the like exists
                const existingLike = await (tx[this.tblName as any] as any).findUnique({
                    where: {
                        [`${this.parentColumn}_customerId`]: { customerId: customerId, [this.parentColumn]: parentId },
                    } as any,
                });

                let action: 'liked' | 'unlike';

                if (existingLike) {
                    // Unlike: Delete the existing like
                    await (tx[this.tblName as any] as any).delete({
                        where: {
                            [`${this.parentColumn}_customerId`]: { customerId: customerId, [this.parentColumn]: parentId },
                        } as any,
                    });
                    action = 'unlike';
                } else {
                    // Like: Create a new like
                    await (tx[this.tblName as any] as any).create({
                        data: {
                            customerId,
                            [this.parentColumn]: parentId
                        } as any,
                    });
                    action = 'liked';
                }

                // Get the updated total like count
                const totalLikes = await (tx[this.tblName as any] as any).count({
                    where: { [this.parentColumn]: parentId },
                });

                return { action, totalLikes };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async countLikes(parentId: number | string) {
        try {
            const likes = await ((this.prisma[this.likeTbl] as any) as any).count({ where: { [`${this.parentColumn}`]: parentId } });
            return this.repoResponse(false, 200, null, { likes });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}