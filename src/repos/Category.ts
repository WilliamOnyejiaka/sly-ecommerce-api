import prisma from ".";
import { CategoryDto } from "../types/dtos";
import Repo from "./Repo"


export default class Category extends Repo {

    public constructor() {
        super('category');
    }

    public async insertCategory(data: CategoryDto) {
        return await super.insert(data)
    }

    public async getCategoryWithId(id: number) {
        return await super.getItemWithId(id);
    }

    public async getCategoryWithName(name: string) {
        return await super.getItem({ name: name });
    }

    public async deleteCategory(id: number) {
        return super.delete({ id: id }, `${this.tblName} with id - ${id} does not exist.`);
    }
}
