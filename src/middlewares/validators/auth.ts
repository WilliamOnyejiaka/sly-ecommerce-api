import { Admin, Customer, Vendor } from "../../repos";
import validateBody from "./validateBody";
import { emailIsValid, passwordIsValid, phoneNumberIsValid, tokenIsPresent, userEmailExists, zipCodeIsValid } from "./validators";

export const vendorSignUp = [
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'phoneNumber'
    ]),
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
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
    phoneNumberIsValid,
    zipCodeIsValid,
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
    phoneNumberIsValid,
    userEmailExists<Admin>(new Admin())
];

export const login = [
    validateBody(['email', 'password'])
];

export const logOut = [
    tokenIsPresent
]