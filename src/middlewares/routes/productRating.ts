import validateBody from "../validateBody";
import { bodyNumberIsValid, paramNumberIsValid, queryIsValidNumber } from "../validators";

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
    queryIsValidNumber('productId')
];

export const ratingIsValid = [
    validateBody([
        "productId",
        "rating"
    ]),
    bodyNumberIsValid('productId'),
    bodyNumberIsValid('rating')
];

export const idIsValid = [
    paramNumberIsValid('id')
];