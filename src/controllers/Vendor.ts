import { Request, Response } from "express";
import { Authentication, ImageService, Vendor as VendorService } from "../services";
import Controller from "./bases/Controller";

export default class Vendor {

    private static readonly service: VendorService = new VendorService();
    private static readonly authService: Authentication = new Authentication();


    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await Vendor.service.uploadProfilePicture(image, vendorId);
        Controller.response(res, serviceResult);
    }

    public static async getVendor(req: Request, res: Response) {
        const vendorEmail = res.locals.data.email;
        const serviceResult = await Vendor.service.getUserProfileWithEmail(vendorEmail);
        Controller.response(res, serviceResult);
    }

    public static async updateFirstName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { firstName } = req.body;
        const serviceResult = await Vendor.service.updateFirstName(vendorId, firstName);
        Controller.response(res, serviceResult);
    }

    public static async updateLastName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { lastName } = req.body;
        const serviceResult = await Vendor.service.updateFirstName(vendorId, lastName);
        Controller.response(res, serviceResult);
    }

    public static async updateEmail(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { email } = req.body;
        const serviceResult = await Vendor.service.updateEmail(vendorId, email);
        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const token = req.headers.authorization!.split(' ')[1];
        const hasLoggedOut = await Vendor.authService.logoOut(token);
        if (hasLoggedOut.json.error) {
            Controller.response(res, hasLoggedOut);
            return;
        }
        const vendorId = res.locals.data.id;
        const serviceResult = await Vendor.service.delete(vendorId);
        Controller.response(res, serviceResult);
    }

    public static async getVendorAll(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await Vendor.service.getUserProfileWithId(vendorId);
        Controller.response(res, serviceResult);
    }
}