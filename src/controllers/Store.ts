import { Request, Response } from "express";
import { ImageService, Store as StoreService } from "../services";
import constants, { http } from "../constants";
import { numberValidator } from "../validators";
import { StoreDetailsDto } from "../types/dtos";
import * as fs from "fs";
import { baseUrl } from "../utils";

export default class Store {
    
    private static readonly service: StoreService = new StoreService();
    public static readonly imageService: ImageService = new ImageService();

    public static async createAll(req: Request, res: Response) {
        const images = req.files!;

        if (!req.body.name || !req.body.address || !req.body.city || !req.body.description || !req.body.tagLine) {
            Store.imageService.deleteImages(images as Express.Multer.File[]);
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
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await Store.service.storeNameExists(storeDetailsDto.name);
        if (nameExists.json.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await Store.service.createStoreAll(storeDetailsDto, images as Express.Multer.File[], baseServerUrl);
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

    static async deleteImages(images: Express.Multer.File[]) { // TODO: Remove this
        for (const image of images) {
            fs.unlinkSync(image.path);
        }
    }

    public static async uploadStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const idResult = numberValidator(req.params.storeId);

        if (idResult.error) {
            Store.deleteImages([image]);
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await Store.service.getStoreWithId(idResult.number);
        if (storeExists.json.error) {
            Store.deleteImages([image]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await Store.service.uploadStoreLogo(image, idResult.number, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async uploadBanners(req: Request, res: Response) {
        const images = req.files!;
        const idResult = numberValidator(req.params.storeId);

        if (idResult.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await Store.service.getStoreWithId(idResult.number);
        if (storeExists.json.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await Store.service.uploadBanners(images as Express.Multer.File[], idResult.number, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    // public static async getStoreLogo(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.id);

    //     if (idResult.error) {
    //         res.status(400).send("Id must be an integer");
    //         return;
    //     }
    //     const serviceResult = await Store.service.getStoreLogo(idResult.number);

    //     if (serviceResult.json.error) {
    //         res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
    //         return;
    //     }

    //     res.writeHead(serviceResult.statusCode, {
    //         'Content-Type': serviceResult.json.data.mimeType,
    //         'Content-Length': serviceResult.json.data.bufferLength
    //     })
    //         .end(serviceResult.json.data.imageBuffer);
    // }

    // public static async getFirstStoreBanner(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.id);

    //     if (idResult.error) {
    //         res.status(400).send("Id must be an integer");
    //         return;
    //     }
    //     const serviceResult = await Store.service.getFirstStoreBanner(idResult.number);

    //     if (serviceResult.json.error) {
    //         res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
    //         return;
    //     }

    //     res.writeHead(serviceResult.statusCode, {
    //         'Content-Type': serviceResult.json.data.mimeType,
    //         'Content-Length': serviceResult.json.data.bufferLength
    //     })
    //         .end(serviceResult.json.data.imageBuffer);
    // }

    // public static async getSecondStoreBanner(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.id);

    //     if (idResult.error) {
    //         res.status(400).send("Id must be an integer");
    //         return;
    //     }
    //     const serviceResult = await Store.service.getSecondStoreBanner(idResult.number);

    //     if (serviceResult.json.error) {
    //         res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
    //         return;
    //     }

    //     res.writeHead(serviceResult.statusCode, {
    //         'Content-Type': serviceResult.json.data.mimeType,
    //         'Content-Length': serviceResult.json.data.bufferLength
    //     })
    //         .end(serviceResult.json.data.imageBuffer);
    // }

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