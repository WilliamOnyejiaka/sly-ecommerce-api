import prisma from ".";
import { AdminProfilePictureData } from "../interfaces/PictureData";
import Repository from "../interfaces/Repository";

export default class AdminProfilePicture implements Repository{

    public async insert(pictureData: AdminProfilePictureData) {
        try {
            const newProfilePicture = await prisma.adminProfilePicture.upsert({
                where: { adminId: pictureData.adminId },
                update: {
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
                create: {
                    adminId: pictureData.adminId!,
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
            });
            return newProfilePicture;
        } catch (error) {
            console.error("Failed to create profile picture: ", error);
            return {};
        }
    }

    public async getProfilePicture(adminId: number) {
        try {
            const profilePicture = await prisma.adminProfilePicture.findUnique({
                where: {
                    adminId
                }
            });
            return {
                error: false,
                data: profilePicture
            };
        } catch (error) {
            console.error("Failed to find profile picture with admin id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }
}