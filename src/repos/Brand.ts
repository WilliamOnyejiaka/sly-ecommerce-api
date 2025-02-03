import prisma from ".";
import AssetRepo from "./bases/AssetRepo";

export default class Brand extends AssetRepo {

    public constructor() {
        super('brand','BrandImage');
    }

    public override async insert(data: any){
        return await super.insert(data);
    }

}