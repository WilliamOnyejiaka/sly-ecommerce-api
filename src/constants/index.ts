import validations from "./validations";
import http from "./http";
import authorizationTypes from "./authorizationTypes";

export default function constants(key: string) {

    return {
        'failedCache': "Failed to cache data",
        '404Vendor': "Vendor was not found.",
        '404User': "User was not found.",
        'updatedVendor': "Vendor has been updated successfully.",
        '404Image': "Image was not found"

    }[key];
}

export { validations, http, authorizationTypes };