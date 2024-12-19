import prisma from ".";
import { http } from "../constants";
import VendorDto from "../types/dtos";
import Repo from "./Repo";

interface UpdateData {
    firstName?: string,
    lastName?: string,
    password?: string,
    email?: string,
    verified?: boolean
}

export default class Vendor extends Repo {

    public constructor() {
        super("vendor");
    }

    public async getVendorAndRelationsWithId(id: number) {
        try {
            const vendor = await prisma.vendor.findUnique({
                where: { id: id },
                include: {
                    profilePicture: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            });
            return super.repoResponse(false, 200, null, vendor);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getVendorWithEmail(email: string) {
        return await super.getItem({ email: email });
    }

    public async getUserWithId(id: number) {
        return await super.getItemWithId(id);
    }

    public async getUserWithEmail(email: string) {
        return await this.getVendorWithEmail(email);
    }

    public async updateVendor(id: number, data: any) {
        return await super.update({ id: id }, data);
    }

    public async updateFirstName(id: number, firstName: string) {
        return await this.updateVendor(id, { firstName: firstName });
    }

    public async updateLastName(id: number, lastName: string) {
        return await this.updateVendor(id, { lastName: lastName });
    }

    public async updateEmail(id: number, email: string) {
        return await this.updateVendor(id, { email: email, verified: false });
    }

    public async updateVerifiedStatus(email: string) {
        return await super.update({ email: email }, { verified: true });
    }

    public async updateActiveStatus(id: number, activate: boolean = true) {
        return await super.update({ id: id }, { active: activate });
    }

    public async paginate(skip: number, take: number, filter?: any): Promise<{ error: boolean; message: string | null; type: number; data: any; } | { error: boolean; message: string | undefined; type: number; data: {}; }> {
        return await super.paginate(skip, take, {
            include: {
                profilePicture: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    public async getAll(filter?: any): Promise<{ error: boolean; message: string | null; type: number; data: any; } | { error: boolean; message: string | undefined; type: number; data: {}; }> {
        return await super.getAll({
            include: {
                profilePicture: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }
}