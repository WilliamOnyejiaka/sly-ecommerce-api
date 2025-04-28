import { Request, Response } from "express";
import { Controller } from ".";
import { validationResult } from "express-validator";
import { ProductRating as ProductRatingService } from "../services";

export default class ProductRating {

    private static readonly service: ProductRatingService = new ProductRatingService();

    public static async rate(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const productId = Number(req.body.productId);
        const rating = Number(req.body.rating);
        if (rating < 1 || rating > 10) {
            res.status(400).json({
                error: true,
                message: "Rating must be greater than 0 and less than 11"
            });
            return;
        }
        const customerId = res.locals.data.id;

        const result = await ProductRating.service.rate(productId, customerId, rating);
        Controller.response(res, result);
    }

    public static async getRating(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);
        const result = await ProductRating.service.getRating(id);
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
        const productId = Number(req.query.productId);

        const result = await ProductRating.service.getRatings(productId, page, limit);
        Controller.response(res, result);
    }

}
