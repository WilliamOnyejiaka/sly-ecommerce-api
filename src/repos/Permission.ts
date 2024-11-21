import prisma from ".";
import Repo from "./Repo"


export default class Permission extends Repo {

    public constructor() {
        super('permission');
    }
}