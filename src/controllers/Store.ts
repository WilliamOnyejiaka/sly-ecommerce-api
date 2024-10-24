import { Request, Response } from "express";
import { Store as StoreService } from "../services";
import { http } from "../constants";

export default class Store {

    public static async createStore(req: Request, res: Response) {
        const { name, address } = req.body;
        const vendorId = Number(res.locals.data.id);

        const storeExists = await StoreService.storeExists(vendorId);
        if(storeExists.json.error){
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const nameExists = await StoreService.storeNameExists(name);
        if (nameExists.json.error) {
            res.status(nameExists.statusCode).json(nameExists.json);
            return;
        }
        const serviceResult = await StoreService.createStore(name, address, vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async addStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const storeId = Number(req.params.storeId);

        const storeExists = await StoreService.getStoreWithId(storeId);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const serviceResult = await StoreService.addStoreLogo(image, storeId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async addBanners(req: Request, res: Response){
        const images = req.files!;
        const storeId = Number(req.params.storeId);  
        let foundBanners: boolean[] = []; 

        try{
            for (const banner of images as Express.Multer.File[]){
                if ([
                    "firstBanner",
                    "secondBanner"
                ].includes(banner.fieldname)){
                    foundBanners.push(true);
                }
            }

            if(foundBanners.length < 1){
                res.status(400).json({
                    error: true,
                    message: "All"
                });
                return;
            }
        }catch(error){
            res.status(500).json({
                error: true,
                message: http("500")
            });
            return;
        }

        const storeExists = await StoreService.getStoreWithId(storeId);
        if (storeExists.json.error) {
            res.status(storeExists.statusCode).json(storeExists.json);
            return;
        }

        const serviceResult = await StoreService.addBanners(images as Express.Multer.File[], storeId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}