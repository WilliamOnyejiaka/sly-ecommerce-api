import Service from "./Service";
import constants, { http } from "../constants";
import { Category as CategoryRepo } from "../repos";
import { CategoryDto } from "../types/dtos";

export default class Category extends Service<CategoryRepo> {

    public constructor() {
        super(new CategoryRepo());
    }

    public async createCategory(categoryData: CategoryDto){
        return await super.create<CategoryDto>(categoryData,"Category");
    }

    public async getCategoryWithName(categoryName: string) {
        const repoResult = await this.repo!.getCategoryWithName(categoryName);

        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const category = repoResult.data;
        const statusCode = category ? 200 : 404;
        const error: boolean = !category;
        const message = error ? "Category was not found" : constants('200Category')!;

        return super.responseData(statusCode, error, message, category);
    }

    public async getCategoryWithId(categoryId: number) {
        return await super.getItemWithId(categoryId,constants('200Category')!);
    }

    public async delete(id: number) {
        const repoResult = await this.repo!.deleteCategory(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type!, true, repoResult.message!);
        }

        return super.responseData(200, !repoResult.error, "Category was deleted successfully");
    }
}