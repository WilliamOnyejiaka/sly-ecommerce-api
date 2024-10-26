import { Request, Response } from "express";
import { Store as StoreService } from "../services";
import { http } from "../constants";
import { idValidator } from "../validators";
import { StoreDetailsDto } from "../types/dtos";

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

    public static async addStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await StoreService.getStoreWithId(idResult.id);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }
        const serviceResult = await StoreService.addStoreLogo(image, idResult.id);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async addBanners(req: Request, res: Response) {
        const images = req.files!;
        const idResult = idValidator(req.params.storeId);

        if (idResult.error) {
            res.status(400).json(idResult);
            return;
        }

        const storeExists = await StoreService.getStoreWithId(idResult.id);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const serviceResult = await StoreService.addBanners(images as Express.Multer.File[], idResult.id);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}