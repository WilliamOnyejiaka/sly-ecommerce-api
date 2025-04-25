import BaseService from "./bases/BaseService";
import { FavoriteStore as FavoriteStoreRepo } from "./../repos";
import { getPagination } from "../utils";

export default class FavoriteStore extends BaseService<FavoriteStoreRepo> {

    public constructor() {
        super(new FavoriteStoreRepo())
    }

    public async addStore(storeId: number, customerId: number) {
        const repoResult = await this.repo!.insertFavorite(storeId, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        // const imageUrls = data!.product.productImage.map((item: any) => item.imageUrl);
        // data.product.productImage = imageUrls;
        return this.responseData(201, false, "Product was added successfully", repoResult.data);
    }

    public async favoriteStore(customerId: number, storeId: number) {
        const repoResult = await this.repo!.getFavoriteStore(storeId, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        // if (data) {
        //     const imageUrls = data!.product.productImage.map((item: any) => item.imageUrl);
        //     data.product.productImage = imageUrls;
        // }
        return super.responseData(200, false, repoResult.message, data);
    }

    public async favoriteStores(customerId: number, page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getFavoriteStores(customerId, skip, take);
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
        return super.responseData(200, true, "Stores were retrieved successfully", { items, pagination });
    }
}