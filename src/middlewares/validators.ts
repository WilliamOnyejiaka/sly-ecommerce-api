import { body, header, param } from "express-validator";
import { emailValidator, numberValidator, phoneNumberValidator, zipCodeValidator } from "../validators";
import constants, { HttpStatus } from "../constants";
import UserRepo from "../repos/UserRepo";
import Repo from "../repos/Repo";

const errorDetails = (message: string, statusCode: number) => {
    return JSON.stringify({
        message: message,
        statusCode: statusCode
    });
}

const isValidPassword = (value: string, { req, location, path }: { req: any, location: string, path: string }) => {
    if (value.length < 5) {
        throw new Error(errorDetails("Password must be greater than 5", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidPhoneNumber = (value: string) => {
    const phoneNumberIsValid = phoneNumberValidator(value);

    if (phoneNumberIsValid !== null) {
        throw new Error(errorDetails(phoneNumberIsValid!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidEmail = (value: string) => {
    if (!emailValidator(value)) {
        throw new Error(errorDetails(constants('400Email')!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const emailExists = <T extends UserRepo>(repo: T) => async (value: string) => {
    const repoResult = await repo.getUserProfileWithEmail(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Email already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const nameExists = <T extends Repo>(repo: T) => async (value: string) => {
    const repoResult = await repo.getItemWithName(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Name already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidZipCode = (value: string) => {
    const isValid = zipCodeValidator(value);
    if (isValid.error) {
        throw new Error(errorDetails(isValid.message!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isTokenPresent = (value: string, { req, location, path }: { req: any, location: string, path: string }) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        throw new Error(errorDetails("Missing Bearer Authorization Header", HttpStatus.UNAUTHORIZED));
    }
    if (!req.headers.authorization.split(' ')[1]) {
        throw new Error(errorDetails("Token missing", HttpStatus.UNAUTHORIZED));
    }
    return true;
}

const isValidNumber = (value: string) => {
    const idResult = numberValidator(value);

    if (idResult.error) {
        throw new Error(errorDetails("Param must be an integer", HttpStatus.BAD_REQUEST));
    }
    return true;
}


export const passwordIsValid = body('password').custom(isValidPassword); // Custom password validation
export const phoneNumberIsValid = body('phoneNumber').custom(isValidPhoneNumber);
export const emailIsValid = body('email').custom(isValidEmail);
export const userEmailExists = <T extends UserRepo>(repo: T) => body('email').custom(emailExists<T>(repo));
export const zipCodeIsValid = body('zip').custom(isValidZipCode);
export const tokenIsPresent = header('Authorization').custom(isTokenPresent);
export const paramNumberIsValid = (paramName: string) => param(paramName).custom(isValidNumber);
export const bodyNumberIsValid = (bodyName: string) => body(bodyName).custom(isValidNumber);
export const itemNameExists = <T extends Repo>(repo: T) => body('email').custom(nameExists<T>(repo));
