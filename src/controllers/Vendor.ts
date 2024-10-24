import { Request, Response } from "express";
import { Vendor as VendorService } from "../services";

export default class Vendor {

    public static async addProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await VendorService.addProfilePicture(image,vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
        // res.setHeader('Content-Type', mime.lookup(filePath));
        // res.send(serviceResult.data);
    }
    
}