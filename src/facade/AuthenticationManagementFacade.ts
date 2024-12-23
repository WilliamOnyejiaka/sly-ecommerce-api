import { UserRegistration, Auth, UserOTP } from "../services";
import VendorDto, { CustomerAddressDto } from "../types/dtos";
import { UserType } from "./../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class AuthenticationManagementFacade extends BaseFacade {

    private readonly userRegistrationService: UserRegistration = new UserRegistration();
    private readonly authService: Auth = new Auth();
    private readonly userOTPService: UserOTP = new UserOTP();

    public async vendorSignUp(vendorDto: VendorDto) {
        return await this.userRegistrationService.vendorSignUp(vendorDto)
    }

    public async customerSignUp(customerData: {
        firstName: string;
        lastName: string;
        password: string;
        email: string;
        phoneNumber: string;
    }, addressData: CustomerAddressDto) {
        return await this.userRegistrationService.customerSignUp(customerData, addressData);
    }

    public async adminSignUp(adminData: {
        firstName: string;
        lastName: string;
        email: string;
        active: boolean;
        phoneNumber: string;
        key?: string;
        roleId?: number;
    }) {
        return await this.userRegistrationService.adminSignUp(adminData)
    }

    /**
     * General login method that works for customer, admin, and vendor
     * @param email User email
     * @param password User password
     * @param user User type (customer, admin, or vendor)
     */
    public async login(email: string, password: string, user: UserType) {
        const loginMethods = {
            [UserType.Customer]: this.authService.customerLogin,
            [UserType.Admin]: this.authService.adminLogin,
            [UserType.Vendor]: this.authService.vendorLogin,
        };

        const loginMethod = loginMethods[user];
        return loginMethod ? await loginMethod(email, password) : this.service.responseData(500, true, "Invalid user type");
    }

    // public async login(email: string, password: string, user: string) {
    //     switch (user) {
    //         case "customer":
    //             return await this.authService.customerLogin(email, password);
    //         case "admin":
    //             return await this.authService.adminLogin(email, password);
    //         case "vendor":
    //             return await this.authService.vendorLogin(email, password);
    //         default:
    //             return this.service.responseData(500, true, "Invalid user");
    //     }
    // }

    public async logOut(token: string) {
        return await this.authService.logOut(token);
    }


    /**
     * Sends OTP to the user based on their type
     * @param email User email
     * @param user User type (customer, admin, or vendor)
     */
    public async sendUserOTP(email: string, user: UserType) {
        const sendOTPMethods = {
            [UserType.Vendor]: this.userOTPService.sendVendorOTP,
            [UserType.Admin]: this.userOTPService.sendAdminOTP,
            [UserType.Customer]: this.userOTPService.sendCustomerOTP,
        };

        const sendOTPMethod = sendOTPMethods[user];
        return sendOTPMethod ? await sendOTPMethod(email) : this.service.responseData(500, true, "Invalid user type")
    }

    /**
     * Verifies email for the user based on their type and OTP code
     * @param email User email
     * @param otpCode OTP code
     * @param user User type (customer, admin, or vendor)
     */
    public async emailVerification(email: string, otpCode: string, user: UserType) {
        const verifyEmailMethods = {
            [UserType.Vendor]: this.userOTPService.vendorEmailVerification,
            [UserType.Admin]: this.userOTPService.adminEmailVerification,
            [UserType.Customer]: this.userOTPService.customerEmailVerification,
        };

        const verifyEmailMethod = verifyEmailMethods[user];
        return verifyEmailMethod ? await verifyEmailMethod(email, otpCode) : this.service.responseData(500, true, "Invalid user type");
    }

    // public async sendUserOTP(email: string, user: string) {
    //     switch (user) {
    //         case "vendor":
    //             return await this.userOTPService.sendVendorOTP(email);
    //         case "admin":
    //             return await this.userOTPService.sendAdminOTP(email);
    //         case "customer":
    //             return await this.userOTPService.sendCustomerOTP(email);
    //         default:
    //             return this.service.responseData(500, true, "Invalid user");
    //     }
    // }

    // public async emailVerification(email: string, otpCode: string, user: string) {
    //     switch (user) {
    //         case "vendor":
    //             return await this.userOTPService.vendorEmailVerification(email, otpCode);
    //         case "admin":
    //             return await this.userOTPService.adminEmailVerification(email, otpCode);
    //         case "customer":
    //             return await this.userOTPService.customerEmailVerification(email, otpCode);
    //         default:
    //             return this.service.responseData(500, true, "Invalid user");
    //     }
    // }
}