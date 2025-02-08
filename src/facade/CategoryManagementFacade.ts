import { Category, SubCategory } from "../services";
import { CategoryDto, SubCategoryDto } from "../types/dtos";
import { CategoryType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class CategoryManagementFacade extends BaseFacade {

    private readonly categoryService = new Category();
    private readonly subCategoryService = new SubCategory();

    public constructor() {
        super("Invalid category");
    }

    public getCategoryService(category: CategoryType) {
        const services = {
            [CategoryType.Main]: this.categoryService,
            [CategoryType.SubMain]: this.subCategoryService,
            [CategoryType.Sub]: this.categoryService,
        };
        return services[category] || null;
    }

    public async createCategory(categoryData: CategoryDto | SubCategoryDto, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.createCategory(categoryData as any);
    }

    public async createCategoryAll(categoryData: CategoryDto | SubCategoryDto, image: Express.Multer.File, category: CategoryType) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.createCategoryAll(categoryData as any, image);
    }

    public async getCategory(identifier: string | number, category: CategoryType, admin: boolean = false) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.getCategory(identifier, admin);
    }

    public async adminGetCategory(identifier: string, category: CategoryType) {
        return await this.getCategory(identifier, category, true)
    }

    public async getAllCategories(category: CategoryType, admin: boolean = false) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.getAllCategories(admin);
    }

    public async adminGetCategories(category: CategoryType) {
        return await this.getAllCategories(category, true)
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

    public async toggleActiveStatus(id: number, activate: boolean = true) {
        return await this, this.categoryService.toggleActiveStatus(id, activate);
    }

    public async updateName(id: number, category: CategoryType, name: string) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.updateName(id, name);
    }

    public async updatePriority(id: number, category: CategoryType, priority: number) {
        const service = this.getCategoryService(category);
        if (!service) return this.invalidType();
        return await service.updatePriority(id, priority);
    }

    public async paginateSubCategoryWithCategoryId(page: number, pageSize: number, categoryId: number) {
        return this.subCategoryService.paginateSubCategoryWithCategoryId(page, pageSize, categoryId);
    }
}