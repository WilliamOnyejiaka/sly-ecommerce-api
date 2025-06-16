import BaseService from "./bases/BaseService";
import { StoreFollower as StoreFollowerRepo, StoreDetails } from "../repos";
import { newFollowerQueue } from "../jobs/queues";
import { getPagination } from "../utils";


export default class StoreFollower extends BaseService<StoreFollowerRepo> {

    private readonly storeRepo = new StoreDetails();

    public constructor() {
        super(new StoreFollowerRepo())
    }

    public async follow(storeId: number, customerId: number) {
        const repoResult = await this.storeRepo!.getItemWithId(storeId)
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        if (repoResult.data) {
            const followResult = await this.repo!.toggleFollow(customerId, storeId);
            const followResultError = this.handleRepoError(followResult);
            if (followResultError) return followResultError;
            const data = followResult.data as { action: "follow" | "unfollow", totalFollowers: number };

            if (data.action == "follow") {
                try {
                    const job = await newFollowerQueue.add('newFollowerQueue', { // TODO: be adding jobs in try catch
                        vendorId: repoResult.data.vendorId,
                        customerId,
                        storeId
                    });
                } catch (error) {
                    console.error("Job failed: ", error);
                }
            }
            return this.responseData(200, false, "An action was taken", followResult.data);
        }
        return this.responseData(404, true, "Store was not found");
    }

    public async countFollowers(storeId: number) {
        const followResult = await this.repo!.countFollowers(storeId);
        const followResultError = this.handleRepoError(followResult);
        if (followResultError) return followResultError;
        return this.responseData(200, false, "Followers count was retrieved successfully", { totalFollowers: followResult.data });
    }

    public async countFollowing(customerId: number) {
        const followResult = await this.repo!.countFollowing(customerId);
        const followResultError = this.handleRepoError(followResult);
        if (followResultError) return followResultError;
        return this.responseData(200, false, "Following count was retrieved successfully", { totalFollowing: followResult.data });
    }

    public async getFollowers(storeId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const take = limit;

        const repoResult = await this.repo!.getFollowers(skip, take, storeId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, limit, totalRecords);
        let items = data.items;
        if (items) {
            items = items.map((item: any) => ({
                ...item,
                customer: { ...item.customer, CustomerProfilePic: this.getImage(item.customer.CustomerProfilePic) }
            }));
        }
        return super.responseData(200, true, "Followers were retrieved successfully", { items, pagination });
    }

    public async following(customerId: number, page: number, limit: number) {
        const { skip, take } = this.skipTake(page, limit)

        const repoResult = await this.repo!.following(skip, take, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, limit, totalRecords);
        let items = data.items;

        if (items) {
            items = items.map((item: any) => ({
                ...item,
                store: {
                    ...item.store,
                    storeLogo: item.store.storeLogo.map((img: any) => img.imageUrl)[0],
                    firstStoreBanner: item.store.firstStoreBanner.map((img: any) => img.imageUrl)[0],
                    secondStoreBanner: this.getImage(item.store.secondStoreBanner),
                    vendor: {
                        ...item.store.vendor,
                        profilePicture: this.getImage(item.store.vendor.profilePicture),
                    }
                }
            }));
        }
        return super.responseData(200, true, "Following was retrieved successfully", { items, pagination });
    }

}