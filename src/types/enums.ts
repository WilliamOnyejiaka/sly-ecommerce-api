
export enum UserType {
    Admin = "admin",
    Vendor = "vendor",
    Customer = "customer",
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