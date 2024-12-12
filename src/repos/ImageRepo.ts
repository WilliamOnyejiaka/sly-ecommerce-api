import prisma from ".";
import { ImageRepository } from "../interfaces/Repository";
import Repo from "./Repo";

export default class ImageRepo extends Repo implements ImageRepository {

    protected parentIdName: string;

    public constructor(tblName: string, parentIdName: string) {
        super(tblName);
        this.parentIdName = parentIdName;
    }

    public async insertImage(data: any) {
        const where = { [this.parentIdName]: data.parentId };
        delete data.parentId;

        try {
            const newImage = await (prisma[this.tblName] as any).upsert({
                where: where,
                update: data,
                create: { ...data, ...where },
            });
            return super.repoResponse(false, 201, null, newImage);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getImage(id: number) {
        try {
            const image = await (prisma[this.tblName] as any).findUnique({
                where: {
                    [this.parentIdName]: id
                }
            });
            return super.repoResponse(false, 200, null, image);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}