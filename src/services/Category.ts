import Service from "./Service";
import constants, { http } from "../constants";
import { Category as CategoryRepo } from "../repos";
import { CategoryDto } from "../types/dtos";

export default class Category extends Service<CategoryRepo> {

    public constructor() {
        super(new CategoryRepo());
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

    public async delete(id: number) {
        return await super.deleteWithId(id);
    }

    public async update(categoryId: number,updateData: any){
        
    }
}