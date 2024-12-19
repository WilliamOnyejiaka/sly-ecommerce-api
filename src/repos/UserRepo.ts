import prisma from ".";
import Repo from "./Repo";

export default class UserRepo extends Repo {

    public imageRelation: string;

    public constructor(tblName: string, imageRelation: string) {
        super(tblName);
        this.imageRelation = imageRelation;
    }

    public async getUserWithId(userId: number) {
        return await super.getItemWithId(userId);
    }

    public async getUserProfile(userIdOrEmail: number | string) {
        const where = typeof userIdOrEmail == "number" ? { id: userIdOrEmail } : { email: userIdOrEmail };
        return await super.getItem(where, {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    public async getUserProfileWithId(userId: number) {
        return await this.getUserProfile(userId);
    }

    public async getUserProfileWithEmail(userEmail: string) {
        return await this.getUserProfile(userEmail);
    }

    public async getAll(filter?: any): Promise<{ error: boolean; message: string | null; type: number; data: any; } | { error: boolean; message: string | undefined; type: number; data: {}; }> {
        return await super.getAll({
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    protected async updateWithIdOrEmail(idOrEmail: number | string, data: any) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        return await this.update(where, data);
    }

    public async updateActiveStatus(userId: number, activate: boolean = true) {
        return await this.updateWithIdOrEmail(userId, { active: activate });
    }
}