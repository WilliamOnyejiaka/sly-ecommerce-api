import prisma from ".";
import ImageRepo from "./ImageRepo";

export default class CustomerProfilePic extends ImageRepo {

    public constructor() {
        super('customerProfilePic','customerId');
    }

}
