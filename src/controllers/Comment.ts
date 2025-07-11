import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ProductComment } from "../services";
import { numberValidator } from "../validators";

export default class Comment {

    private static service = new ProductComment();

    public static async createProductComment(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = res.locals.data.id as number;
        let { content, productId, parentId } = req.body;
        if (parentId) {
            const { error, number } = numberValidator(parentId);
            parentId = !error ? number : undefined;
        }

        const serviceResult = await Comment.service.createComment({
            content: content as string,
            customerId: userId,
            productId: Number(productId),
            parentId
        });

        Controller.response(res, serviceResult);
    }

    public static async getWithId(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);
        const depth = parseInt(req.query.depth as string) || 5;
        const result = await Comment.service.getWithId(id, depth);
        Controller.response(res, result);
    }

    public static async paginate(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const depth = parseInt(req.query.depth as string) || 5;
        const productId = Number(req.params.productId);
        const result = await Comment.service.paginateComments(productId, page, limit, depth);
        Controller.response(res, result);
    }

    public static async paginateReplies(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const depth = parseInt(req.query.depth as string) || 5;
        const parentId = Number(req.params.parentId);
        const productId = Number(req.params.productId);
        const result = await Comment.service.paginateReplies(productId, page, limit, depth, parentId);
        Controller.response(res, result);
    }

    public static async like(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const userId = res.locals.data.id as number;
        const commentId = Number(req.params.commentId);
        const result = await Comment.service.like(commentId, userId);
        Controller.response(res, result);
    }
}