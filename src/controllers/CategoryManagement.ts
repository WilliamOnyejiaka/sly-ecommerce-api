import { Request, Response } from "express";
// import { Category } from "../services";
import { CategoryDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { Controller } from ".";
import Category from "./Category";
import { CategoryType } from "../types/enums";

export default class CategoryManagement extends Category {

    // private static readonly service: Category = new Category();

    public static async createCategory(req: Request, res: Response) {
        if (typeof req.body.active !== "boolean") {
            res.status(400).json({
                error: true,
                message: "active must be a boolean"
            });
            return;
        }

        const priorityResult = numberValidator(req.body.priority);
        if (priorityResult.error) {
            res.status(400).json({
                error: true,
                message: "priority must be an integer"
            });
            return;
        }

        req.body.priority = priorityResult.number;
        const adminId = res.locals.data.id;
        const categoryData: CategoryDto = {
            ...req.body,
            adminId: adminId
        };

        // const categoryExistsResult = await CategoryManagement.facade.getCategoryWithName(categoryData.name);
        // if (categoryExistsResult.json.error && categoryExistsResult.statusCode == 500) {
        //     res.status(categoryExistsResult.statusCode).json(categoryExistsResult.json);
        //     return;
        // }

        // if (categoryExistsResult.json.data) {
        //     res.status(400).json({
        //         error: false,
        //         message: "Category already exists"
        //     });
        //     return;
        // }

        const serviceResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.Main);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("Category id must be an integer");
            return;
        }

        const serviceResult = await Category.facade.deleteCategory(idResult.number, CategoryType.Main);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}