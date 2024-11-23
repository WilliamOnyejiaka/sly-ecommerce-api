import Service from ".";
import Repo from "../repos/Repo";
import { http } from "../constants";
import { loadJsonFile } from "../utils";
import jsonRoles from "./../seeds/roles.json";
import jsonPermissions from "./../seeds/roles.json";


export default class Seed {

    private static async defaultData(tblName: string, data: any[]) {
        const repo = new Repo(tblName);
        const hasDataResult = await repo.checkIfTblHasData();

        if (hasDataResult.error) {
            return Service.responseData(500, true, http('500')!);
        }

        if (!hasDataResult.hasData) {
            const newRoles = await repo.insertMany(data);
            return newRoles ? Service.responseData(200, false, "Seeding was successful") : Service.responseData(500, true, http('500')!);
        }

        return Service.responseData(400, true, "Table has already been seeded");
    }

    public static async defaultRoles() {
        // const result = loadJsonFile("./../../seeds/roles.json");
        return await Seed.defaultData('role',jsonRoles);

        // return !result.error ?
        //     await Seed.defaultData('role', result.data) :
        //     Service.responseData(500, true, http('500')!);
    }

    public static async defaultPermissions() {
        return await Seed.defaultData('permission', jsonPermissions);

        // const result = loadJsonFile("./../../seed/permissions.json");
        // return !result.error ?
        //     await Seed.defaultData('permission', result.data) :
        //     Service.responseData(500, true, http('500')!);
    }
}