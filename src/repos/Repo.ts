import prisma from ".";
import { http } from "../constants";
import Repository from "../interfaces/Repository";

interface IRepoDelete {
    columnName: string,
    where: any
}

export default class Repo implements Repository {

    protected tblName: any;

    public constructor(tblName: string) {
        this.tblName = tblName;
    }


    public async insert(data: any) {
        try {
            const newItem = await (prisma[this.tblName] as any).create({ data: data });
            return newItem;
        } catch (error) {
            console.error(`Failed to create ${this.tblName}: `, error);
            return {};
        }

    }

    public async insertMany(data: any[]) {
        try {
            const newItems = (prisma[this.tblName] as any).createMany({ data: data, skipDuplicates: true });
            return newItems;
        } catch (error) {
            console.error("Failed to insert many items: ", error);
            return {};
        }
    }

    public async checkIfTblHasData() {
        try {            
            const count = await (prisma[this.tblName] as any).count();
            return {
                error: false,
                hasData: count > 0
            };
        } catch (error) {
            console.error('Error checking the table:', error);
            return {
                error: true
            };
        }
    }

    protected async getItemWithId(id: number) {
        try {
            const item = await (prisma[this.tblName] as any).findUnique({
                where: {
                    id: id
                }
            });
            return {
                error: false,
                data: item
            };
        } catch (error) {
            console.error(`Failed to get ${this.tblName} with id: `, error);
            return {
                error: true,
                data: {}
            };
        }
    }

    protected async getItemWithEmail(email: string) {
        try {
            const item = await (prisma[this.tblName] as any).findUnique({
                where: {
                    email: email
                }
            });
            return {
                error: false,
                data: item
            };
        } catch (error) {
            console.error(`Failed to get ${this.tblName} with email: `, error);
            return {
                error: true,
                data: {}
            };
        }
    }

    protected async getItem(where: any) {
        try {
            const item = await (prisma[this.tblName] as any).findUnique({
                where: where
            });
            return {
                error: false,
                data: item
            };
        } catch (error) {
            console.error(`Failed to get item from the ${this.tblName} table: `, error);
            return {
                error: true,
                data: {}
            };
        }
    }

    protected async delete(where: any, message404: string) {
        try {
            await (prisma[this.tblName] as any).delete({
                where: where,
            });
            return {
                error: false
            }
        } catch (error: any) {
            if (error.code === 'P2025') {
                console.error(message404);
                return {
                    error: true,
                    message: message404,
                    type: 404
                };
            } else {
                console.error(`Error deleting ${this.tblName}:`, error);
                return {
                    error: true,
                    message: http('500')!,
                    type: 500
                };
            }
        }
    }

    protected async updateWithIdOrEmail(idOrEmail: number | string, data: any) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        try {
            await (prisma[this.tblName] as any).update({
                where: where,
                data: data
            });

            return {
                error: false,
                updated: true
            };
        } catch (error) {
            console.error(`Failed to update ${this.tblName}: `, error);
            return {
                error: true,
                updated: false
            };
        }
    }

    protected async update(where: any, data: any) {
        try {
            await (prisma[this.tblName] as any).update({
                where: where,
                data: data
            });

            return {
                error: false,
                updated: true
            };
        } catch (error) {
            console.error(`Failed to update ${this.tblName}: `, error);
            return {
                error: true,
                updated: false
            };
        }
    }


    protected async paginate(skip: number, take: number) {
        try {
            const items = await (prisma[this.tblName] as any).findMany({
                skip,   // Skips the first 'skip' records
                take,   // Fetches 'take' records
            });
            const totalItems = await (prisma[this.tblName] as any).count();

            return {
                error: false,
                data: items,
                totalItems: totalItems
            };

        } catch (error) {
            console.log(`Failed to paginate ${this.tblName} items: `, error);
            return {
                error: true,
                data: {}
            }
        }
    }

    protected async getAll() {
        try {
            const items = await (prisma[this.tblName] as any).findMany();
            return {
                error: false,
                data: items
            };

        } catch (error) {
            console.log(`Failed to get all ${this.tblName} items: `, error);
            return {
                error: true,
                data: {}
            }
        }
    }
}