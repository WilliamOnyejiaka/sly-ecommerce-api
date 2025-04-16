import constants, { http, HttpStatus } from "../constants";
import { SubCategory as SubCategoryRepo, SubCategoryImage } from "../repos";
import { SubCategoryDto } from "../types/dtos";
import { CdnFolders } from "../types/enums";
import AssetService from "./bases/AssetService";

export default class SubCategory extends AssetService<SubCategoryRepo, SubCategoryImage> {

    public constructor() {
        super(new SubCategoryRepo(), new SubCategoryImage(), CdnFolders.SUB_CATEGORY);
    }

    public async createCategory(categoryData: SubCategoryDto) {
        return await super.create<SubCategoryDto>(categoryData, "SubCategory");
    }

    public async createCategoryAll(categoryDetailsDto: SubCategoryDto, image: Express.Multer.File) {
        const categoryNameServiceResult = await super.getItemWithName(categoryDetailsDto.name);
        if (categoryNameServiceResult.json.error) return categoryNameServiceResult;
        if (categoryNameServiceResult.json.data) return super.responseData(HttpStatus.BAD_REQUEST, true, "SubCategory name already exists");

        return await super.createAsset(categoryDetailsDto, image);
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
        const message = "SubCategory name has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async updatePriority(id: number, priority: number) {
        const repoResult = await this.repo!.updateItem(id, { priority: priority });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "SubCategory priority has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async paginateSubCategoryWithCategoryId(page: number, pageSize: number, categoryId: number) {
        const serviceResult = await super.paginate(page, pageSize, {
            where: { categoryId: categoryId }
        });
        if (!serviceResult.json.error) super.sanitizeImageItems(serviceResult.json.data.data);
        return serviceResult;
    }
}

