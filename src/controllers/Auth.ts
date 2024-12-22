import { Request, Response } from "express";
import { Authentication } from "./../services";
import VendorDto, { CustomerAddressDto } from "./../types/dtos";
import { validationResult } from "express-validator";
import { Controller } from ".";

class Auth {

    private static readonly service: Authentication = new Authentication();

    public static async vendorSignUp(req: Request, res: Response) {
        const vendorDto: VendorDto = req.body;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const serviceResult = await Auth.service.vendorSignUp(vendorDto);
        Controller.response(res, serviceResult);
    }

    public static async vendorLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.service.vendorLogin(
            email as string,
            password as string
        );

        Controller.response(res, serviceResult);
    }

    public static async adminLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.service.adminLogin(
            email as string,
            password as string
        );

        Controller.response(res, serviceResult);
    }


    public static async vendorEmailOTP(req: Request, res: Response) {
        const serviceResult = await Auth.service.vendorEmailOTP(req.params.email);
        Controller.response(res, serviceResult);
    }

    public static async vendorEmailVerification(req: Request, res: Response) {
        const serviceResult = await Auth.service.vendorEmailVerification(req.params.email, req.params.otpCode);
        Controller.response(res, serviceResult);
    }

    public static async customerSignUp(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const addressDto: CustomerAddressDto = {
            zip: req.body.zip,
            street: req.body.street,
            city: req.body.city
        }

        const serviceResult = await Auth.service.customerSignUp({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }, addressDto);
        Controller.response(res, serviceResult);
    }

    public static async customerLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.service.customerLogin(
            email as string,
            password as string
        );

        Controller.response(res, serviceResult);
    }

    public static async logOut(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const token = req.headers.authorization!.split(' ')[1];
        const serviceResult = await Auth.service.logoOut(token);
        Controller.response(res, serviceResult);
    }

    public static async adminSignUp(req: Request, res: Response) {
        const serviceResult = await Auth.service.adminSignUp(req.body);
        Controller.response(res, serviceResult);
    }
}

export default Auth;