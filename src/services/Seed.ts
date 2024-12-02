import Service from "./Service";
import Repo from "../repos/Repo";
import { http } from "../constants";
import { loadJsonFile } from "../utils";
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
            return super.responseData(500, true, http('500')!);
        }

        if (!hasDataResult.hasData) {
            const newRoles = await repo.insertMany(data);
            return newRoles ? super.responseData(200, false, "Seeding was successful") : super.responseData(500, true, http('500')!);
        }

        return super.responseData(400, true, "Table has already been seeded");
    }

    public async defaultRoles() {
        return await this.defaultData('role',jsonRoles);
    }

    public async defaultPermissions() {
        return await this.defaultData('permission', jsonPermissions);
    }
}