import Service, { Admin } from ".";
import constants, { http } from "../constants";
import { AdminPermission as AdminPermissionRepo } from "../repos";
import { AdminPermissionDto } from "../types/dtos";
import { getPagination } from "../utils";

export default class AdminPermission {

    private readonly repo: AdminPermissionRepo = new AdminPermissionRepo();

    public async getAdminPermissionAndPermissionWithAdminId(adminId: number) {
        const repoResult =  await this.repo.getAdminPermissionAndPermissionWithAdminId(adminId);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const permission = repoResult.data;
        const statusCode = permission ? 200 : 404;
        const error: boolean = !permission;
        const message = error ? "AdminPermission was not found" : constants('200AdminPermission')!;

        return Service.responseData(statusCode, error, message, permission);
    }

    private async getAdminPermission(id: number, isAdmin: boolean = true) {
        const repoResult = isAdmin ? await this.repo.getAdminPermissionWithAdminId(id) :
            await this.repo.getAdminPermissionWithPermissionId(id);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const permission = repoResult.data;
        const statusCode = permission ? 200 : 404;
        const error: boolean = !permission;
        const message = error ? "AdminPermission was not found" : constants('200AdminPermission')!;

        return Service.responseData(statusCode, error, message, permission);
    }

    public async getAdminPermissionWithRoleId(permissionId: number) {
        return await this.getAdminPermission(permissionId, false);
    }

    public async getPermissionWithAdminId(adminId: number) {
        return await this.getAdminPermission(adminId);
    }

    public async getAllAdminPermissions() {
        const repoResult = await this.repo.getAllAdminPermission();

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, false, constants('200AdminPermissions')!, repoResult.data);
    }

    public async paginateAdminPermissions(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo.paginateAdminPermission(skip, take);

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return Service.responseData(200, false, constants('200AdminPermissions')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async createAdminPermission(adminPermissionData: AdminPermissionDto) {
        const repoResult = await this.repo.insertAdminPermission(adminPermissionData);
        return repoResult ? Service.responseData(200, false, "AdminPermission was created successfully", repoResult) : Service.responseData(500, true, http('500')!);
    }

    public async delete(id: number) {
        // const adminRepoResult = await (new Admin()).massUnassignRole(id);
        // if (adminRepoResult.json.error) {
        //     return Service.responseData(500, true, http('500')!);
        // }

        // const repoResult = await this.repo.deletePermission(id);
        // if (repoResult.error) {
        //     return Service.responseData(repoResult.type!, true, repoResult.message!);
        // }

        // return Service.responseData(200, !repoResult.error, "Permission was deleted successfully");
    }

}