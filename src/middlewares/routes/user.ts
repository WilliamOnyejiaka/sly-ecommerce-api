import { Vendor, Customer, Admin } from "../../repos";
import { AdminPermission } from "../../types/enums";
import adminAuthorization from "../adminAuthorization";
import validateBody from "../validateBody";
import { body, param } from 'express-validator';
import { emailIsValid, paramNumberIsValid, passwordIsValid, queryIsValidNumber, userEmailExists, userPhoneNumberExists, zipCodeIsValid } from "../validators";

const vendorAdminAuth = adminAuthorization([AdminPermission.MANAGE_ALL, AdminPermission.MANAGE_VENDORS, AdminPermission.MANAGE_USERS]);
const customerAdminAuth = adminAuthorization([AdminPermission.MANAGE_ALL, AdminPermission.MANAGE_USERS]);
const adminAuth = adminAuthorization([AdminPermission.MANAGE_ALL, AdminPermission.MANAGE_ADMINS]);
export const anyAuth = adminAuthorization(['any']);


export const getUser = [
    anyAuth,
    paramNumberIsValid("id")
];

export const getUsers = [
    anyAuth
];

export const paginateUsers = [
    anyAuth,
    queryIsValidNumber('page'),
    queryIsValidNumber('pageSize')
];

export const totalRecords = [
    anyAuth
];

export const updateActiveStatus = [
    adminAuth,
    validateBody(['id']),
];

export const createVendor = [
    vendorAdminAuth,
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

export const createCustomer = [
    customerAdminAuth,
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
    zipCodeIsValid,
    userPhoneNumberExists<Customer>(new Customer()),
    userEmailExists<Customer>(new Customer())
];

export const createAdmin = [
    adminAuth,
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "roleId",
        "active"
    ]),
    emailIsValid,
    passwordIsValid, //  TODO: add a proper phone number validation check 
    // phoneNumberIsValid,
    userPhoneNumberExists<Admin>(new Admin()),
    userEmailExists<Admin>(new Admin())
];

export const adminSignUpKey = [
    adminAuth,
    paramNumberIsValid('roleId'),
];

export const validateUpdateUser = [
    body('firstName').optional().isString().notEmpty().withMessage('First name must be a non-empty string'),
    body('lastName').optional().isString().notEmpty().withMessage('Last name must be a non-empty string'),
    body('email').optional().isEmail().withMessage('Email must be a valid email address'),
    body('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('phoneNumber').optional().isString().notEmpty().withMessage('Phone number must be a non-empty string'),
    body().custom((value, { req }) => {
        const allowedFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
        const keys = Object.keys(req.body);

        const invalidFields = keys.filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        }
        return true;
    }),
];