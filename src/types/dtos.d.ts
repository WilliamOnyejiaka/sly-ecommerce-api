
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
    createdBy: string,
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
