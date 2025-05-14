import validateBody from "../validateBody";
import {
    paramNumberIsValid
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
]