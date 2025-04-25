import BaseService from "./bases/BaseService";
import { SavedProduct as SavedProductRepo } from "./../repos";
import { getPagination } from "../utils";

export default class SavedProduct extends BaseService<SavedProductRepo> {

    public constructor() {
        super(new SavedProductRepo())
    }

    public async addProduct(productId: number, customerId: number) {
        const repoResult = await this.repo!.insertProduct(productId, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const imageUrls = data!.product.productImage.map((item: any) => item.imageUrl);
        data.product.productImage = imageUrls;
        return this.responseData(201, false, "Product was added successfully", repoResult.data);
    }

    public async savedProduct(customerId: number, productId: number) {
        const repoResult = await this.repo!.getSavedProduct(productId, customerId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        if (data) {
            const imageUrls = data!.product.productImage.map((item: any) => item.imageUrl);
            data.product.productImage = imageUrls;
        }
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
        if (items) {
            items = items.map((item: any) => ({
                ...item,
                product: { ...item.product, productImage: item.product.productImage.map((img: any) => img.imageUrl) }
            }));
        }
        return super.responseData(200, true, "Products were retrieved successfully", { items, pagination });
    }
}