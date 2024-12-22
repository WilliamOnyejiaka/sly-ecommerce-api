import { UserRegistration, Auth, UserOTP } from "../services";
import BaseService from "../services/bases/BaseService";
import VendorDto, { CustomerAddressDto } from "../types/dtos";

export default class AuthenticationManagementFacade {

    private readonly userRegistrationService: UserRegistration = new UserRegistration();
    private readonly authService: Auth = new Auth();
    private readonly service: BaseService = new BaseService();
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

    public async login(email: string, password: string, user: string) {
        switch (user) {
            case "customer":
                return await this.authService.customerLogin(email, password);
            case "admin":
                return await this.authService.adminLogin(email, password);
            case "vendor":
                return await this.authService.vendorLogin(email, password);
            default:
                return this.service.responseData(500, true, "Invalid user");
        }
    }

    public async logOut(token: string) {
        return await this.authService.logoOut(token);
    }

    public async sendUserOTP(email: string, user: string) {
        switch (user) {
            case "vendor":
                return await this.userOTPService.sendVendorOTP(email);
            case "admin":
                return await this.userOTPService.sendAdminOTP(email);
            case "customer":
                return await this.userOTPService.sendCustomerOTP(email);
            default:
                return this.service.responseData(500, true, "Invalid user");
        }
    }
}