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

        const serviceResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.Main);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createSubCategory(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const categoryData: SubCategoryDto = { ...req.body };

        const serviceResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.SubMain);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createCategoryAll(req: Request, res: Response) {

    }

    public static override getCategoryWithName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Category.facade.adminGetCategory(req.params.categoryName, category);
            Controller.response(res, serviceResult);
        };
    }

    public static getAllCategories(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Category.facade.adminGetCategories(category);
            Controller.response(res, serviceResult);
        }
    }

    // public static override async getAllCategories(req: Request, res: Response) {
    //     const serviceResult = await Category.facade.adminGetCategories(CategoryType.Main);
    //     Controller.response(res, serviceResult);
    // }

    public static async toggleActiveStatus(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const { id, activate } = req.body;
        const serviceResult = await Category.facade.toggleActiveStatus(id, activate);
        Controller.response(res, serviceResult);
    }

    public static updateName(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const { id, name } = req.body;
            const serviceResult = await Category.facade.updateName(id, category, name);
            Controller.response(res, serviceResult);
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
            const serviceResult = await Category.facade.updatePriority(id, category, priority);
            Controller.response(res, serviceResult);
        };
    }

    public static uploadCategoryImage(category: CategoryType) {
        return async (req: Request, res: Response) => {
            const image = req.file!;
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                if (!(await Controller.deleteFiles([image]))) {
                    Controller.handleValidationErrors(res, validationErrors);
                    return;
                }
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: true,
                    message: http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!,
                    data: {}
                });
                return;
            }

            const categoryId = Number(req.params.categoryId);
            const serviceResult = await Category.facade.uploadImage(image, categoryId, category);
            Controller.response(res, serviceResult);
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
            const serviceResult = await Category.facade.deleteCategory(categoryId, category);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

}