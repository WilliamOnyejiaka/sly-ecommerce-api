import Service, { Admin } from ".";
import constants, { http } from "../constants";
import { Role as RoleRepo } from "../repos";
import { RoleDto } from "../types/dtos";
import { getPagination } from "../utils";

export default class Role {

    private readonly repo: RoleRepo = new RoleRepo();

    private async getRole(nameOrId: string | number) {
        const repoResult = typeof nameOrId == "number" ? await this.repo.getRoleWithId(nameOrId) :
            await this.repo.getRoleWithName(nameOrId);

        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const role = repoResult.data;
        const statusCode = role ? 200 : 404;
        const error: boolean = !role;
        const message = error ? "Role was not found" : constants('200Role')!;

        return Service.responseData(statusCode, error, message, role);
    }

    public async getRoleWithId(roleId: number) {
        return await this.getRole(roleId);
    }

    public async getRoleWithName(roleName: string) {
        return await this.getRole(roleName);
    }

    public async getAllRoles() {
        const repoResult = await this.repo.getAllRoles();

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, false, constants('200Roles')!, repoResult.data);
    }

    public async paginateRoles(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo.paginateRoles(skip, take);

        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return Service.responseData(200, false, constants('200Roles')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async createRole(roleData: RoleDto) {
        const repoResult = await this.repo.insertRole(roleData);
        return repoResult ? Service.responseData(200, false, "Role was created successfully", repoResult) : Service.responseData(500, true, http('500')!);
    }

    public async delete(id: number) {
        const adminRepoResult = await (new Admin()).massUnassignRole(id);
        if (adminRepoResult.json.error) {
            return Service.responseData(500, true, http('500')!);
        }

        const repoResult = await this.repo.deleteRole(id);
        if (repoResult.error) {
            return Service.responseData(repoResult.type!, true, repoResult.message!);
        }

        return Service.responseData(200, !repoResult.error, "Role was deleted successfully");
    }

}