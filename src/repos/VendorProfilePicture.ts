import prisma from ".";
import ImageRepo from "./ImageRepo";

export default class VendorProfilePicture extends ImageRepo {

    public constructor() {
        super('vendorProfilePicture', 'vendorId');
    }

}