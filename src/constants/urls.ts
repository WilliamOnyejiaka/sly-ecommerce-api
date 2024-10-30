
export default function urls(key: string) {

    return {
        "baseImageUrl": "/api/v1/image",
        "vendorPic": "/vendor/profile-pic/:vendorId",
        "storeLogo": "/store/store-logo/:storeId",
        // "storeLogo1": "/image/store/store-logo/:" TODO: with vendor id
        "firstBanner": "/store/first-banner/:storeId",
        "secondBanner": "/store/second-banner/:storeId"
    }[key]
}