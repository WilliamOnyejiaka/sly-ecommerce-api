import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { Controller } from ".";
import { CategoryManagementFacade } from "../facade";
import { CategoryType } from "../types/enums";

export default abstract class Category {

    protected static readonly facade: CategoryManagementFacade = new CategoryManagementFacade();

    public static paginateCategories(category: CategoryType) {
        const service = Category.facade.getCategoryService(category);
        return Controller.paginateAssetItems<typeof service>(service);
    }

    public static async paginateSubCategoryWithCategoryId(req: Request, res: Response) {
        const { page, pageSize } = req.query;
        const categoryId = Number(req.params.categoryId);

        const facadeResult = await Category.facade.paginateSubCategoryWithCategoryId(page as any, pageSize as any, categoryId as any);
        res.status(facadeResult.statusCode).json(facadeResult.json);
    }
    
    public static getAllCategories(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.getAllCategories(category);
            Controller.response(res, facadeResult);
        }
    }

    public static getCategoryWithName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.getCategory(req.params.categoryName, category);
            Controller.response(res, facadeResult);
        }
    }

    public static getCategoryWithId(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.params.categoryId);

            if (idResult.error) {
                res.status(400).send("Category id must be an integer");
                return;
            }

            const facadeResult = await Category.facade.getCategory(idResult.number, category);
            Controller.response(res, facadeResult);
        }
    }
}