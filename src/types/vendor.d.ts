
export default interface IVendor {
    firstName: String,
    lastName: String,
    password: String,
    email: String,
    active?: boolean,
    isOauth?: boolean,
    oAuthDetails?: String,
    phoneNumber: String,
    createdAt?: Date,
    updatedAt?: Date
}
