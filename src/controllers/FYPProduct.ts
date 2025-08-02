import { Request, Response } from "express";
import { Controller } from ".";
import { validationResult } from "express-validator";
import { FYP as FYPService } from "../services/Product";

export default class FYPProduct {

    private static readonly service: FYPService = new FYPService();

    public static async like(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const userId = res.locals.data.id as number;
        const productId = Number(req.params.productId);
        const result = await FYPProduct.service.like(productId, userId);
        Controller.response(res, result);
    }

    public static async getProduct(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);        
        const result = await FYPProduct.service.fypProduct(id);
        return Controller.response(res, result)
    }

    public static async getProducts(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);

        const result = await FYPProduct.service.fypProducts(page, limit);
        Controller.response(res, result);
    }

    public static async getStoreProducts(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const storeId = Number(req.params.storeId);

        const result = await FYPProduct.service.getStoreProducts(page, limit, storeId);
        Controller.response(res, result);
    }
}
