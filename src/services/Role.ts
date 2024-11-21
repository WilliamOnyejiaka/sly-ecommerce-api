import Service from ".";
import { http } from "../constants";
import { Role as RoleRepo } from "../repos";

export default class Role {

    private readonly repo: RoleRepo = new RoleRepo();

    public async getRole(roleId: number){
        const repoResult = await this.repo.getRole(roleId);
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const role = repoResult.data;
        const statusCode = role ? 200 : 404;
        const error: boolean = role ? false : true;
        const message = error ? "Role was not found" : "Role has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return Service.responseData(statusCode, error, message, role);
    }
}