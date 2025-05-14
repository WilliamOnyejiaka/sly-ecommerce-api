import { ImageService, Store as StoreService } from "../services";
import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { baseUrl } from "../utils";
import Controller from "./bases/Controller";
import { StoreDetailsDto } from "../types/dtos";
import { validationResult } from "express-validator";
import { http, HttpStatus } from "../constants";
import Store from "./Store";
import { UserType } from "../types/enums";



export default class DashboardStore extends Store {

    public static async createAll(req: Request, res: Response) {
        const images = req.files! as Express.Multer.File[];
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const storeDetailsDto: StoreDetailsDto = req.body;
        const serviceResult = await DashboardStore.service.createStoreAll(storeDetailsDto, images as Express.Multer.File[], UserType.VENDOR);
        Controller.response(res, serviceResult);
    }

    public static async createStore(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const storeDetailsDto: StoreDetailsDto = req.body;
        const serviceResult = await DashboardStore.service.createStore(storeDetailsDto);
        Controller.response(res, serviceResult);
    }

    public static async getStoreWithVendorId(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const vendorId = Number(req.params.vendorId);
        const serviceResult = await DashboardStore.service.getStoreAll(vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateStores(req: Request, res: Response) {
        const pageResult = numberValidator(req.query.page);
        if (pageResult.error) {
            res.status(400).json({
                error: true,
                message: "page must be an integer"
            });
            return;
        }

        const pageSizeResult = numberValidator(req.query.pageSize);
        if (pageSizeResult.error) {
            res.status(400).json({
                error: true,
                message: "pageSize must be an integer"
            });
            return;
        }

        const page = pageResult.number;
        const pageSize = pageSizeResult.number;
        const baseServerUrl = baseUrl(req);

        const serviceResult = await DashboardStore.service.paginateStores(page, pageSize);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllStores(req: Request, res: Response) {
        const serviceResult = await DashboardStore.service.getAllStores();
        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const vendorId = Number(req.params.vendorId);
        const serviceResult = await Store.service.delete(vendorId);
        Controller.response(res, serviceResult);
    }

    // public static async deleteStore(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.vendorId);
    //     if (idResult.error) {
    //         res.status(400).json({
    //             error: true,
    //             message: "id must be an integer"
    //         });
    //         return;
    //     }

    //     const serviceResult = await DashboardStore.service.delete(idResult.number);
    //     res.status(serviceResult.statusCode).json(serviceResult.json);
    // }

}