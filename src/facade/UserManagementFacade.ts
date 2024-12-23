import { UserType } from "../types/enums";
import BaseUserFacade from "./bases/BaseUserFacade";

export default class UserManagementFacade extends BaseUserFacade {

    public async createUser() {

    }

    public async createUserAll(){
        
    }

    public async getUserProfileWithId(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return await service.getUserProfileWithId(userId);
    }

    public async getUserProfileWithEmail(userEmail: string, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.responseData(500, true, "Invalid user");
        return await service.getUserProfileWithEmail(userEmail);
    }

    public async paginateUsers(page: number, pageSize: number, user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.paginateUsers(page, pageSize);
    }

    public async getAllUsers(page: number, pageSize: number, user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.getAllUsers();
    }

    public async deleteUser(userId: number, user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.deleteUser(userId);
    }

}