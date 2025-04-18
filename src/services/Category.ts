import constants, { http, HttpStatus } from "../constants";
import { Category as CategoryRepo, CategoryImage } from "../repos";
import { CategoryDto } from "../types/dtos";
import { CdnFolders } from "../types/enums";
import AssetService from "./bases/AssetService";

export default class Category extends AssetService<CategoryRepo, CategoryImage> {

    public constructor() {
        super(new CategoryRepo(), new CategoryImage(), CdnFolders.CATEGORY);
    }

    public async createCategory(categoryData: CategoryDto) {
        return await super.create<CategoryDto>(categoryData, "Category");
    }

    public async createCategoryAll(categoryDetailsDto: CategoryDto, image: Express.Multer.File) {
        const categoryNameServiceResult = await super.getItemWithName(categoryDetailsDto.name);
        if(categoryNameServiceResult.json.error) return categoryNameServiceResult;
        if (categoryNameServiceResult.json.data) return super.responseData(HttpStatus.BAD_REQUEST, true, "Category name already exists");
        return await super.createAsset(categoryDetailsDto, image);
    }

    private sanitizeServiceResult(serviceResult: any, admin: boolean, fieldsToRemove: string[] = ['adminId']) {
        if (!admin && serviceResult.json?.data) {
            // Handle both single objects and arrays of data
            const data = Array.isArray(serviceResult.json.data)
                ? serviceResult.json.data
                : [serviceResult.json.data];

            this.sanitizeData(data, fieldsToRemove);
        }
        return serviceResult;
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
        return admin ? await super.getAllAssetItems(message) : await super.getAllAssetItems(message, ['adminId']);
    }

    public async toggleActiveStatus(id: number, activate: boolean = true) {
        const repoResult = await this.repo!.updateItem(id, { active: activate });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = activate ? "Category was activated successfully" : "Category was deactivated successfully";
        return super.responseData(200, false, message, repoResult.data);
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