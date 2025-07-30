import { Request, Response } from "express";
import { Controller } from ".";
import { InventoryDto, ProductDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { validationResult } from "express-validator";
import { Product as ProductService } from "../services";
import { Draft } from "../services/Product";

export default class ProductManagement {

    private static readonly service: ProductService = new ProductService();
    private static readonly draftService: Draft = new Draft();

    public static async drafts(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeId = Number(req.params.storeId);
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const result = await ProductManagement.draftService.drafts(page, limit, storeId);
        return Controller.response(res, result);
    }

    public static async publishDraft(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        let {
            productId,
            storeId
        } = req.body;


        storeId = Number(storeId);
        productId = Number(productId);
        const result = await ProductManagement.draftService.publish(productId, storeId);
        return Controller.response(res, result);
    }

    public static async getProduct(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = Number(req.params.id);
        const userId = Number(res.locals.data.id);
        const result = await ProductManagement.service.getProduct(id, userId);
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
        const userId = Number(res.locals.data.id);
        console.log(userId);


        const result = await ProductManagement.service.getVendorProducts(page, limit, userId);
        Controller.response(res, result);
    }

    public static async createProduct(req: Request, res: Response) {

        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        let {
            name,
            description,
            price,
            discountPrice,
            additionalInfo,
            attributes,
            metaData,
            storeId,
            categoryId,
            subcategoryId,
            stock,
            lowStockThreshold,
            draft,
            link
        } = req.body;

        if (!(draft === "true" || draft === "false")) {
            res.status(400).json({
                error: true,
                data: draft,
                message: "draft must be a boolean"
            });
            return;
        }

        storeId = Number(storeId);

        const productDto: ProductDto = {
            name,
            description,
            price: Number(price),
            additionalInfo,
            draft: JSON.parse(draft),
            attributes,
            metaData,
            storeId,
            link,
            categoryId: Number(categoryId)
        };

        const inventoryDto: InventoryDto = {
            stock: Number(stock),
            storeId: storeId
        };


        if (discountPrice) {
            const { error, number } = numberValidator(discountPrice);
            productDto.discountPrice = !error ? number : undefined;
        }

        if (subcategoryId) {
            const { error, number } = numberValidator(subcategoryId);
            productDto.subcategoryId = !error ? number : undefined;
        }

        if (lowStockThreshold) {
            const { error, number } = numberValidator(lowStockThreshold);
            inventoryDto.lowStockThreshold = !error ? number : undefined;
        }

        const userId = Number(res.locals.data.id);
        const userType = res.locals.userType;
        const result = await ProductManagement.service.uploadProduct(productDto, inventoryDto, req.files as Express.Multer.File[], userType, userId);
        Controller.response(res, result);
    }
}
