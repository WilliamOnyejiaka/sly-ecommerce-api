import validations from "./validations";
import http from "./http";

export default function constants(key: string){

    return {
        'failedCache': "Failed to cache data",
        '404Vendor': "Vendor was not found",

    }[key];
}

export {validations,http};