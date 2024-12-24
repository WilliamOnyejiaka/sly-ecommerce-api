import { Category } from "../services";
import { CategoryDto } from "../types/dtos";
import { CategoryType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class CategoryManagementFacade extends BaseFacade {

    private readonly categoryService = new Category();

    public constructor() {
        super("Invalid category");
    }

    public getCategoryService(category: CategoryType) {
        const services = {
            [CategoryType.Main]: this.categoryService,
            [CategoryType.SubMain]: this.categoryService,
            [CategoryType.Sub]: this.categoryService,
        };
        return services[category] || null;
    }

    public async createCategory(categoryData: CategoryDto,category: CategoryType){
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.createCategory(categoryData);
    }

    public async getCategoryWithId(categoryId: number, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.getCategoryWithId(categoryId);
    }

    public async getCategoryWithName(categoryName: string, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.getCategoryWithName(categoryName);
    }

    public async getAllCategories(category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.getAllCategories();
    }

    public async deleteCategory(categoryId: number, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.deleteItem(categoryId);
    }

    public async uploadImage(image: Express.Multer.File, categoryId: number, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.uploadImage(image, categoryId);
    }
}