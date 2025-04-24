
export interface AdminDto {
    id?: number,
    firstName: string,
    lastName: string,
    password?: string,
    email: string,
    phoneNumber?: string,
    roleId: number
    createdAt?: any,
    updatedAt?: any,
    role?: any[],
    createdBy: number,
    directPermissions?: any[],
    active?: boolean
}

export interface RoleDto {
    id?: number
    name: string,
    description: string,
    level: number
}

export interface PermissionDto {
    id?: number
    name: string,
    description: string
}

export interface AdminPermissionDto {
    id?: number
    adminId: number,
    roleId: number
}



export interface StoreDetailsDto {
    id?: number,
    name: string,
    address: string,
    city: string,
    description: string,
    tagLine: string,
    createdAt?: any,
    updatedAt?: any,
    vendorId?: number
}


export default interface VendorDto {
    id?: number,
    firstName: string,
    lastName: string,
    password?: string,
    email: string,
    active?: boolean,
    isOauth?: boolean,
    oAuthDetails?: string,
    phoneNumber: string,
    createdAt?: any,
    updatedAt?: any
}

export interface CategoryDto {
    id?: number
    name: string,
    priority: number,
    active: boolean,
    adminId: number
}

export interface SubCategoryDto {
    id?: number
    name: string,
    priority: number,
    // active: boolean,
    categoryId: number
}

export interface CustomerAddressDto {
    id?: number,
    street: string,
    city: string,
    zip: string
}

export interface CustomerDto {
    id?: number,
    firstName: string,
    lastName: string,
    email: string,
    password?: string,
    phoneNumber: string,
    address?: CustomerAddressDto
}

export interface ProductCommentDto {
    id?: string,
    content: string,
    customerId: number,
    productId: number,
    parentId?: string | null,
    replies?: any[],
    createdAt?: Date,
    updatedAt?: Date,
}

export interface InventoryDto {
    id?: number,
    stock?: number,
    soldCount?: number,
    lowStockThreshold?: number,
    productId?: number,
    storeId: number,
    createdAt?: Date,
    updatedAt?: Date
};

export interface ProductDto {
    id?: number,
    name: string,
    description: string,
    price: number,
    discountPrice?: number,
    isAvailable?: boolean,
    additionalInfo?: any,
    attributes?: any,
    metaData?: any,
    isFeatured?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    storeId: number,
    categoryId?: number,
    subcategoryId?: number
}