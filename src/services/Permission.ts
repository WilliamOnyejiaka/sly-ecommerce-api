import { Admin } from ".";
import constants, { http } from "../constants";
import { Permission as PermissionRepo } from "../repos";
import { PermissionDto } from "../types/dtos";
import Service from "./Service";


export default class Permission extends Service<PermissionRepo> {

    public constructor() {
        super(new PermissionRepo());
    }

    // private async getPermission(nameOrId: string | number) {
    //     const repoResult = typeof nameOrId == "number" ? await this.repo!.getPermissionWithId(nameOrId) :
    //         await this.repo!.getPermissionWithName(nameOrId);

    //     if (repoResult.error) {
    //         return super.responseData(500, true, http("500") as string);
    //     }

    //     const permission = repoResult.data;
    //     const statusCode = permission ? 200 : 404;
    //     const error: boolean = !permission;
    //     const message = error ? "Permission was not found" : constants('200Permission')!;

    //     return super.responseData(statusCode, error, message, permission);
    // }

    // public async getPermissionWithId(permissionId: number) {
    //     return await this.getPermission(permissionId);
    // }

    // public async getPermissionWithName(permissionName: string) {
    //     return await this.getPermission(permissionName);
    // }

    public async getAllPermissions() {
        return await super.getAllItems(constants('200Permissions')!);
    }

    public async createPermission(permissionData: PermissionDto) {
        return await super.create<PermissionDto>(permissionData, "Permission");
    }

    public async delete(id: number) {
        const repoResult = await this.repo!.delete(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        return super.responseData(200, repoResult.error, "Permission was deleted successfully");
    }

}