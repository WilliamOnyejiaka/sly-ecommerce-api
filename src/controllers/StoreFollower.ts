import { StoreFollower as StoreFollowerService } from "../services";
import { Request, Response } from "express";
import Controller from "./bases/Controller";

export default class StoreFollower {

    protected static readonly service: StoreFollowerService = new StoreFollowerService();

    public static async follow(req: Request, res: Response) {
        Controller.handleValidationError(req, res);
        const userId = res.locals.data.id as number;
        const storeId = Number(req.params.storeId);
        const result = await StoreFollower.service.follow(storeId, userId)
        Controller.response(res, result);
    }

    public static async countFollowers(req: Request, res: Response) {
        Controller.handleValidationError(req, res);
        const storeId = Number(req.params.storeId);
        const result = await StoreFollower.service.countFollowers(storeId)
        Controller.response(res, result);
    }

    public static async countFollowing(req: Request, res: Response) {
        Controller.handleValidationError(req, res);
        const customerId = Number(req.params.customerId);
        const result = await StoreFollower.service.countFollowing(customerId)
        Controller.response(res, result);
    }

    public static async followers(req: Request, res: Response) {
        Controller.handleValidationError(req, res);

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const storeId = Number(req.params.storeId);

        const result = await StoreFollower.service.getFollowers(storeId, page, limit);
        Controller.response(res, result);
    }

    public static async following(req: Request, res: Response) {
        Controller.handleValidationError(req, res);

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const userId = res.locals.data.id as number;

        const result = await StoreFollower.service.following(userId, page, limit);
        Controller.response(res, result);
    }
}