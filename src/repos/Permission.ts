import prisma from ".";
import { PermissionDto } from "../types/dtos";
import Repo from "./Repo"


export default class Permission extends Repo {

    public constructor() {
        super('permission');
    }
}