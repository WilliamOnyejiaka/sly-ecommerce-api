import { StoreFollower as StoreFollowerService } from "../services";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";

export default class StoreFollower {

    protected static readonly service: StoreFollowerService = new StoreFollowerService();

    public static async follow(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const userId = res.locals.data.id as number;
        const storeId = Number(req.params.storeId);
        const result = await StoreFollower.service.follow(storeId, userId)
        Controller.response(res, result);
    }

    public static async countFollowers(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeId = Number(req.params.storeId);
        const result = await StoreFollower.service.countFollowers(storeId)
        Controller.response(res, result);
    }
}