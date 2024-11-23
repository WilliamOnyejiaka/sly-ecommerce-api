import prisma from ".";
import { AdminDto } from "../types/dtos";
import Repo from "./Repo";
export default class Admin extends Repo {

    public constructor() {
        super('admin');
    }

    async insert(adminData: AdminDto) {
        try {
            const newAdmin = await prisma.admin.create({ data: adminData as any });
            return newAdmin;
        } catch (error) {
            console.error("Failed to create admin: ", error);
            return {};
        }
    }

    private async getAdminAndRole(idOrEmail: number | string) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };

        try {
            const admin = await (prisma['admin'] as any).findUnique({
                where: where,
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true,
                            RolePermission: {
                                select: {
                                    permission: true,
                                }
                            },
                        }
                    },
                    directPermissions: {
                        select: {
                            permission: true
                        }
                    }
                },
            });
            return {
                error: false,
                data: admin
            };

        } catch (error) {
            console.error("Failed to get admin with id: ", error);
            return {
                error: true,
                data: {}
            }
        }
    }

    public async getAdminAndRoleWithId(id: number) {
        return await this.getAdminAndRole(id);
    }

    public async getAdminAndRoleWithEmail(email: string) {
        return await this.getAdminAndRole(email);
    }

    public async getAdmin(id: number) {
        return await super.getItemWithId(id);
    }

    public async getAdminWithEmail(email: string) {
        return await super.getItemWithEmail(email);
    }

    public async assignRole(adminId: number, roleId: number) {
        return await super.update({ id: adminId }, { roleId: roleId });
    }

    public async massUnassignRole(roleId: number) {
        try {
            await (prisma['admin'] as any).updateMany({
                where: {
                    roleId: roleId
                },
                data: {
                    roleId: null,
                },
            });
            return {
                error: false,
                updated: true
            };

        } catch (error) {
            console.error("Failed to unassign roles: ", error);
            return {
                error: true,
                updated: true
            }
        }
    }

    public async deleteAdmin(id: number) {
        return await super.delete({ id: id }, `${this.tblName} with id - ${id} does not exist.`)
    }

    public async updateActiveStatus(id: number, activeStatus: boolean) {
        return await super.updateWithIdOrEmail(id, { active: activeStatus })
    }

}