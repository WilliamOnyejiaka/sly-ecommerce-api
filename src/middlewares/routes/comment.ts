import validateBody from "../validateBody";
import {
    bodyNumberIsValid,
    paramNumberIsValid
} from "../validators";


export const createProductComment = [
    validateBody([
        'productId',
        'content'
    ]),
    bodyNumberIsValid('productId')
];

export const productId = [
    paramNumberIsValid('productId')
];