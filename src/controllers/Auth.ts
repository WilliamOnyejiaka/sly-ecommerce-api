import { Request, Response } from "express";
import VendorDto, { CustomerAddressDto } from "./../types/dtos";
import { validationResult } from "express-validator";
import { Controller } from ".";
import { AuthenticationManagementFacade } from "../facade";
import { OTPType, UserType } from "../types/enums";

export default class Auth { // ! TODO: change all constant strings to an Enum

    private static readonly facade: AuthenticationManagementFacade = new AuthenticationManagementFacade();

    public static async vendorSignUp(req: Request, res: Response) {
        const vendorDto: VendorDto = req.body;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const serviceResult = await Auth.facade.vendorSignUp(vendorDto);
        Controller.response(res, serviceResult);
    }

    public static login(userType: UserType) {
        return async (req: Request, res: Response) => {
            const { email, password } = req.body;
            const serviceResult = await Auth.facade.login(
                email as string,
                password as string,
                userType
            );

            Controller.response(res, serviceResult);
        }
    }

    public static sendUserOTP(userType: UserType, otpType: OTPType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.facade.sendUserOTP(req.params.email, otpType, userType);
            Controller.response(res, serviceResult);
        }
    }

    public static emailVerification(userType: UserType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.facade.emailVerification(req.params.email, req.params.otpCode, userType);
            Controller.response(res, serviceResult);
        }
    }

    public static otpConfirmation(userType: UserType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.facade.otpConfirmation(req.params.email, req.params.otpCode, userType);
            Controller.response(res, serviceResult);
        }
    }

    public static passwordReset(userType: UserType) {
        return async (req: Request, res: Response) => {
            const email = res.locals.data.email;
            console.log(email);
            
            const { password } = req.body;
            const serviceResult = await Auth.facade.passwordReset(email, password, userType);
            Controller.response(res, serviceResult);
        }
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

        const serviceResult = await Auth.facade.customerSignUp({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }, addressDto);
        Controller.response(res, serviceResult);
    }

    public static async logOut(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const token = req.headers.authorization!.split(' ')[1];
        const serviceResult = await Auth.facade.logOut(token);
        Controller.response(res, serviceResult);
    }

    public static async adminSignUp(req: Request, res: Response) {
        const serviceResult = await Auth.facade.adminSignUp(req.body);
        Controller.response(res, serviceResult);
    }
}