import mime from "mime";
import { Role } from ".";
import constants, { http, urls } from "../constants";
import { Admin as AdminRepo, AdminProfilePicture } from "../repos";
import { Password, processImage } from "../utils";
import { env } from "../config";
import { AdminDto } from "../types/dtos";
import Service from "./Service";

export default class Admin extends Service<AdminRepo> {

    private readonly profilePicRepo: AdminProfilePicture = new AdminProfilePicture();
    private readonly roleService: Role = new Role();

    public constructor() {
        super(new AdminRepo());
    }

    public async defaultAdmin(roleId: number) {
        const email = env('defaultAdminEmail')!
        const emailExistsResult = await this.emailExists(email);

        if (emailExistsResult.json.error) {
            return super.responseData(400, true, "This admin already exists");
        }

        const roleExistsResult = await this.roleService.getRoleWithId(roleId);

        if (roleExistsResult.json.error) {
            return roleExistsResult;
        }

        if (roleExistsResult.json.data) {
            let defaultAminData = {
                firstName: "Super",
                lastName: "Admin",
                email: email,
                roleId: roleId,
                createdBy: "self",
                active: true,
                password: env('defaultAdminPassword')!
            }
            const passwordHash = Password.hashPassword(defaultAminData.password, env("storedSalt")!);
            defaultAminData.password = passwordHash;

            const result = await this.repo!.insert(defaultAminData);
            const error: boolean = !result;
            const statusCode = error ? 500 : 201;
            const message: string = !error ? "Admin has been created successfully" : http("500")!;

            if (!error) {
                return super.responseData(statusCode, error, message);
            }
            return super.responseData(statusCode, error, message, result);
        }
        return roleExistsResult;
    }

    public async uploadProfilePicture(image: Express.Multer.File, adminId: number, baseUrl: string) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const mimeType = mime.lookup(image.path);
        const repoResult = await this.profilePicRepo.insert({
            mimeType: mimeType,
            picture: result.data!,
            adminId: adminId
        });

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("adminPic")!.split(":")[0] + adminId;

        return repoResult ?
            super.responseData(
                201,
                false,
                constants('201ProfilePic')!,
                { imageUrl: imageUrl }
            ) :
            super.responseData(
                500,
                true,
                http("500")!,
            );
    }


    public async getAdminWithEmail(email: string) {
        const repoResult = await this.repo!.getAdminWithEmail(email);
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return super.responseData(statusCode, error, message, admin);
    }

    public async getAdminAndRole(id: number) {
        const repoResult = await this.repo!.getAdminAndRoleWithId(id);
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return super.responseData(statusCode, error, message, admin);
    }

    public async createAdmin(createData: AdminDto, adminName: string) {
        const roleExistsResult = await this.roleService.getRoleWithId(createData.roleId);

        if (roleExistsResult.json.error) {
            return roleExistsResult;
        }

        if (roleExistsResult.json.data) {
            const passwordHash = Password.hashPassword(createData.password!, env("storedSalt")!);
            createData.password = passwordHash;
            createData.createdBy = adminName;

            const result = await this.repo!.insert(createData);
            const error: boolean = !result
            const statusCode = error ? 500 : 201;
            const message: string = !error ? "Admin has been created successfully" : http("500")!;

            if (!error) {
                delete (result as any).password;
                return super.responseData(statusCode, error, message, result);
            }
            return super.responseData(statusCode, error, message, result);
        }

        return roleExistsResult;
    }

    public async delete(id: number) {
        const repoResult = await this.repo!.deleteAdmin(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type!, true, repoResult.message!);
        }

        return super.responseData(200, !repoResult.error, "Admin was deleted successfully");
    }

    private async toggleActiveStatus(id: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(id, true) : await this.repo!.updateActiveStatus(id, false);
        if (repoResult.error) {
            const message = repoResult.type == 404 ? constants('404Admin')! : http('500')!;
            return super.responseData(repoResult.type!, true, message);
        }
        const message = activate ? "Admin was activated successfully" : "Admin was deactivated successfully";
        return super.responseData(200, false, message);
    }

    public async deactivateAdmin(id: number) {
        return this.toggleActiveStatus(id, false);
    }

    public async activateAdmin(id: number) {
        return this.toggleActiveStatus(id);
    }

    public async paginateRoles(page: number, pageSize: number) {
        return await this.roleService.paginateRoles(page, pageSize);
    }

    public async massUnassignRole(roleId: number) {
        const repoResult = await this.repo!.massUnassignRole(roleId);
        if (repoResult.error) {
            return super.responseData(500, true, http('500')!);
        }

        return super.responseData(200, false, "Mass UnAssignment was successfully");
    }

    public async assignRole(adminId: number, roleId: number) {
        const repoResult = await this.repo!.assignRole(adminId, roleId);
        if (repoResult.error) {
            const message = repoResult.type == 404 ? "Admin was not found" : http('500')!;
            return super.responseData(repoResult.type!, true, message);
        }

        return super.responseData(200, false, "Role was assigned successfully");
    }

    public async assignPermission(adminId: number, permissionId: number) {
        const repoResult = await this.repo!.assignRole(adminId, permissionId);
        if (repoResult.error) {
            const message = repoResult.type == 404 ? "Admin was not found" : http('500')!;
            return super.responseData(repoResult.type!, true, message);
        }

        return super.responseData(200, false, "Permission was assigned successfully");
    }


    public async getRoleWithId(roleId: number) {
        return await this.roleService.getRoleWithId(roleId);
    }
}