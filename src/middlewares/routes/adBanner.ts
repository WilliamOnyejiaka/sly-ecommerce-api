import { adminAuthorization, uploads, validateBody } from "..";
import { AdminPermission } from "../../types/enums";

export const createAdBanner = [
    adminAuthorization([AdminPermission.MANAGE_ALL]),
    uploads.single("adBanner"),
    validateBody([
        'title',
        'cta',
        'link',
        'description'
    ]),
];

export const deleteAdBanner = [
    adminAuthorization([AdminPermission.MANAGE_ALL])
];