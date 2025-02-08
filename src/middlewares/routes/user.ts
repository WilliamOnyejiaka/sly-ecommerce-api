import { Vendor, Customer, Admin } from "../../repos";
import { AdminPermission } from "../../types/enums";
import adminAuthorization from "../adminAuthorization";
import validateBody from "../validateBody";
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
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'phoneNumber'
    ]),
    emailIsValid,
    passwordIsValid, // ! TODO: add a proper phone number validation check 
    // phoneNumberIsValid,
    userPhoneNumberExists<Vendor>(new Vendor()),
    userEmailExists<Vendor>(new Vendor())
];

export const createCustomer = [
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
    passwordIsValid, // ! TODO: add a proper phone number validation check 
    // phoneNumberIsValid,
    userPhoneNumberExists<Admin>(new Admin()),
    userEmailExists<Admin>(new Admin())
];

export const adminSignUpKey = [
    adminAuth,
    paramNumberIsValid('roleId'),
]