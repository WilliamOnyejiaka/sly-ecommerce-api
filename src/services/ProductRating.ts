
import BaseService from "./bases/BaseService";
import { ProductRating as ProductRatingRepo } from "./../repos";
import { getPagination } from "../utils";

export default class ProductRating extends BaseService<ProductRatingRepo> {

    public constructor() {
        super(new ProductRatingRepo())
    }

    public async rate(productId: number, customerId: number, rating: number) {
        const repoResult = await this.repo!.rate(productId, customerId, rating);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return this.responseData(201, false, repoResult.message, repoResult.data);
    }

    public async getRating(id: number) {
        const repoResult = await this.repo!.getRating(id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const statusCode = data ? 200 : 404;
        if (data) {
            const imageUrls = data!.customer.CustomerProfilePic.map((item: any) => item.imageUrl);
            data.customer.CustomerProfilePic = imageUrls;
        }
        return super.responseData(statusCode, false, repoResult.message, data);
    }

    public async getRatings(productId: number, page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getRatings(productId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        let items = data.items;
        if (items) {
            items = items.map((item: any) => ({
                ...item,
                customer: { ...item.customer, CustomerProfilePic: item.customer.CustomerProfilePic.map((img: any) => img.imageUrl) }
            }));
        }
        return super.responseData(200, true, "Ratings were retrieved successfully", { items, pagination });
    }
}