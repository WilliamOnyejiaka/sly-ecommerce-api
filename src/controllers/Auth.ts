import { Request, Response } from "express";
import { Authentication, Vendor } from "./../services";
import { emailValidator, phoneNumberValidator } from "./../validators";
import VendorDto from "./../types/dtos";
class Auth {

    public static async vendorSignUp(req: Request, res: Response) {
        const vendorDto: VendorDto = req.body;
        if (vendorDto.password!.length < 5) {
            res.status(400).json({
                error: true,
                message: "password length must be greater than 4",
            });
            return;
        }

        const phoneNumberIsValid = phoneNumberValidator(vendorDto.phoneNumber);

        if (phoneNumberIsValid !== null) {
            res.status(400).json({
                error: true,
                message: phoneNumberIsValid
            });
            return;
        }

        if (!emailValidator(vendorDto.email)) {
            res.status(400).json({
                error: true,
                message: "invalid email"
            });
            return;
        }

        const emailExistsResult = await Vendor.emailExists(vendorDto.email);

        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }

        const serviceResult = await Authentication.vendorSignUp(vendorDto);
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

    public static async adminSignUp(req: Request, res: Response) {
        const { firstName, lastName, email, password, phoneNumber } = req.body;
        if (password.length < 5) {
            res.status(400).json({
                error: true,
                message: "Password length must be greater than 4",
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

        const vendorSignUpData: VendorDto = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phoneNumber: phoneNumber
        };

        const serviceResult = await Authentication.vendorSignUp(vendorSignUpData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


}

export default Auth;