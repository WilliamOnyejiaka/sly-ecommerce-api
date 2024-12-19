import BaseCache from "../cache/BaseCache";
import constants, { http, HttpStatus } from "../constants";
import UserRepo from "../repos/UserRepo";
import { getPagination } from "../utils";
import BaseService from "./BaseService";

export default class UserService<T extends UserRepo, U extends BaseCache> extends BaseService<T> {

    protected readonly cache: U;

    public constructor(repo: T, cache: U) {
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

    public async emailExists(email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);

        const errorResponse = this.handleRepoError(emailExists);
        if (errorResponse) return errorResponse;

        const statusCode = emailExists.data ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        const error: boolean = !!emailExists.data;

        return this.responseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    protected handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }

    public async getUserProfileWithId(vendorId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(vendorId);

        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.responseData(statusCode, error, constants('200User')!, user);
        }

        return super.responseData(statusCode, error, constants('404User')!, repoResult.data);
    }

    public async getUserProfileWithEmail(email: string) {
        const repoResult = await this.repo!.getUserProfileWithEmail(email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const vendor = repoResult.data;
        const statusCode = vendor ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const message = error ? http(HttpStatus.NOT_FOUND.toString())! : "User has been retrieved";

        if (!error) {
            delete repoResult.data.password;
        }

        return super.responseData(statusCode, error, message, vendor);
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

        const totalRecords = repoResult.data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);

        this.sanitizeUserImageItems(repoResult.data.items);

        return super.responseData(HttpStatus.OK, false, constants('200Users')!, {
            data: repoResult.data,
            pagination
        });
    }


}