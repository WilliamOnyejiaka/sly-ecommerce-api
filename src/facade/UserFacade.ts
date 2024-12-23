import { Admin, Auth, Customer, Vendor } from "../services";
import { UserType } from "../types/enums";
import BaseUserFacade from "./bases/BaseUserFacade";

export default class UserFacade extends BaseUserFacade {

    private readonly authService: Auth = new Auth();

    public async updateUserFirstName(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return this.service.responseData(400, true, "Not yet implemented");
    }

    public async updateUserLastName(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return this.service.responseData(400, true, "Not yet implemented");
    }

    public async updateUserPassword(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return this.service.responseData(400, true, "Not yet implemented");
    }

    public async updateUserEmail(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return this.service.responseData(400, true, "Not yet implemented");
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