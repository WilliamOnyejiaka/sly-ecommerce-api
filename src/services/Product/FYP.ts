import Product from "./Product";
import { getPagination } from "../../utils";

export default class FYP extends Product {

    protected readonly storeImages: string[] = ['storeLogo', 'firstStoreBanner', 'secondStoreBanner'];

    public async like(productId: number, customerId: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const repoResult = await this.repo!.getProduct(productId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        if (repoResult.data) {
            const likeResult = await this.productLikeRepo.toggleLike(customerId, productId);
            const likeResultError = this.handleRepoError(likeResult);
            if (likeResultError) return likeResultError;
            return this.responseData(200, false, "Action was taken", likeResult.data);
        }
        return this.responseData(404, true, "Product was not found");
    }

    public async fypProduct(productId: number) {
        const repoResult = await this.repo!.getFYPProduct(productId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        if (data) {
            const imageUrls = data!.productImage.map((item: any) => item.imageUrl);
            data.productImage = imageUrls;
            super.setImageUrls([data.store], this.storeImages);
            return super.responseData(200, false, repoResult.message, data);
        }
        return super.responseData(404, false, "Product was not found", data);
    }

    public async fypProducts(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getFYPProducts(skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        let items = data.items;
        if (items) {
            items = items.map((item: any) => ({
                ...item,
                productImage: item.productImage.map((img: any) => img.imageUrl)
            }));
            items.forEach((item: any) => {
                super.setImageUrls([item.store], this.storeImages);
            });
        }
        return super.responseData(200, false, "Products were retrieved successfully", { items, pagination });
    }
}