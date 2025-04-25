import validateBody from "../validateBody";
import { bodyNumberIsValid, paramNumberIsValid, queryIsValidNumber } from "../validators";

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
];

export const storeIdIsValid = [
    validateBody([
        "storeId"
    ]),
    bodyNumberIsValid('storeId')
];

export const idIsValid = [
    paramNumberIsValid('id')
];