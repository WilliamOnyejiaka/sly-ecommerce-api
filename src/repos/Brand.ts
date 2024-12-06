import prisma from ".";
import Repo from "./Repo";

export default class Brand extends Repo {

    public constructor() {
        super('brand');
    }
    
}