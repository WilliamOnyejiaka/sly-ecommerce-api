import mime from "mime";
import Service, { Role } from ".";
import constants, { http, urls } from "../constants";
import { Admin as AdminRepo, AdminProfilePicture } from "../repos";
import { Password, processImage } from "../utils";
import { env } from "../config";
import { AdminDto } from "../types/dtos";

export default class Admin {

    private readonly profilePicRepo: AdminProfilePicture = new AdminProfilePicture();
    private readonly repo: AdminRepo = new AdminRepo();
    private readonly roleService: Role = new Role();

    public async defaultAdmin(roleId: number) {
        const email = env('defaultAdminEmail')!
        const emailExistsResult = await this.emailExists(email);

        if (emailExistsResult.json.error) {
            return Service.responseData(400, true, "This admin already exists");
        }

        const roleExistsResult = await this.roleService.getRole(roleId);

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

            const result = await this.repo.insert(defaultAminData);
            const error: boolean = result ? false : true
            const statusCode = error ? 500 : 201;
            const message: string = !error ? "Admin has been created successfully" : http("500")!;

            if (!error) {
                return Service.responseData(statusCode, error, message);
            }
            return Service.responseData(statusCode, error, message, result);
        }
        return roleExistsResult;
    }


    public async emailExists(email: string) { // Create a general function to handle this
        const emailExists = await this.repo.getAdminWithEmail(email);

        if (emailExists.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = emailExists.data ? true : false;

        return Service.responseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    public async uploadProfilePicture(image: Express.Multer.File, adminId: number, baseUrl: string) {
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
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
            Service.responseData(
                201,
                false,
                constants('201ProfilePic')!,
                { imageUrl: imageUrl }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }



    public async getAdminWithEmail(email: string) {
        const repoResult = await this.repo.getAdminWithEmail(email);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return Service.responseData(statusCode, error, message, admin);
    }

    public async getAdminAndRole(id: number) {
        const repoResult = await this.repo.getAdminAndRoleWithId(id);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return Service.responseData(statusCode, error, message, admin);
    }

    public async createAdmin(createData: AdminDto, adminName: string) {
        const roleExistsResult = await this.roleService.getRole(createData.roleId);

        if (roleExistsResult.json.error) {
            return roleExistsResult;
        }

        if (roleExistsResult.json.data) {
            const passwordHash = Password.hashPassword(createData.password!, env("storedSalt")!);
            createData.password = passwordHash;
            createData.createdBy = adminName;

            const result = await this.repo.insert(createData);
            const error: boolean = result ? false : true
            const statusCode = error ? 500 : 201;
            const message: string = !error ? "Admin has been created successfully" : http("500")!;

            if (!error) {
                delete (result as any).password;
                return Service.responseData(statusCode, error, message, result);
            }
            return Service.responseData(statusCode, error, message, result);
        }

        return roleExistsResult;
    }

    public async delete(id: number) {
        const repoResult = await this.repo.deleteAdmin(id);
        if (repoResult.error) {
            return Service.responseData(repoResult.type!, true, repoResult.message!);
        }

        return Service.responseData(200, !repoResult.error, "Admin was deleted successfully");
    }

    public async deactivateAdmin(id: number){
        const repoResult = await this.repo.updateActiveStatus(id,false);
        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, !repoResult.error, "Admin was deactivated successfully");
    }

    public async activateAdmin(id: number) {
        const repoResult = await this.repo.updateActiveStatus(id, true);
        if (repoResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(200, !repoResult.error, "Admin was activated successfully");
    }
}