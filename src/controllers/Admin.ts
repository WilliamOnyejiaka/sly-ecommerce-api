import { Request, Response } from "express";
import { Admin as AdminService } from "../services";

export default class Admin {

    public static async defaultAdmin(req: Request, res: Response) {
        const serviceResult = await AdminService.defaultAdmin();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


    public static async addProfilePicture(req: Request, res: Response) {
        // const image = req.file!;
        // const vendorId = Number(res.locals.data.id);
        // const serviceResult = await VendorService.addProfilePicture(image, vendorId);
        // res.status(serviceResult.statusCode).json(serviceResult.json);
        // res.setHeader('Content-Type', mime.lookup(filePath));
        // res.send(serviceResult.data);
    }

}