import { Request, Response } from "express";
import { Authentication, Vendor } from "./../services";
import { emailValidator, phoneNumberValidator } from "./../validators";
import { IVendor } from "../types";

class Auth {

    public static async vendorSignUp(req: Request, res: Response) {
        const { firstName, lastName, email, password, address, phoneNumber } = req.body;
        if (password.length < 5) {
            res.status(400).json({
                error: true,
                message: "password length must be greater than 4",
            });
            return;
        }

        const phoneNumberIsValid = phoneNumberValidator(phoneNumber as string);

        if (phoneNumberIsValid !== null) {
            res.status(400).json({
                error: true,
                message: phoneNumberIsValid
            });
            return;
        }

        if (!emailValidator(email)) {
            res.status(400).json({
                error: true,
                message: "invalid email"
            });
            return;
        }

        const emailExistsResult = await Vendor.emailExists(email);

        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }

        const vendorSignUpData: IVendor = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phoneNumber: phoneNumber
        };

        const serviceResult = await Authentication.vendorSignUp(vendorSignUpData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async vendorLogin(req: Request, res: Response) {
        const serviceResult = await Authentication.vendorLogin(
            res.locals.email as string,
            res.locals.password as string
        );

        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async vendorEmailOTP(req: Request, res: Response) {
        const serviceResult = await Authentication.vendorEmailOTP(req.params.email);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async vendorEmailVerification(req: Request, res: Response) {
        const serviceResult = await Authentication.vendorEmailVerification(req.params.email,req.params.otpCode);        
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}

export default Auth;