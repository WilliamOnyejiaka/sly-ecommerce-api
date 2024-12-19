import { Request, Response } from "express";
import { Authentication, Vendor, Customer, Token, Admin } from "./../services";
import { emailValidator, phoneNumberValidator, zipCodeValidator } from "./../validators";
import VendorDto, { AdminDto, CustomerAddressDto, CustomerDto } from "./../types/dtos";
import constants from "../constants";
import { Country } from "../validators";

class Auth {

    private static readonly vendorService: Vendor = new Vendor();
    private static readonly authService: Authentication = new Authentication();
    private static readonly customerService: Customer = new Customer();
    private static readonly adminService: Admin = new Admin();

    public static async vendorSignUp(req: Request, res: Response) {
        const vendorDto: VendorDto = req.body;
        if (vendorDto.password!.length < 5) {
            res.status(400).json({
                error: true,
                message: "Password length must be greater than 4",
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
                message: constants('400Email')!
            });
            return;
        }

        const emailExistsResult = await Auth.vendorService.emailExists(vendorDto.email);

        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }

        const serviceResult = await Auth.authService.vendorSignUp(vendorDto);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async vendorLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.authService.vendorLogin(
            email as string,
            password as string
        );

        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async adminLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.authService.adminLogin(
            email as string,
            password as string
        );

        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


    public static async vendorEmailOTP(req: Request, res: Response) {
        const serviceResult = await Auth.authService.vendorEmailOTP(req.params.email);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async vendorEmailVerification(req: Request, res: Response) {
        const serviceResult = await Auth.authService.vendorEmailVerification(req.params.email, req.params.otpCode);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async customerSignUp(req: Request, res: Response) {

        let { zip, password, email, phoneNumber } = req.body;

        const isValidZipCode = zipCodeValidator(zip);

        if (isValidZipCode.error) {
            res.status(400).json({
                error: true,
                message: isValidZipCode.message
            });
            return;
        }

        const phoneNumberIsValid = phoneNumberValidator(phoneNumber);

        if (phoneNumberIsValid !== null) {
            res.status(400).json({
                error: true,
                message: phoneNumberIsValid
            });
            return;
        }


        if (password.length < 5) {
            res.status(400).json({
                error: true,
                message: "Password length must be greater than 4",
            });
            return;
        }

        if (!emailValidator(email)) {
            res.status(400).json({
                error: true,
                message: constants('400Email')!
            });
            return;
        }

        const emailExistsResult = await Auth.customerService.emailExists(email);

        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }

        const addressDto: CustomerAddressDto = {
            zip: zip as string,
            street: req.body.street,
            city: req.body.city
        }

        const serviceResult = await Auth.authService.customerSignUp({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password,
            email,
            phoneNumber
        }, addressDto);
        res.status(serviceResult.statusCode).json(serviceResult.json);
        // res.status(200).json("Ok");
    }

    public static async customerLogin(req: Request, res: Response) {
        const { email, password } = req.body;
        const serviceResult = await Auth.authService.customerLogin(
            email as string,
            password as string
        );

        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    // public static customerLogin() {
    //     return this.login(Auth.authService.customerLogin);
    // }

    private static login(callBack: (email: string, password: string) => Promise<{
        statusCode: number;
        json: {
            error: boolean;
            message: string | null;
            data: any;
        };
    }>) {
        return async (req: Request, res: Response) => {
            const { email, password } = req.body;
            const serviceResult = await callBack(
                email as string,
                password as string
            );

            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static async logOut(req: Request, res: Response) {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
            res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
            return;
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            res.status(401).json({
                error: true,
                message: "Token missing"
            });
            return;
        }

        const serviceResult = await Auth.authService.logoOut(token);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async adminSignUp(req: Request, res: Response) {
        const createData = req.body;

        const phoneNumberIsValid = phoneNumberValidator(createData.phoneNumber);

        if (phoneNumberIsValid !== null) {
            res.status(400).json({
                error: true,
                message: phoneNumberIsValid
            });
            return;
        }

        if (!emailValidator(createData.email)) {
            res.status(400).json({
                error: true,
                message: constants('400Email')!
            });
            return;
        }

        const emailExistsResult = await Auth.adminService.emailExists(createData.email);
        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }
        const serviceResult = await Auth.authService.adminSignUp(createData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


}

export default Auth;