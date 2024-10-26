import { Request, Response } from "express";
import { Vendor as VendorService } from "../services";

export default class Vendor {

    public static async addProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await VendorService.addProfilePicture(image, vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getVendor(req: Request, res: Response){
        
    }

    public static async getProfilePicture(req: Request, res: Response){
        // res.setHeader('Content-Type', mime.lookup(filePath));
        // res.send(serviceResult.data);
    }

    public static async updateFirstName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { firstName } = req.body;
        const serviceResult = await VendorService.updateFirstName(vendorId, firstName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async updateLastName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { lastName } = req.body;
        const serviceResult = await VendorService.updateFirstName(vendorId, lastName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}