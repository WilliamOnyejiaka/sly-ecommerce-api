
import BaseService from "./bases/BaseService";
import { StoreRating as StoreRatingRepo } from "./../repos";
import { getPagination } from "../utils";

export default class StoreRating extends BaseService<StoreRatingRepo> {

    public constructor() {
        super(new StoreRatingRepo())
    }

    public async rate(storeId: number, customerId: number, rating: number) {
        const repoResult = await this.repo!.rate(storeId, customerId, rating);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        // const imageUrls = data!.customer.CustomerProfilePic.map((item: any) => item.imageUrl);
        // data.product.productImage = imageUrls;
        return this.responseData(201, false, data.message, repoResult.data);
    }

    public async getRating(id: number) {
        const repoResult = await this.repo!.getRating(id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        // if (data) {
        //     const imageUrls = data!.product.productImage.map((item: any) => item.imageUrl);
        //     data.product.productImage = imageUrls;
        // }
        return super.responseData(200, false, repoResult.message, data);
    }

    public async getRatings(storeId: number, page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getRatings(storeId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        let items = data.items;
        // if (items) {
        //     items = items.map((item: any) => ({
        //         ...item,
        //         product: { ...item.product, productImage: item.product.productImage.map((img: any) => img.imageUrl) }
        //     }));
        // }
        return super.responseData(200, true, "Ratings were retrieved successfully", { items, pagination });
    }
}