import prisma from ".";
import Repo from "./Repo";
export default class Admin extends Repo {

    public constructor() {
        super('admin');
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
            return super.repoResponse(false, 200, null, admin);
        } catch (error) {
            return super.handleDatabaseError(error);
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
            return super.repoResponse(false, 200);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async updateActiveStatus(id: number, activeStatus: boolean) {
        return await super.updateWithIdOrEmail(id, { active: activeStatus })
    }

    public async deleteAdmin(adminId: number){
        return await super.delete({id: adminId});
    }

}