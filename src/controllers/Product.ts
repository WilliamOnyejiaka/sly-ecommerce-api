import { Request, Response } from "express";
import { Controller } from ".";
import { InventoryDto, ProductDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { validationResult } from "express-validator";
import { Product as ProductService } from "../services";

export default class Product {

    private static readonly service: ProductService = new ProductService();


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
            lowStockThreshold
        } = req.body;

        storeId = Number(storeId);

        const productDto: ProductDto = {
            name,
            description,
            price: Number(price),
            additionalInfo,
            attributes,
            metaData,
            storeId,
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
        const result = await Product.service.uploadProduct(productDto, inventoryDto, req.files as Express.Multer.File[], userType, userId);
        Controller.response(res, result);
    }
}
