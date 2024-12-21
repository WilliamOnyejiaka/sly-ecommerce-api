import { Request, Response } from "express";
import { ImageService, Store as StoreService } from "../services";
import constants, { http, urls } from "../constants";
import { numberValidator } from "../validators";
import { StoreDetailsDto } from "../types/dtos";
import * as fs from "fs";
import { baseUrl } from "../utils";
import { FirstBanner, StoreLogo } from "../repos";
import Controller from "./bases/Controller";

export default class Store {

    private static readonly service: StoreService = new StoreService();
    public static readonly imageService: ImageService = new ImageService();

    public static async createAll(req: Request, res: Response) {
        const images = req.files!;

        if (!req.body.name || !req.body.address || !req.body.city || !req.body.description || !req.body.tagLine) {
            await Store.imageService.deleteFiles(images as Express.Multer.File[]);
            res.status(400).json({
                'error': true,
                'message': "All values are required",
                'data': {}
            });
            return;
        }

        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);

        const storeExists = await Store.service.storeExists(storeDetailsDto.vendorId);
        if (storeExists.json.error) {
            await Store.imageService.deleteFiles(images as Express.Multer.File[]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await Store.service.storeNameExists(storeDetailsDto.name);
        if (nameExists.json.error) {
            await Store.imageService.deleteFiles(images as Express.Multer.File[]);
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }

        const serviceResult = await Store.service.createStoreAll(storeDetailsDto, images as Express.Multer.File[]);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createStore(req: Request, res: Response) {
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);

        const storeExists = await Store.service.storeExists(storeDetailsDto.vendorId);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await Store.service.storeNameExists(storeDetailsDto.name);
        if (nameExists.json.error) {
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }

        const serviceResult = await Store.service.createStore(storeDetailsDto);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async uploadStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const idResult = numberValidator(req.params.storeId);

        if (idResult.error) {
            await Store.imageService.deleteFiles([image]);
            res.status(400).json(idResult);
            return;
        }
        const storeId = idResult.number;
        const storeExists = await Store.service.getStoreWithId(storeId);
        if (storeExists.json.error) {
            await Store.imageService.deleteFiles([image]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const serviceResult = await Store.imageService.uploadImage<StoreLogo>(
            image,
            storeId,
            new StoreLogo(),
            'storeLogo'
        );
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async uploadBanners(req: Request, res: Response) {
        const images = req.files! as Express.Multer.File[];
        const firstBannerExists = images.some((image) => image.fieldname === "firstBanner");

        if (!firstBannerExists) {
            await Store.imageService.deleteFiles(images);
            res.status(400).json({
                error: true,
                message: "firstBanner is required"
            });
            return;
        }

        const idResult = numberValidator(req.params.storeId);

        if (idResult.error) {
            await Store.imageService.deleteFiles(images);
            res.status(400).json(idResult);
            return;
        }

        const storeId = idResult.number;
        const storeExists = await Store.service.getStoreWithId(storeId);
        if (storeExists.json.error) {
            await Store.imageService.deleteFiles(images);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        // const serviceResult = images.length == 1 ? await Store.imageService.uploadImage<FirstBanner>(
        //     images[0],
        //     storeId,
        //     new FirstBanner(),
        //     'firstStoreBanner'
        // ) : await Store.service.uploadBanners(images, storeId);
        const serviceResult = await Store.service.uploadBanners(images, storeId);
        Controller.response(res, serviceResult);
    }

    public static async getStoreAll(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const baseServerUrl = baseUrl(req);
        const serviceResult = await Store.service.getStoreAll(vendorId, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteStore(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);

        const serviceResult = await Store.service.delete(vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}