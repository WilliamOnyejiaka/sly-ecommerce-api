import { Admin } from ".";
import constants, { http } from "../constants";
import { Role as RoleRepo } from "../repos";
import { RoleDto } from "../types/dtos";
import { getPagination } from "../utils";
import Service from "./Service";

export default class Role extends Service<RoleRepo> {

    public constructor() {
        super(new RoleRepo());
    }

    public async createRole(roleData: RoleDto) {
        return await super.create<RoleDto>(roleData, "Role");
    }

    public async getRoleWithName(roleName: string) {
        const repoResult = await this.repo!.getRoleWithName(roleName);
            

        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const role = repoResult.data;
        const statusCode = role ? 200 : 404;
        const error: boolean = !role;
        const message = error ? "Role was not found" : constants('200Role')!;

        return super.responseData(statusCode, error, message, role);
    }

    public async getRoleWithId(roleId: number) {
        return await super.getItemWithId(roleId, "Role was not found", constants('200Role')!);
    }

    public async getAllRoles() {
        return await super.getAllItems(constants('200Roles')!);
    }

    public async paginateRoles(page: number, pageSize: number) {
        return await super.paginate(page,pageSize);
    }

    public async delete(id: number) {
        const adminRepoResult = await (new Admin()).massUnassignRole(id);
        if (adminRepoResult.json.error) {
            return super.responseData(500, true, http('500')!);
        }

        const repoResult = await this.repo!.deleteRole(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type!, true, repoResult.message!);
        }

        return super.responseData(200, !repoResult.error, "Role was deleted successfully");
    }

}