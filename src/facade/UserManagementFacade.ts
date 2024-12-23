import { Admin, Auth, Customer, Vendor } from "../services";
import { UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class UserFacade extends BaseFacade {

    private readonly authService: Auth = new Auth();
    private readonly customerService: Customer = new Customer();
    private readonly adminService: Admin = new Admin();
    private readonly vendorService: Vendor = new Vendor();

    protected getUserService(user: UserType) {
        const services = {
            [UserType.Admin]: this.adminService,
            [UserType.Vendor]: this.vendorService,
            [UserType.Customer]: this.customerService,
        };
        return services[user] || null;
    }


    public async getUserProfileWithId(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return await service.getUserProfileWithId(userId);
    }

    public async updateUserFirstName(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
    }

    public async updateUserLastName(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
    }


    public async updateUserPassword(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
    }


    public async updateUserEmail(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
    }

    public async deleteUser(userId: number, token: string, user: UserType) {
        const hasLoggedOut = await this.authService.logOut(token);
        const serviceError = this.handleServiceError(hasLoggedOut);
        if (serviceError) return serviceError;

        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return await service.deleteUser(userId);
    }
}