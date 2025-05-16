import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { Controller } from ".";
import { CategoryManagementFacade } from "../facade";
import { CategoryType } from "../types/enums";
import { validationResult } from "express-validator";

export default abstract class Category {

    protected static readonly facade: CategoryManagementFacade = new CategoryManagementFacade();

    public static paginateCategories(category: CategoryType) {
        const service = Category.facade.getCategoryService(category);
        return Controller.paginateAssetItems<typeof service>(service);
    }

    public static async paginateSubCategoryWithCategoryId(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const { page, limit } = req.query;
        const categoryId = Number(req.params.categoryId);

        const facadeResult = await Category.facade.paginateSubCategoryWithCategoryId(Number(page), Number(limit), Number(categoryId));
        res.status(facadeResult.statusCode).json(facadeResult.json);
    }

    public static getAllCategories(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.getAllCategories(category);
            Controller.response(res, facadeResult);
        }
    }

    public static getWithName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.getCategory(req.params.categoryName, category);
            Controller.response(res, facadeResult);
        }
    }

    public static getWithId(category: CategoryType) {
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