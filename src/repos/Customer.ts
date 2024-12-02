import prisma from ".";
import Repo from "./Repo";

export default class Customer extends Repo {

    public constructor() {
        super('customer');
    }
}