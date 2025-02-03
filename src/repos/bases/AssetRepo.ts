import prisma from "..";
import Repo from "./Repo";

export default class AssetRepo extends Repo {

    public imageRelation: string;
    private readonly imageFilter: any;

    public constructor(tblName: string, imageRelation: string) {
        super(tblName);
        this.imageRelation = imageRelation;
        this.imageFilter = {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true,
                        publicId: true,
                        mimeType: true
                    },
                }
            }
        };
    }

    public async getItemAndImageRelationWithId(itemId: number) { // ! TODO: merge this method with the one below it, use UserRepo as reference
        return await super.getItem({ id: itemId }, this.imageFilter);
    }

    public async getItemAndImageRelationWithName(name: string) {
        return await super.getItem({ name: name }, this.imageFilter);
    }

    public override async paginate(skip: number, take: number) {
        return super.paginate(skip, take, this.imageFilter);
    }

    public override async getAll(filter?: any) {
        return await super.getAll(this.imageFilter)
    }

    public async updateItem(id: number, updateData: any) {
        return await super.update({ id: id }, updateData);
    }
}