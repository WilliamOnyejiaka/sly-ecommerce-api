import constants from "../../constants";
import Repo from "../../repos/bases/Repo";
import UserRepo from "../../repos/bases/UserRepo";
import { ImageMeta } from "../../types";
import { UserType } from "../../types/enums";
import { getPagination } from "../../utils";

export default class BaseService<T extends Repo = Repo> {

    protected readonly repo?: T;

    constructor(repo?: T) {
        this.repo = repo;
    }

    public sanitizeUserData(data: any, userType: UserType, repo: UserRepo) {
        let cacheData;
        data.profilePictureUrl = data[repo.imageRelation].length != 0 ? data[repo.imageRelation][0].imageUrl : null;
        delete data[repo.imageRelation];
        delete data.password;
        if (userType === UserType.VENDOR) {
            if (data.storeDetails.length > 0) {
                let storeDetails = data.storeDetails[0];
                storeDetails.storeLogo = storeDetails.storeLogo.length > 0 ? storeDetails.storeLogo[0].imageUrl : null;
                cacheData = { ...data };
                cacheData.storeDetails = JSON.stringify(storeDetails);
                if (data.oAuthDetails) {
                    cacheData.oAuthDetails = JSON.stringify(data.oAuthDetails);
                }
            }
            cacheData = { ...data };
            cacheData.storeDetails = JSON.stringify({});
            return { data, cacheData };
        } else if (userType === UserType.CUSTOMER) {
            let address = data.Address[0];
            data.Address = address;
            cacheData = { ...data };
            cacheData.Address = JSON.stringify(address);
            if (data.oAuthDetails) {
                cacheData.oAuthDetails = JSON.stringify(data.oAuthDetails);
            }
            return { data, cacheData };
        } else {
            return { data, cacheData: data }
        }

    }

    public responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    public handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }

    protected async create<U>(createData: U, itemName: string) {
        const repoResult = await this.repo!.insert(createData);
        const error = repoResult.error;
        const statusCode = repoResult.type;
        const message = !error ? `${itemName} was created successfully` : repoResult.message!;
        return this.responseData(statusCode, error, message, repoResult.data);
    }

    protected async getAllItems(message200: string) {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message!);
        }

        return this.responseData(200, false, message200, repoResult.data);
    }

    private async getItem(nameOrId: string | number, message200: string | undefined) {
        const repoResult = typeof nameOrId == "number" ? await this.repo!.getItemWithId(nameOrId) :
            await this.repo!.getItemWithName(nameOrId);

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message!);
        }


        const data = repoResult.data;
        const statusCode = data ? 200 : 404;
        const error: boolean = !data;
        const message = error ? "Item was not found" : message200 ?? "Item was retrieved successfully";

        return this.responseData(statusCode, error, message, data);
    }


    public async getItemWithId(id: number, message200?: string) {
        return await this.getItem(id, message200);
    }

    public async getItemWithName(name: string, message200?: string) {
        return await this.getItem(name, message200);
    }

    public async paginate(page: number, pageSize: number, filter: any = {}, countFilter: any = {}) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const repoResult = await this.repo!.paginate(Number(skip), take, filter, countFilter);

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message!);
        }

        const data: { items: any, totalItems: any } = repoResult.data as any;

        const totalRecords = data.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return this.responseData(200, false, `Items were retrieved successfully`, { // TODO: make this more specific
            data: data.items,
            pagination
        });
    }

    public sanitizeData(data: any[], fieldsToRemove: any[]): void {
        data.forEach(item => {
            fieldsToRemove.forEach(key => {
                delete item[key];
            });
        });
    }

    protected async deleteWithId(id: number) {
        const repoResult = await this.repo!.deleteWithId(id);
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message!);
        }

        return this.responseData(200, false, "Item was deleted successfully");
    }

    public async totalRecords() {
        const repoResult = await this.repo!.countTblRecords();
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message!);
        }

        return this.responseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
    }

    public getRepo() { return this.repo! }

    public setImageUrls(items: any[], imageDatas: string[]) {
        imageDatas.forEach(imageData => {
            items.forEach((item: any) => {
                const urlName = `${imageData}Url`;
                const imageArray = item[imageData];
                item[urlName] = (imageArray && imageArray.length > 0) ? imageArray[0].imageUrl : null;
                delete item[imageData];
            });
        });
    }

    public convertFilesToMeta(files: Express.Multer.File[]) {
        return files.map((image: Express.Multer.File) => ({
            originalname: image.originalname,
            mimetype: image.mimetype,
            fieldname: image.fieldname,
            filename: image.filename,
            destination: image.destination,
            path: image.path,
            size: image.size,
            buffer: image.buffer.toString('base64'), // Convert buffer to base64
        }));
    }

    public convertMetaToFiles(data: ImageMeta[]) {
        for (const [index, item] of data.entries()) {
            data[index].buffer = Buffer.from(item.buffer, 'base64');
        }
        return data;
    }

    protected skipTake(page: number, limit: number) {
        return { skip: (page - 1) * limit, take: limit }
    }

    protected getPagination(page: number, limit: number, totalRecords: any) {
        return getPagination(page, limit, totalRecords);
    }

    protected getImage(item: any): string | null {
        if (!item || !Array.isArray(item) || item.length === 0) {
            console.warn('Invalid or empty item in getImage:', item);
            return null;
        }

        const imageUrl = item[0]?.imageUrl;
        return imageUrl;
    }
}