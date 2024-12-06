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
            const newBrandImage = await (prisma[this.tblName] as any).upsert({
                where: where,
                update: data,
                create: { ...data, ...where },
            });
            return newBrandImage;
        } catch (error) {
            console.error(`Failed to insert ${this.tblName}: `, error);
            return {};
        }
    }

    public async getImage(id: number) {
        try {
            const image = await (prisma[this.tblName] as any).findUnique({
                where: {
                    [this.parentIdName]: id
                }
            });
            return {
                error: false,
                data: image
            };
        } catch (error) {
            console.error(`Failed to get ${this.tblName} id: `, error);
            return {
                error: true,
                data: {}
            };
        }
    }
}