import { Request, Response } from "express";
import { Auth, Vendor as VendorService } from "../services";
import Controller from "./bases/Controller";
import { UserFacade } from "../facade";
import { UserType } from "../types/enums";

export default class Vendor {

    private static readonly facade: UserFacade = new UserFacade();

    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const facadeResult = await Vendor.facade.uploadProfilePicture(image, vendorId, UserType.Vendor);
        Controller.response(res, facadeResult);
    }

    public static async getVendor(req: Request, res: Response) {
        const vendorEmail = res.locals.data.email;
        const facadeResult = await Vendor.facade.getUserProfileWithEmail(vendorEmail, UserType.Vendor);
        Controller.response(res, facadeResult);
    }

    public static async updateFirstName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { firstName } = req.body;
        const facadeResult = await Vendor.facade.updateUserFirstName(vendorId, firstName);
        Controller.response(res, facadeResult);
    }

    public static async updateLastName(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { lastName } = req.body;
        const facadeResult = await Vendor.facade.updateUserLastName(vendorId, lastName);
        Controller.response(res, facadeResult);
    }

    public static async updateEmail(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const { email } = req.body;
        const facadeResult = await Vendor.facade.updateUserEmail(vendorId, email);
        Controller.response(res, facadeResult);
    }

    public static async delete(req: Request, res: Response) {
        const token = req.headers.authorization!.split(' ')[1];
        // const hasLoggedOut = await Vendor.authService.logOut(token);
        // if (hasLoggedOut.json.error) {
        //     Controller.response(res, hasLoggedOut);
        //     return;
        // }
        const vendorId = res.locals.data.id;
        const facadeResult = await Vendor.facade.deleteUserAndLogOut(vendorId, token, UserType.Vendor);
        Controller.response(res, facadeResult);
    }

    public static async getVendorAll(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const facadeResult = await Vendor.facade.getUserProfileWithId(vendorId, UserType.Vendor);
        Controller.response(res, facadeResult);
    }
}