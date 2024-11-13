import { Request, Response } from "express";
import { ImageService, Store as StoreService } from "../services";
import constants, { http } from "../constants";
import { idValidator } from "../validators";
import { StoreDetailsDto } from "../types/dtos";
import * as fs from "fs";
import { baseUrl } from "../utils";

export default class Store {

    public static async createAll(req: Request, res: Response) {
        const images = req.files!;

        if (!req.body.name || !req.body.address || !req.body.city || !req.body.description || !req.body.tagLine){
            ImageService.deleteImages(images as Express.Multer.File[]);
            res.status(400).json({
                'error': true,
                'message': "all values are required",
                'data': {}
            });
            return;
        }
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);

        const storeExists = await StoreService.storeExists(storeDetailsDto.vendorId);
        if (storeExists.json.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await StoreService.storeNameExists(storeDetailsDto.name);
        if (nameExists.json.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await StoreService.createStoreAll(storeDetailsDto, images as Express.Multer.File[],baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createStore(req: Request, res: Response) {
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);

        console.log(storeDetailsDto);


        const storeExists = await StoreService.storeExists(storeDetailsDto.vendorId);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await StoreService.storeNameExists(storeDetailsDto.name);
        if (nameExists.json.error) {
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }

        const serviceResult = await StoreService.createStore(storeDetailsDto);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    static async deleteImages(images: Express.Multer.File[]) {
        for (const image of images) {
            fs.unlinkSync(image.path);
        }
    }

    public static async uploadStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            Store.deleteImages([image]);
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await StoreService.getStoreWithId(idResult.id);
        if (storeExists.json.error) {
            Store.deleteImages([image]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await StoreService.uploadStoreLogo(image, idResult.id, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async uploadBanners(req: Request, res: Response) {
        const images = req.files!;
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await StoreService.getStoreWithId(idResult.id);
        if (storeExists.json.error) {
            Store.deleteImages(images as Express.Multer.File[]);
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await StoreService.uploadBanners(images as Express.Multer.File[], idResult.id, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getStoreLogo(req: Request, res: Response) {
        const idResult = idValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }
        const serviceResult = await StoreService.getStoreLogo(idResult.id);

        if (serviceResult.json.error) {
            res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
            return;
        }

        res.writeHead(serviceResult.statusCode, {
            'Content-Type': serviceResult.json.data.mimeType,
            'Content-Length': serviceResult.json.data.bufferLength
        })
            .end(serviceResult.json.data.imageBuffer);
    }

    public static async getFirstStoreBanner(req: Request, res: Response) {
        const idResult = idValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }
        const serviceResult = await StoreService.getFirstStoreBanner(idResult.id);

        if (serviceResult.json.error) {
            res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
            return;
        }

        res.writeHead(serviceResult.statusCode, {
            'Content-Type': serviceResult.json.data.mimeType,
            'Content-Length': serviceResult.json.data.bufferLength
        })
            .end(serviceResult.json.data.imageBuffer);
    }

    public static async getSecondStoreBanner(req: Request, res: Response) {
        const idResult = idValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }
        const serviceResult = await StoreService.getSecondStoreBanner(idResult.id);

        if (serviceResult.json.error) {
            res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
            return;
        }

        res.writeHead(serviceResult.statusCode, {
            'Content-Type': serviceResult.json.data.mimeType,
            'Content-Length': serviceResult.json.data.bufferLength
        })
            .end(serviceResult.json.data.imageBuffer);
    }

    public static async getStoreAll(req: Request, res: Response) {
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await StoreService.getStoreAll(idResult.id,baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteStore(req: Request, res: Response) {
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }

        const serviceResult = await StoreService.delete(idResult.id);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}