import BaseService from "./bases/BaseService";
import { SavedProduct as SavedProductRepo } from "./../repos";
import { getPagination } from "../utils";

export default class SavedProduct extends BaseService<SavedProductRepo> {

    public constructor() {
        super(new SavedProductRepo())
    }

    public async addProduct(productId: number, customerId: number) {
        const repoResult = await this.repo!.insert({ productId, customerId });
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return this.responseData(201, false, "Product was added successfully", repoResult.data);
    }

    public async savedProduct(customerId: number, productId: number) {
        const repoResult = await this.repo!.getSavedProduct(productId, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        // const imageUrls = data!.productImage.map((item: any) => item.imageUrl);
        // data.productImage = imageUrls;
        console.log(data);

        return super.responseData(200, false, repoResult.message, data);
    }

    public async savedProducts(customerId: number, page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getSavedProducts(customerId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        let items = data.items;
        // items = items.map((item: any) => ({
        //     ...item,
        //     productImage: item.productImage.map((img: any) => img.imageUrl)
        // }));
        return super.responseData(200, true, "Products were retrieved successfully", { items, pagination });
    }
}