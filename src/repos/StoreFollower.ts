import Repo from "./bases/Repo";

export default class StoreFollower extends Repo {

    public constructor() {
        super('storeFollower');
    }

    public async toggleFollow(customerId: number, storeId: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{
                action: 'follow' | 'unfollow';
                totalFollowers: number;
            }> => {
                // Check if the follower exists
                const existingFollower = await tx.storeFollower.findUnique({
                    where: { storeId_customerId: { storeId, customerId } },
                });

                let action: 'follow' | 'unfollow';

                if (existingFollower) {
                    // Unfollow: Delete the existing follower
                    await tx.storeFollower.delete({
                        where: { storeId_customerId: { storeId, customerId } },
                    });
                    action = 'unfollow';
                } else {
                    // Follow: Create a new follower
                    await tx.storeFollower.create({
                        data: {
                            customerId,
                            storeId
                        },
                    });
                    action = 'follow';
                }

                // Get the updated total follow count
                const totalFollowers = await tx.storeFollower.count({
                    where: { storeId },
                });

                return { action, totalFollowers };
            });
            // console.log(data);

            return this.repoResponse<{ action: "follow" | "unfollow", totalFollowers: number }>(false, 200, null, data);
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async countFollowers(storeId: number) {
        return await this.countTblRecords({ where: { storeId } });
    }

    public async countFollowing(customerId: number) {
        return await this.countTblRecords({ where: { customerId } });
    }

    public async getFollowers(skip: number, take: number, storeId: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { storeId };
                const items = await tx.storeFollower.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phoneNumber: true,
                                active: true,
                                createdAt: true,
                                updatedAt: true,
                                CustomerProfilePic: {
                                    select: {
                                        imageUrl: true
                                    }
                                }
                            },
                        }
                    }
                });

                console.log(items);

                const totalItems = await tx.storeFollower.count({ where });
                return { items, totalItems }
            });

            return this.repoResponse(false, 200, "Drafts were retrieved successfully", data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async following(skip: number, take: number, customerId: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { customerId };
                const items = await tx.storeFollower.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        store: {
                            select: {
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
                                vendor: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phoneNumber: true,
                                        active: true,
                                        createdAt: true,
                                        updatedAt: true,
                                        profilePicture: {
                                            select: {
                                                imageUrl: true
                                            }
                                        }
                                    },
                                }
                            }
                        }
                    }
                });
                const totalItems = await tx.storeFollower.count({ where });
                return { items, totalItems }
            });

            return this.repoResponse(false, 200, "Drafts were retrieved successfully", data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}