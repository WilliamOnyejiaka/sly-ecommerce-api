import prisma from ".";
import Repo from "./Repo"
import { http } from "../constants";
import Repository from "../interfaces/Repository";

export default class Role extends Repo {

    public constructor(){
        super('role');
    }

    public async getRole(id: number) {
        return await super.getItemWithId(id);
    }

    public async deleteRole(id: number){
        return super.delete({ id: id }, `${this.tblName} with id - ${id} does not exist.`)
    }
}