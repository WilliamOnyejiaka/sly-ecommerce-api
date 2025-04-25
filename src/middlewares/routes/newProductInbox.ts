import { paramNumberIsValid, queryIsValidNumber } from "../validators";

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
];

export const idIsValid = [
    paramNumberIsValid('id')
];