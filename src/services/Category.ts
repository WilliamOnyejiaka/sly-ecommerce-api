import BaseService from "./bases/BaseService";
import constants, { http } from "../constants";
import { Category as CategoryRepo } from "../repos";
import { CategoryDto } from "../types/dtos";
import AssetService from "./bases/AssetService";
import CategoryImage from "../repos/CategoryImage";

export default class Category extends AssetService<CategoryRepo,CategoryImage> {

    public constructor() {
        super(new CategoryRepo(),new CategoryImage(),'categoryImage');
    }

    public async createCategory(categoryData: CategoryDto) {
        return await super.create<CategoryDto>(categoryData, "Category");
    }

    public async getCategoryWithName(categoryName: string) {
        return await super.getItemWithName(categoryName);
    }

    public async getCategoryWithId(categoryId: number) {
        return await super.getItemWithId(categoryId, constants('200Category'));
    }

    public async getAllCategories() {
        return await super.getAllItems(constants('200Categories')!);
    }

    public async update(categoryId: number, updateData: any) {

    }
}