import { adminAuthorization, uploads, validateBody, validateJWT } from "..";
import { env } from "../../config";
import { StoreDetails } from "../../repos";
import { AdminPermission, UserType } from "../../types/enums";
import { bodyBooleanIsValid, bodyNumberIsValid, itemNameExists, paramNumberIsValid, queryIsValidNumber } from "../validators";

export const justCustomer = validateJWT([UserType.CUSTOMER]);

export const productUpload = [
    uploads.array("images", 5),
    validateBody([
        'name',
        'categoryId',
        'price',
        'description',
        'stock',
        'storeId',
        'draft',
        'link'
    ]),
    bodyNumberIsValid('storeId'),
    bodyNumberIsValid('price'),
    bodyNumberIsValid('categoryId'),
    bodyNumberIsValid('stock'),
];

export const publishDraft = [
    validateBody([
        'storeId',
        'productId'
    ]),
    bodyNumberIsValid('storeId'),
    bodyNumberIsValid('productId'),
]

export const idIsValid = [
    paramNumberIsValid('storeId')
];

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit')
];

export const productId = [
    justCustomer,
    paramNumberIsValid('productId')
];