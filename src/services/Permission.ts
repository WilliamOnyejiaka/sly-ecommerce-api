import Service, { Admin } from ".";
import constants, { http } from "../constants";
import { Permission as PermissionRepo } from "../repos";
import { PermissionDto } from "../types/dtos";
import { getPagination } from "../utils";

export default class Permission {

    private readonly repo: PermissionRepo = new PermissionRepo();

    private async getPermission(nameOrId: string | number) {
        const repoResult = typeof nameOrId == "number" ? await this.repo.getPermissionWithId(nameOrId) :
            await this.repo.getPermissionWithName(nameOrId);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const permission = repoResult.data;
        const statusCode = permission ? 200 : 404;
        const error: boolean = !permission;
        const message = error ? "Permission was not found" : constants('200Permission')!;

        return Service.responseData(statusCode, error, message, permission);
    }

    public async getPermissionWithId(roleId: number) {
        return await this.getPermission(roleId);
    }

    public async getPermissionWithName(roleName: string) {
        return await this.getPermission(roleName);
    }

    public async getAllPermissions() {
        const repoResult = await this.repo.getAllPermission();

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, false, constants('200Permissions')!, repoResult.data);
    }

    public async paginatePermissions(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo.paginatePermission(skip, take);

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return Service.responseData(200, false, constants('200Permissions')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async createPermission(permissionData: PermissionDto) {
        const repoResult = await this.repo.insertPermission(permissionData);
        return repoResult ? Service.responseData(200, false, "Permission was created successfully", repoResult) : Service.responseData(500, true, http('500')!);
    }

    public async delete(id: number) {
        const repoResult = await this.repo.deletePermission(id);
        if (repoResult.error) {
            return Service.responseData(repoResult.type!, true, repoResult.message!);
        }

        return Service.responseData(200, !repoResult.error, "Permission was deleted successfully");
    }

}