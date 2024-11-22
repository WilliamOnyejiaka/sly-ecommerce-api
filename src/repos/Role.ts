import prisma from ".";
import Repo from "./Repo"
import { http } from "../constants";
import { RoleDto } from "../types/dtos";
export default class Role extends Repo {

    public constructor() {
        super('role');
    }

    public async insertRole(data: RoleDto) {
        return await super.insert(data)
    }
    public async getRoleWithId(id: number) {
        return await super.getItemWithId(id);
    }

    public async getRoleWithName(name: string) {
        return await super.getItem({ name: name });
    }

    public async deleteRole(id: number) {
        return super.delete({ id: id }, `${this.tblName} with id - ${id} does not exist.`)
    }

    public async getAllRoles() {
        return await super.getAll();
    }

    public async paginateRoles(skip: number, take: number) {
        return super.paginate(skip, take);
    }
}