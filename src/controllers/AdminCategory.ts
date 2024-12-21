import { Request, Response } from "express";
import { Category } from "../services";
import { CategoryDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { Controller } from ".";

export default class AdminCategory {

    private static readonly service: Category = new Category();

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

        const categoryExistsResult = await AdminCategory.service.getCategoryWithName(categoryData.name);
        if (categoryExistsResult.json.error && categoryExistsResult.statusCode == 500) {
            res.status(categoryExistsResult.statusCode).json(categoryExistsResult.json);
            return;
        }

        if (categoryExistsResult.json.data) {
            res.status(400).json({
                error: false,
                message: "Category already exists"
            });
            return;
        }

        const serviceResult = await AdminCategory.service.createCategory(categoryData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static paginateCategories() {
        return Controller.paginate<Category>(AdminCategory.service);
    }

    public static async getAllCategories(req: Request, res: Response) {
        const serviceResult = await AdminCategory.service.getAllCategories();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getCategoryWithName(req: Request, res: Response) {
        const serviceResult = await AdminCategory.service.getCategoryWithName(req.params.categoryName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getCategoryWithId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.categoryId);

        if (idResult.error) {
            res.status(400).send("Category id must be an integer");
            return;
        }

        const serviceResult = await AdminCategory.service.getCategoryWithId(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("Category id must be an integer");
            return;
        }

        const serviceResult = await AdminCategory.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}