import { Request, Response } from "express";
import { Vendor as VendorService } from "../services";
import { idValidator } from "../validators";
import constants, { http } from "../constants";
import { baseUrl } from "../utils";

export default class Vendor {

    public static async addProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const baseServerUrl = baseUrl(req);
        const serviceResult = await VendorService.uploadProfilePicture(image, vendorId, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getVendor(req: Request, res: Response) {
        const vendorEmail = res.locals.data.email;
        const serviceResult = await VendorService.getVendorWithEmail(vendorEmail);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getProfilePicture(req: Request, res: Response) {
        const idResult = idValidator(req.params.vendorId);

        if (idResult.error) {
            res.status(400).send("id must be an integer");
            return;
        }
        const serviceResult = await VendorService.getProfilePic(idResult.id);

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

    public static async updateEmail(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { email } = req.body;
        const serviceResult = await VendorService.updateEmail(vendorId, email);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteVendor(req: Request, res: Response) {
        const vendorEmail = res.locals.data.email;
        const serviceResult = await VendorService.getVendorWithEmail(vendorEmail);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}