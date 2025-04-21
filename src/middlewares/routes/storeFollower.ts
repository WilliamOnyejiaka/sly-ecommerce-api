import validateBody from "../validateBody";
import {
    paramNumberIsValid
} from "../validators";
import { validateJWT } from "./../";
import { env } from "./../../config";
import { UserType } from "../../types/enums";

const customerJWT = validateJWT([UserType.Customer], env("tokenSecret")!);
const vendorJWT = validateJWT([UserType.Vendor], env("tokenSecret")!);
const generalJWT = validateJWT([UserType.Vendor, UserType.Customer], env("tokenSecret")!);


export const storeId = [
    paramNumberIsValid('storeId')
];

export const follow = [
    generalJWT,
    ...storeId
]