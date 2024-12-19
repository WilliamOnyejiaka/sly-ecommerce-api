import { Request, Response } from "express";
import { Authentication, ImageService, Vendor as VendorService } from "../services";
import { numberValidator } from "../validators";
import constants, { http, urls } from "../constants";
import { baseUrl } from "../utils";
import { VendorProfilePicture } from "../repos";

export default class Vendor {

    private static readonly service: VendorService = new VendorService();
    public static readonly imageService: ImageService = new ImageService();
    private static readonly authService: Authentication = new Authentication();


    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);

        const serviceResult = await Vendor.imageService.uploadImage<VendorProfilePicture>(
            image,
            vendorId,
            new VendorProfilePicture(),
            'vendorProfilePic'
        );
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getVendor(req: Request, res: Response) {
        const vendorEmail = res.locals.data.email;
        const serviceResult = await Vendor.service.getVendorWithEmail(vendorEmail);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async updateFirstName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { firstName } = req.body;
        const serviceResult = await Vendor.service.updateFirstName(vendorId, firstName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async updateLastName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { lastName } = req.body;
        const serviceResult = await Vendor.service.updateFirstName(vendorId, lastName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async updateEmail(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { email } = req.body;
        const serviceResult = await Vendor.service.updateEmail(vendorId, email);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const token = req.headers.authorization!.split(' ')[1];
        const hasLoggedOut = await Vendor.authService.logoOut(token);
        if (hasLoggedOut.json.error) {
            res.status(hasLoggedOut.statusCode).json(hasLoggedOut.json);
            return;
        }
        const vendorId = res.locals.data.id;
        const serviceResult = await Vendor.service.delete(vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getVendorAll(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await Vendor.service.getVendorAll(vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}