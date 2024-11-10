
export interface AdminDto {
    id?: number,
    firstName: string,
    lastName: string,
    password: string,
    email: string,
    phoneNumber?: string,
    role: string
    createdAt?: any,
    updatedAt?: any,
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
