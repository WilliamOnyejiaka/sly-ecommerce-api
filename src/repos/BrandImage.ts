import prisma from ".";
import ImageRepo from "./ImageRepo";

export default class BrandImage extends ImageRepo {

    public constructor(){
        super('brandImage','brandId');
    }
}
