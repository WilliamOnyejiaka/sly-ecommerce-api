import { Request, Response } from "express";
import { CategoryDto, SubCategoryDto } from "../types/dtos";
import { Controller } from ".";
import Category from "./Category";
import { CategoryType } from "../types/enums";
import { validationResult } from "express-validator";
import { http, HttpStatus } from "../constants";

export default class CategoryManagement extends Category {

    public static async createCategory(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = res.locals.data.id;
        const categoryData: CategoryDto = {
            ...req.body,
            adminId: adminId
        };

        const facadeResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.Main);
        res.status(facadeResult.statusCode).json(facadeResult.json);
    }

    public static async createCategoryAll(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        const image = req.file!

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        let active;
        let priority;

        try {
            active = req.body.active.toLowerCase() === "true";
            priority = Number(req.body.priority);
        } catch (error) {
            res.status(400).json({
                error: true,
                message: "Active or Priority type is invalid"
            });
            return;
        }

        const categoryData: CategoryDto = {
            name: req.body.name,
            active: active,
            priority: priority,
            adminId: res.locals.data.id
        };
        const facadeResult = await CategoryManagement.facade.createCategoryAll(categoryData, image, CategoryType.Main);
        Controller.response(res, facadeResult);
    }

    public static async createSubCategory(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const categoryData: SubCategoryDto = { ...req.body };

        const facadeResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.SubMain);
        res.status(facadeResult.statusCode).json(facadeResult.json);
    }

    public static async createSubCategoryAll(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        const image = req.file!

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        let priority;
        let categoryId;

        try {
            categoryId = Number(req.body.categoryId)
            priority = Number(req.body.priority);
        } catch (error) {
            res.status(400).json({
                error: true,
                message: "Active or Priority type is invalid"
            });
            return;
        }

        const categoryData: SubCategoryDto = {
            name: req.body.name,
            priority: priority,
            categoryId: categoryId
        };
        const facadeResult = await CategoryManagement.facade.createCategoryAll(categoryData, image, CategoryType.SubMain);
        Controller.response(res, facadeResult);
    }

    public static override getWithName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.adminGetCategory(req.params.categoryName, category);
            Controller.response(res, facadeResult);
        };
    }

    public static getAllCategories(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await Category.facade.adminGetCategories(category);
            Controller.response(res, facadeResult);
        }
    }

    public static async toggleActiveStatus(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const { id, activate } = req.body;
        const facadeResult = await Category.facade.toggleActiveStatus(id, activate);
        Controller.response(res, facadeResult);
    }

    public static updateName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const { id, name } = req.body;
            const facadeResult = await Category.facade.updateName(id, category, name);
            Controller.response(res, facadeResult);
        }
    }

    public static updatePriority(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const { id, priority } = req.body;
            const facadeResult = await Category.facade.updatePriority(id, category, priority);
            Controller.response(res, facadeResult);
        };
    }

    public static uploadCategoryImage(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const image = req.file!;
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const categoryId = Number(req.params.categoryId);
            const facadeResult = await Category.facade.uploadImage(image, categoryId, category);
            Controller.response(res, facadeResult);
        };
    }

    public static delete(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const categoryId = Number(req.params.id)
            const facadeResult = await Category.facade.deleteCategory(categoryId, category);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        }
    }

}