import { adminAuthorization, uploads, validateBody } from "..";
import { StoreDetails } from "../../repos";
import { AdminPermission } from "../../types/enums";
import { bodyNumberIsValid, itemNameExists } from "../validators";

const auth = adminAuthorization([AdminPermission.MANAGE_ALL, AdminPermission.MANAGE_VENDORS]);
const storeNameExists = itemNameExists<StoreDetails>(new StoreDetails(), "name");


export const productUpload = [
    uploads.array("images",5),
    validateBody([
        'name',
        'categoryId',
        'price',
        'description',
        'stock',
        'storeId'
    ]),
    bodyNumberIsValid('storeId'),
    bodyNumberIsValid('price'),
    bodyNumberIsValid('categoryId'),
    bodyNumberIsValid('stock'),
];