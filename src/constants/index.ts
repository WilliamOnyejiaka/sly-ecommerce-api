import validations from "./validations";
import http from "./http";
import authorizationTypes from "./authorizationTypes";
import urls from "./urls";

export default function constants(key: string) {

    return {
        'failedCache': "Failed to cache data",
        '404Vendor': "Vendor was not found.",
        '404User': "User was not found.",
        'updatedVendor': "Vendor has been updated successfully.",
        'deletedVendor': "Vendor has been deleted successfully",
        'deletedStore': "Store has been deleted successfully",
        '404Image': "Image was not found",
        '201ProfilePic': "Profile picture was uploaded successfully",
        '400Email': "Invalid email",
        'service400Email': "Email already exists"

    }[key];
}

export { validations, http, authorizationTypes, urls };