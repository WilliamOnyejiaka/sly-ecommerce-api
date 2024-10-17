
export default interface IVendor {
    firstName: String,
    lastName: String,
    password: String,
    email: String,
    active?: boolean,
    isOauth?: boolean,
    oAuthDetails?: String,
    businessName: String,
    address?: String,
    phoneNumber: String,
    // createdAt?: any,
    // updatedAt?: any
}
