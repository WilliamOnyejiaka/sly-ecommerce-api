import { Request, Response } from "express";
import { Controller } from ".";
import { validationResult } from "express-validator";
import { StoreRating as StoreRatingService } from "../services";

export default class StoreRating {

    private static readonly service: StoreRatingService = new StoreRatingService();

    public static async rate(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeId = Number(req.body.storeId);
        const rating = Number(req.body.rating);
        if (rating < 1 || rating > 10) {
            res.status(400).json({
                error: true,
                message: "Rating must be greater than 0 and less than 11"
            });
            return;
        }
        const customerId = res.locals.data.id;

        const result = await StoreRating.service.rate(storeId, customerId, rating);
        Controller.response(res, result);
    }

    public static async getRating(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);
        const result = await StoreRating.service.getRating(id);
        return Controller.response(res, result)
    }

    public static async getRatings(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const storeId = Number(req.query.storeId);

        const result = await StoreRating.service.getRatings(storeId, page, limit);
        Controller.response(res, result);
    }

}
