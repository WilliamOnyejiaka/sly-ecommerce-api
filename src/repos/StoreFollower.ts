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

    public async getFollowers(storeId: number){
        
    }
}