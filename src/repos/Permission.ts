import prisma from ".";
import { PermissionDto } from "../types/dtos";
import Repo from "./Repo"


export default class Permission extends Repo {

    public constructor() {
        super('permission');
    }

    public async insertPermission(data: PermissionDto) {
        return await super.insert(data)
    }
    
    public async getPermissionWithId(id: number) {
        return await super.getItemWithId(id);
    }

    public async getPermissionWithName(name: string) {
        return await super.getItem({ name: name });
    }

    public async deletePermission(id: number) {
        return super.delete({ id: id }, `${this.tblName} with id - ${id} does not exist.`)
    }

    public async getAllPermission() {
        return await super.getAll();
    }

    public async paginatePermission(skip: number, take: number) {
        return super.paginate(skip, take);
    }
}