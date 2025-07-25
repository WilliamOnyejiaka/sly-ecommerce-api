import { Controller } from ".";
import { Auth, Customer as CustomerService } from "./../services";
import { validationResult } from "express-validator";
import { Request, Response } from "express";

export default class Customer {

    private static readonly service: CustomerService = new CustomerService();
    private static readonly authService: Auth = new Auth();

    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const customerId = Number(res.locals.data.id);
        const serviceResult = await Customer.service.uploadProfilePicture(image, customerId);
        Controller.response(res, serviceResult);
    }

    public static async getCustomerAll(req: Request, res: Response) {
        const customerId = Number(res.locals.data.id);
        const serviceResult = await Customer.service.getUserProfileWithId(customerId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async updateProfile(req: Request, res: Response) {
        const customerId = Number(res.locals.data.id);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            res.status(400).json({
                error: true,
                message: validationErrors.array()[0].msg,
            });
            return;
        }
        const serviceResult = await Customer.service.updateProfile(customerId, req.body);
        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const token = req.headers.authorization!.split(' ')[1];
        const hasLoggedOut = await Customer.authService.logOut(token);
        if (hasLoggedOut.json.error) {
            Controller.response(res, hasLoggedOut);
            return;
        }
        const vendorId = Number(res.locals.data.id);
        const serviceResult = await Customer.service.deleteUser(vendorId);
        Controller.response(res, serviceResult);
    }

}