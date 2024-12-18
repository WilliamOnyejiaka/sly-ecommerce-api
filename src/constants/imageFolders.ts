
export default function imageFolders(key: string) {
    const basePath = "ecommerce-cdn";
    const profilePicture = `${basePath}/profile-picture`;
    const store = `${basePath}/store`;

    return {
        'vendorProfilePic': profilePicture + "/vendor",
        'adminProfilePic': profilePicture + "/admin",
        'customerProfilePic': profilePicture + "/customer",
        'storeLogo': store + "/store-logo",
        'firstStoreBanner': store + "/banner/first-store-banner",
        'secondStoreBanner': store + "/banner/second-store-banner",
    }[key];
}