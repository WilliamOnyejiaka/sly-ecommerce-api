import BaseService from "./bases/BaseService";
import { StoreFollower as StoreFollowerRepo, StoreDetails } from "../repos";
import { streamRouter } from "../config";
import { StreamGroups, StreamEvents } from "../types/enums";

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
            await streamRouter.addEvent(StreamGroups.STORE, {
                type: StreamEvents.FOLLOW,
                data: {
                    storeId,
                    customerId,
                    action: data.action
                },
            });
            return this.responseData(200, false, "An action was taken", followResult.data);
        }
        return this.responseData(404, true, "Store was not found");
    }

    public async countFollowers(storeId: number) {
        const repoResult = await this.storeRepo!.getItemWithId(storeId)
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        if (repoResult.data) {
            const followResult = await this.repo!.countFollowers(storeId);
            const followResultError = this.handleRepoError(followResult);
            if (followResultError) return followResultError;
            return this.responseData(200, false, "Followers has been retrieved successfully", { totalFollowers: followResult.data });
        }
        return this.responseData(404, true, "Store was not found");
    }

}