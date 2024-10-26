import prisma from ".";
import { AdminDto } from "../types/dtos";
export default class Admin {

    static async insert(adminData: AdminDto) {
        try {
            const newAdmin = await prisma.admin.create({ data: adminData as any });
            return newAdmin;
        } catch (error) {
            console.error("Failed to create admin: ", error);
            return {};
        }
    }

    static async getAdminWithEmail(email: string) {
        try {
            const admin = await prisma.admin.findUnique({
                where: {
                    email
                }
            });
            return {
                error: false,
                data: admin
            };
        } catch (error) {
            console.error("Failed to find admin with email: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }
}