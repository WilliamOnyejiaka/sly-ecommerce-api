import { Request, Response } from "express";
import { Controller } from ".";
import { InventoryDto, ProductDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { validationResult } from "express-validator";
import { NewProductInbox as NewProductInboxService } from "../services";

export default class NewProductInbox {

    private static readonly service: NewProductInboxService = new NewProductInboxService();


    public static inbox(viewed?: boolean) {
        return async (req: Request, res: Response) => {

            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const limit = Number(req.query.limit);
            const page = Number(req.query.page);
            const customerId = res.locals.data.id;

            const result = await NewProductInbox.service.inbox(customerId, page, limit, viewed);
            Controller.response(res, result);
        }
    }

    public static viewed() {
        return NewProductInbox.inbox(true);
    }

    public static unViewed() {
        return NewProductInbox.inbox(false);
    }

    public static async markAsViewed(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);
        const customerId = res.locals.data.id;

        const result = await NewProductInbox.service.markAsViewed(customerId, id);
        Controller.response(res, result);
    }
}
