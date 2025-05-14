import Product from "./Product";
import { getPagination } from "../../utils";

export default class Draft extends Product {

    public async publish(productId: number, storeId: number) {
        const repoResult = await this.repo!.updateDraft(productId, storeId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return this.responseData(200, false, "Product was publish successfully", repoResult.data);
    }

    public async edit() {

    }

    public async drafts(page: number, pageSize: number, storeId: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.drafts(skip, take, storeId);
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
        }
        return super.responseData(200, false, repoResult.message, { items, pagination });
    }
}