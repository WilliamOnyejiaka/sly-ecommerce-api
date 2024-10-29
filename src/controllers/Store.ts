import { Request, Response } from "express";
import { Store as StoreService } from "../services";
import constants, { http } from "../constants";
import { idValidator } from "../validators";
import { StoreDetailsDto } from "../types/dtos";
import * as fs from "fs";

export default class Store {

    public static async createStore(req: Request, res: Response) {
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);

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
        
        const serviceResult = await StoreService.uploadStoreLogo(image, idResult.id);
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

        const serviceResult = await StoreService.uploadBanners(images as Express.Multer.File[], idResult.id);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getStoreLogo(req: Request, res: Response) {
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }
        const serviceResult = await StoreService.getStoreLogo(idResult.id);

        if (serviceResult.json.error) {
            res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
            return;
        }

        const imgBuffer = Buffer.from(serviceResult.json.data.picture, 'base64');

        res.writeHead(serviceResult.statusCode, {
            'Content-Type': serviceResult.json.data.mimeType,
            'Content-Length': imgBuffer.length
        })
            .end(imgBuffer);
    }
}