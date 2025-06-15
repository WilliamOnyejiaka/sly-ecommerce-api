import BaseService from "./bases/BaseService";
import { StoreFollower as StoreFollowerRepo, StoreDetails } from "../repos";
import { redisClient, streamRouter } from "../config";
import { StreamGroups, StreamEvents, UserType } from "../types/enums";
import cluster from "cluster";
import { newFollowerQueue } from "../jobs/queues";

export default class StoreFollower extends BaseService<StoreFollowerRepo> {

    private readonly storeRepo = new StoreDetails();

    public constructor() {
        super(new StoreFollowerRepo())
    }

    public async follow(storeId: number, customerId: number) {
        const repoResult = await this.storeRepo!.getItemWithId(storeId)
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        console.log("repoResult", repoResult.error, " ", repoResult.message);

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
            if (data.action == "follow") {
                try {
                    const job = await newFollowerQueue.add('newFollowerQueue', { // TODO: be adding jobs in try catch
                        vendorId: repoResult.data.id,
                        customerId,
                        storeId
                    });
                } catch (error) {
                    console.log("Job failed: ", error);
                }
            }
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

    public async getFollowers(storeId: number) {

    }

}