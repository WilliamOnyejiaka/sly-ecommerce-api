import prisma from ".";
import { SubCategoryDto } from "../types/dtos";
import AssetRepo from "./bases/AssetRepo";


export default class SubCategory extends AssetRepo {

    public constructor() {
        super('subCategory','SubCategoryImage');
    }

    public async insertSubCategory(data: SubCategoryDto) {
        return await super.insert(data)
    }   
}
