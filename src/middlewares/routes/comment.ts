import validateBody from "../validateBody";
import {
    paramNumberIsValid
} from "../validators";


export const createProductComment = [
    validateBody([
        'productId',
        'content'
    ])
];

export const productId = [
    paramNumberIsValid('productId')
];