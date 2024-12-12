import Service from "./Service";
import Repo from "../repos/Repo";
import { http } from "../constants";
import jsonRoles from "./../seeds/roles.json";
import jsonPermissions from "./../seeds/permissions.json";


export default class Seed extends Service {

    public constructor() {
        super();
    }

    private async defaultData(tblName: string, data: any[]) {
        const repo = new Repo(tblName);
        const hasDataResult = await repo.checkIfTblHasData();

        if (hasDataResult.error) {
            super.responseData(hasDataResult.type, true, hasDataResult.message!);
        }

        if (!hasDataResult.data) {
            const repoResult = await repo.insertMany(data);
            return repoResult.error ? super.responseData(200, false, "Seeding was successful") : super.responseData(repoResult.type, true, repoResult.message as string);
        }

        return super.responseData(400, true, "Table has already been seeded");
    }

    public async defaultRoles() {
        return await this.defaultData('role', jsonRoles);
    }

    public async defaultPermissions() {
        return await this.defaultData('permission', jsonPermissions);
    }
}