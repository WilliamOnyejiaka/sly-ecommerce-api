import { Request, Response } from "express";
import { Authentication, Token } from "./../services";
import { emailValidator, phoneNumberValidator } from "./../validators";
import { env } from "../config";
import {IVendor} from "../types";

class Auth {

    public static async vendorSignUp(req: Request, res: Response) {
        const { firstName,lastName, email, password,businessName,address,phoneNumber } = req.body;
        if (password.length < 5) {
            res.status(400).json({
                error: true,
                message: "password length must be greater than 4",
            });
            // return;
        }

        const phoneNumberIsValid = phoneNumberValidator(phoneNumber as string);

        // if(phoneNumberIsValid !== null){
        //     res.status(400).json({
        //         error: true,
        //         message: phoneNumberIsValid
        //     })
        // }

        if (!emailValidator(email)) {
            res.status(400).json({
                error: true,
                message: "invalid email"
            });
            return;
        }

        const emailExistsResult = await Authentication.emailExists(email);

        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }

        const vendorSignUpData: IVendor = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            businessName: businessName,
            address: address,
            phoneNumber: phoneNumber
        };

        const serviceResult = await Authentication.vendorSignUp(vendorSignUpData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static test(req: Request, res: Response) {
        res.status(400).json({
            error: false,
            message: "invalid email"
        });
        return;
    }

    // public static async login(req: Request, res: Response) {
    //     const [email, password] = [res.locals.email, res.locals.password];
    //     const user = await UserRepo.getUserWithEmail(email);
    //     if (user) {
    //         const validPassword = await bcrypt.compare(password, user.password as string);
    //         if (validPassword) {
    //             delete user.password;
    //             const accessToken = Token.createToken(user);

    //             return res.status(200).json({
    //                 error: false,
    //                 message: "login was successful",
    //                 data: {
    //                     user: user,
    //                     token: accessToken
    //                 }
    //             });
    //         }
    //         return res.status(400).json({
    //             error: true,
    //             message: "invalid password"
    //         });
    //     }

    //     return res.status(404).json({
    //         error: true,
    //         message: "email does not exit",
    //     });
    // }
}

export default Auth;