import { Request, Response } from "express";
import { Category as CategoryService } from "../services";
import { CategoryDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { Controller } from ".";

export default abstract class Category {

    protected static readonly service: CategoryService = new CategoryService();

    public static paginateCategories() {
        return Controller.paginate<CategoryService>(Category.service);
    }

    public static async getAllCategories(req: Request, res: Response) {
        const serviceResult = await Category.service.getAllCategories();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getCategoryWithName(req: Request, res: Response) {
        const serviceResult = await Category.service.getCategoryWithName(req.params.categoryName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getCategoryWithId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.categoryId);

        if (idResult.error) {
            res.status(400).send("Category id must be an integer");
            return;
        }

        const serviceResult = await Category.service.getCategoryWithId(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}