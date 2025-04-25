import { Request, Response } from "express";
import { Controller } from ".";
import { validationResult } from "express-validator";
import { SavedProduct as SavedProductService } from "../services";

export default class SavedProduct {

    private static readonly service: SavedProductService = new SavedProductService();


    public static async addProduct(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const productId = Number(req.body.productId);
        const customerId = res.locals.data.id;

        const result = await SavedProduct.service.addProduct(productId, customerId);
        Controller.response(res, result);
    }

    public static async savedProduct(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const productId = Number(req.params.productId);
        const customerId = res.locals.data.id;
        const result = await SavedProduct.service.savedProduct(customerId, productId);
        return Controller.response(res, result)
    }

    public static async savedProducts(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);

        const customerId = res.locals.data.id;
        const result = await SavedProduct.service.savedProducts(customerId, page, limit);
        Controller.response(res, result);
    }

}
