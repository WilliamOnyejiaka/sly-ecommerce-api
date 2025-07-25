import UserCache from "../../cache/bases/UserCache";
import { env, streamRouter } from "../../config";
import constants, { http, HttpStatus } from "../../constants";
import ImageRepo from "../../repos/bases/ImageRepo";
import UserRepo from "../../repos/bases/UserRepo";
import { getPagination } from "../../utils";
import ImageService from "../Image";
import BaseService from "./BaseService";
import Cloudinary from "../Cloudinary";
import { CdnFolders, ResourceType, StreamGroups, StreamEvents, UserType } from "../../types/enums";

export default class UserService<T extends UserRepo, U extends UserCache, V extends ImageRepo> extends BaseService<T> {

    protected readonly cache: U;
    protected readonly imageService: ImageService = new ImageService();
    protected readonly storedSalt: string = env("storedSalt")!;
    protected readonly cloudinary = new Cloudinary();

    public constructor(repo: T, cache: U, protected readonly profilePicRepo: V, protected readonly userType: UserType, protected readonly imageFolderName: CdnFolders) {
        super(repo);
        this.cache = cache;
    }

    protected sanitizeUserImageItems(items: any[]) {
        items.forEach((item: any) => {
            item.profilePictureUrl = item[this.repo!.imageRelation].length != 0 ? item[this.repo!.imageRelation][0].imageUrl : null;
            delete item[this.repo!.imageRelation];
            delete item.password;
        });
    }

    public async countAllUsers() {
        const repoResult = await this.repo!.countAllUsers();
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        return this.responseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
    }

    public async countAllNonAdminUsers() {
        const repoResult = await this.repo!.countAllNoAdminUsers();
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        return this.responseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
    }

    public async emailExists(email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);

        const errorResponse = this.handleRepoError(emailExists);
        if (errorResponse) return errorResponse;

        const statusCode = emailExists.data ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        const error: boolean = !!emailExists.data;

        return this.responseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    public async getUserProfileWithId(userId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(userId);

        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        let user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.responseData(statusCode, error, constants('200User')!, user);
        }

        return super.responseData(statusCode, error, constants('404User')!, repoResult.data);
    }

    // public async middlewareGetUser(userId: number) {
    //     const serviceResult = await this.getUserProfileWithId(userId);
    //     if (serviceResult.json.error) return serviceResult;
    //     let user = serviceResult.json.data;
    //     let cacheData = user;
    //     ({ data: user, cacheData } = this.sanitizeUserData(user, this.userType));
    //     return super.responseData(serviceResult.statusCode, false, serviceResult.json.message, { user, cacheData });
    // }

    public async getUserProfileWithEmail(email: string) {
        const repoResult = await this.repo!.getUserProfileWithEmail(email);
        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.responseData(statusCode, error, constants('200User')!, user);
        }

        return super.responseData(statusCode, error, constants('404User')!, user);
    }

    public async getAllUsers() {
        const repoResult = await this.repo!.getAll();
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        this.sanitizeUserImageItems(repoResult.data);
        return super.responseData(HttpStatus.OK, false, constants('200Users')!, repoResult.data);
    }

    public async paginateUsers(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo!.paginate(skip, take);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const data: { items: any, totalItems: any } = repoResult.data as any;

        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);

        this.sanitizeUserImageItems(data.items);

        return super.responseData(HttpStatus.OK, false, constants('200Users')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async uploadProfilePicture(image: Express.Multer.File, userId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(userId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;
        const hasProfilePic = userProfile[this.repo!.imageRelation].length > 0;
        if (hasProfilePic) return super.responseData(400, true, "This user already has a profile picture");

        const serviceResult = await this.imageService.uploadImage<V>(
            image,
            userId,
            this.profilePicRepo,
            this.imageFolderName,
            true
        );
        if (!serviceResult.json.error) {
            await streamRouter.addEvent(StreamGroups.USER, {
                type: StreamEvents.UPLOAD_PROFILE_PIC,
                data: {
                    userId,
                    userType: this.userType,
                    imageUrl: serviceResult.json.data.imageUrl
                },
            });
        }
        return serviceResult;
    }

    private async toggleActiveStatus(userId: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(userId, true) : await this.repo!.updateActiveStatus(userId, false);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const user = repoResult.data;
        delete user.password;
        const cacheResponse = await this.cache.get(userId);

        if (cacheResponse.error) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const cachedUser = cacheResponse.data
        const message = activate ? "User was activated successfully" : "User was deactivated successfully";

        if (cachedUser) {
            cachedUser.active = user.active;
            const successfulCache = await this.cache.set(userId, cachedUser);
            return successfulCache ? super.responseData(HttpStatus.OK, false, message, user) : super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }
        return super.responseData(200, false, message, user);
    }

    public async activateUser(userId: number) {
        return await this.toggleActiveStatus(userId);
    }

    public async deActivateUser(userId: number) {
        return await this.toggleActiveStatus(userId, false);
    }

    public async deleteUser(userId: number) {
        const profileRepoResult = await this.repo!.getUserProfileWithId(userId);
        const profileRepoResultError = super.handleRepoError(profileRepoResult);
        if (profileRepoResultError) return profileRepoResultError;

        const userProfile = profileRepoResult.data;
        if (!userProfile) return super.responseData(404, true, "User was not found");

        const profilePictureDetails = userProfile[this.repo!.imageRelation].length > 0 ? userProfile[this.repo!.imageRelation][0] : null;

        if (profilePictureDetails) {
            const deletedResult = await this.imageService.deleteImages([profilePictureDetails.publicId]);
            if (deletedResult.json.error) return deletedResult;
        }

        const repoResult = await this.repo!.deleteWithId(userId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const deleted = await this.cache.delete(userId);

        return deleted ?
            super.responseData(200, false, "User was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

}