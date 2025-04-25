import validateBody from "../validateBody";
import { bodyNumberIsValid, paramNumberIsValid, queryIsValidNumber } from "../validators";

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
];

export const productIdIsValid = [
    validateBody([
        "productId"
    ]),
    bodyNumberIsValid('productId')
];

export const idIsValid = [
    paramNumberIsValid('productId')
];