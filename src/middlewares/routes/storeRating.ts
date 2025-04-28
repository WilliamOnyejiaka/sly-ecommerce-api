import validateBody from "../validateBody";
import { bodyNumberIsValid, paramNumberIsValid, queryIsValidNumber } from "../validators";

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
    queryIsValidNumber('storeId')
];

export const ratingIsValid = [
    validateBody([
        "storeId",
        "rating"
    ]),
    bodyNumberIsValid('storeId'),
    bodyNumberIsValid('rating')
];

export const idIsValid = [
    paramNumberIsValid('id')
];