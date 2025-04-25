import { Request, Response } from "express";
import { Controller } from ".";
import { validationResult } from "express-validator";
import { FavoriteStore as FavoriteStoreService } from "../services";

export default class FavoriteStore {

    private static readonly service: FavoriteStoreService = new FavoriteStoreService();


    public static async addStore(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeId = Number(req.body.storeId);
        const customerId = res.locals.data.id;

        const result = await FavoriteStore.service.addStore(storeId, customerId);
        Controller.response(res, result);
    }

    public static async favoriteStore(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeId = Number(req.params.storeId);
        const customerId = res.locals.data.id;
        const result = await FavoriteStore.service.favoriteStore(customerId, storeId);
        return Controller.response(res, result)
    }

    public static async favoriteStores(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);

        const customerId = res.locals.data.id;
        const result = await FavoriteStore.service.favoriteStores(customerId, page, limit);
        Controller.response(res, result);
    }

}
