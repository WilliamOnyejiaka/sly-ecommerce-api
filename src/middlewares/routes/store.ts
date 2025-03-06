import { adminAuthorization, validateBody } from "..";
import { StoreDetails } from "../../repos";
import { AdminPermission } from "../../types/enums";
import { bodyNumberIsValid, itemNameExists } from "../validators";

const auth = adminAuthorization([AdminPermission.MANAGE_ALL, AdminPermission.MANAGE_VENDORS]);
const storeNameExists = itemNameExists<StoreDetails>(new StoreDetails(), "name");


export const createStore = [
    auth,
    validateBody([
        'name',
        'address',
        'city',
        'description',
        'tagLine',
        'vendorId'
    ]),
    bodyNumberIsValid('vendorId'),
    storeNameExists
];