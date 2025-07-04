import { env } from "../../config";
import { Admin, Customer, Vendor } from "../../repos";
import { UserType } from "../../types/enums";
import validateBody from "../validateBody";
import validateJWT from "../validateJWT";
import {
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    tokenIsPresent,
    userEmailExists,
    userPhoneNumberExists,
    zipCodeIsValid
} from "../validators";

export const vendorSignUp = [
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'phoneNumber'
    ]),
    emailIsValid,
    passwordIsValid, // TODO: add a proper phone number validation check 
    // phoneNumberIsValid,
    userPhoneNumberExists<Vendor>(new Vendor()),
    userEmailExists<Vendor>(new Vendor())
];

export const customerSignUp = [
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'street',
        'city',
        'phoneNumber',
        'zip'
    ]),
    emailIsValid,
    passwordIsValid,
    // phoneNumberIsValid,
    // zipCodeIsValid, // TODO: add a proper zip code check
    userPhoneNumberExists<Customer>(new Customer()),
    userEmailExists<Customer>(new Customer())
];

export const adminSignUp = [
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "key"
    ]),
    emailIsValid,
    passwordIsValid,
    // phoneNumberIsValid,
    userPhoneNumberExists<Admin>(new Admin()), //  TODO: check if there is a phone number validation error
    userEmailExists<Admin>(new Admin())
];

export const login = [
    validateBody(['email', 'password'])
];

export const logOut = [
    tokenIsPresent
]

// export const resetPassword = [
//     validateBody([
//         'password',
//         'otp',
//         'email'
//     ]),
//     passwordIsValid
// ]



export const resetPassword = [
    validateJWT([UserType.ADMIN, UserType.VENDOR, UserType.CUSTOMER]),
    validateBody([
        'password',
    ]),
    passwordIsValid
];