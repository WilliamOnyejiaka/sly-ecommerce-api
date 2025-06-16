
export enum UserType {
    ADMIN = "admin",
    VENDOR = "vendor",
    CUSTOMER = "customer",
};

export enum OTPType {
    Reset = "passwordReset",
    Verification = "emailVerification"
};

export enum CategoryType {
    Main = "category",
    SubMain = "subCategory",
    Sub = "subSubCategory"
};

export enum AdminPermission {
    MANAGE_ALL = "manage_all",
    MANAGE_ADMINS = "manage_admins",
    MANAGE_USERS = "manage_users",
    MANAGE_VENDORS = "manage_vendors",
    MANAGE_USERS_PARTIAL = "manage_users_partial",
    MANAGE_VENDORS_PARTIAL = "manage_vendors_partial",
    VIEW_REPORTS = "view_reports",
    MANAGE_CONTENT = "manage_content",
    MANAGE_FINANCE = "manage_finance",
    MANAGE_SUPPORT = "manage_support",
    MANAGE_HR = "manage_hr",
    MANAGE_IT = "manage_it",
    ENSURE_COMPLIANCE = "ensure_compliance",
    VENDOR_PORTAL_ACCESS = "vendor_portal_access",
    ANY = "any"
};

export enum ResourceType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "video",
    PDF = "raw",
    AUTO = "auto"
};


export default function imageFolders(key: string) {
    const basePath = "ecommerce-cdn";
    const profilePicture = `${basePath}/profile-picture`;
    const store = `${basePath}/store`;
    const category = `${basePath}/category`;

    return {
        'vendorProfilePic': profilePicture + "/vendor",
        'adminProfilePic': profilePicture + "/admin",
        'customerProfilePic': profilePicture + "/customer",
        'storeLogo': store + "/store-logo",
        'firstStoreBanner': store + "/banner/first-store-banner",
        'secondStoreBanner': store + "/banner/second-store-banner",
        'category': category + "/category",
        'subCategory': category + "/subcategory",
        'subSubCategory': category + "/subsubcategory",
        'adBanner': basePath + "/ad-banner"
    }[key];
}

const basePath = "ecommerce-cdn";
const profilePicture = `${basePath}/profile-picture`;
const store = `${basePath}/store`;
const category = `${basePath}/category`;

export enum CdnFolders {
    VENDOR_PROFILE_PIC = `${profilePicture}/vendor`,
    ADMIN_PROFILE_PIC = `${profilePicture}/admin`,
    CUSTOMER_PROFILE_PIC = `${profilePicture}/customer`,
    STORE_LOGO = `${store}/store-logo`,
    FIRST_STORE_BANNER = `${store}/banner/first-store-banner`,
    SECOND_STORE_BANNER = `${store}/banner/second-store-banner`,
    CATEGORY = `${category}/category`,
    SUB_CATEGORY = `${category}/subcategory`,
    SUB_SUB_CATEGORY = `${category}/subsubcategory`,
    AD_BANNER = `${basePath}/ad-banner`,
    PR0DUCT_IMAGES = `${basePath}/products`
}


export enum StreamGroups {
    USER = "user",
    STORE = "store",
    PRODUCT = "product",
    NOTIFICATION = "notification"
};

export enum StreamEvents {
    USER_CREATE = 'create',
    UPLOAD_PROFILE_PIC = 'upload:profile-pic',
    STORE_CREATE = "create",
    DELETE = "delete",
    UPLOAD = "upload",
    FOLLOW = "follow",
    NOTIFY = 'notification:users'
};

export type ImageUploadType = "banner" | "image" | "storeImages";

export enum Queues {
    MY_QUEUE = 'my-queue',
    UPLOAD = "upload",
    CREATE_STORE = "create-store",
    UPLOAD_PRODUCT = "upload-product",
    NOTIFY_CUSTOMERS = "notify-customers",
    NEW_FOLLOWER = "new-follower"
};

const sseStoreEvent = "store";
const sseProductEvent = "product";
export enum SSEEvents {
    CREATE_STORE = `${sseStoreEvent}:create`,
    UPLOAD_PRODUCT = `${sseProductEvent}:upload`,
    NOTIFY_CUSTOMERS = `${sseProductEvent}:notify`,
    NEW_FOLLOWER = "notification:newFollower"
}

export enum NotificationType {
    UPLOAD_PRODUCT = "product:upload",
    NEW_PRODUCT = "product:new",
    CREATE_STORE = "store:create",
    FOLLOW = "follow",
    DB_ERROR = "error:db",
    ERROR = "error"
}