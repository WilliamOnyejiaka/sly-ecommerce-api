import constants, { http } from "../constants";
import { SubCategory as SubCategoryRepo, SubCategoryImage } from "../repos";
import { SubCategoryDto } from "../types/dtos";
import AssetService from "./bases/AssetService";

export default class SubCategory extends AssetService<SubCategoryRepo, SubCategoryImage> {

    public constructor() {
        super(new SubCategoryRepo(), new SubCategoryImage(), 'category');
    }

    public async createCategory(categoryData: SubCategoryDto) {
        return await super.create<SubCategoryDto>(categoryData, "SubCategory");
    }

    public async getCategory(identifier: string | number, admin: boolean = false) {
        const serviceResult = await super.getItemAndImage(identifier);
        if (admin) return serviceResult;

        if (serviceResult.json.data) {
            this.sanitizeData([serviceResult.json.data], ['adminId']);
        }

        return serviceResult;
    }

    public async getAllCategories(admin: boolean = false) {
        const message = constants('200Categories')!;
        return await super.getAllAssetItems(message);
    }

    public async updateName(id: number, name: string) {
        const repoResult = await this.repo!.updateItem(id, { name: name });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "Category name has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async updatePriority(id: number, priority: number) {
        const repoResult = await this.repo!.updateItem(id, { priority: priority });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "Category priority has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }
}