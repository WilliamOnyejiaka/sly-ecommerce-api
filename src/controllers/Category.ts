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

    public static getAllCategories(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Category.facade.getAllCategories(category);
            Controller.response(res, serviceResult);
        }
    }

    public static getCategoryWithName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Category.facade.getCategory(req.params.categoryName, category);
            Controller.response(res, serviceResult);
        }
    }

    public static getCategoryWithId(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.params.categoryId);

            if (idResult.error) {
                res.status(400).send("Category id must be an integer");
                return;
            }

            const serviceResult = await Category.facade.getCategory(idResult.number, category);
            Controller.response(res, serviceResult);
        }
    }
}