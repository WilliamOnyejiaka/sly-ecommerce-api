import { PrismaClient } from "@prisma/client";
import prisma from "..";
import Repo from "./Repo";

export default class AssetRepo extends Repo {

    public imageRelation: string;
    private readonly imageFilter: any;

    public constructor(tblName: keyof PrismaClient, imageRelation: string) {
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

    public override async paginate(skip: number, take: number, filter: any = {}, countFilter: any = {}) {

        return super.paginate(skip, take, {
            ...filter,
            ...this.imageFilter
        }, countFilter);
    }

    public async insertWithRelations(
        assetData: any,
        assetImage: any,
    ) {
        try {
            const data: any = {
                ...assetData
            };

            assetImage && (data[this.imageRelation] = { create: assetImage });

            const newAsset = await (prisma[this.tblName] as any).create({
                data: data
            });

            return {
                error: false,
                data: newAsset,
                type: 201,
                message: null
            };
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }


    public override async getAll(where: any = {}, filter?: any) {
        return await super.getAll(where, this.imageFilter)
    }

    public async updateItem(id: number, updateData: any) {
        return await super.update({ id: id }, updateData);
    }
}