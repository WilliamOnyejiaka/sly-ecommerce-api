import validateBody from "../validateBody";
import {
    paramNumberIsValid,
    queryIsValidNumber
} from "../validators";
import { validateJWT } from "./../";
import { UserType } from "../../types/enums";

const customerJWT = validateJWT([UserType.CUSTOMER]);
const vendorJWT = validateJWT([UserType.VENDOR]);
const generalJWT = validateJWT([UserType.VENDOR, UserType.CUSTOMER]);


export const storeId = [
    paramNumberIsValid('storeId')
];

export const follow = [
    generalJWT,
    ...storeId
];

export const countFollowers = [
    generalJWT,
    ...storeId
];

export const countFollowing = [
    generalJWT,
    paramNumberIsValid('customerId')
];

export const following = [
    customerJWT,
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export const followers = [
    // generalJWT,
    paramNumberIsValid('storeId'),
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];