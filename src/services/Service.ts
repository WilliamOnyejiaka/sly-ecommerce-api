import constants, { http } from "../constants";
import Repo from "../repos/Repo";
import { getPagination } from "../utils";

export default class Service<T extends Repo = Repo> {

    protected readonly repo?: T;

    constructor(repo?: T) {
        this.repo = repo;
    }

    protected responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    protected async create<U>(createData: U, itemName: string) {
        const repoResult = await this.repo!.insert(createData);
        return repoResult ?
            this.responseData(200, false, `${itemName} was created successfully`, repoResult) :
            this.responseData(500, true, http('500')!);
    }

    protected async getAllItems(message200: string) {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return this.responseData(500, true, http('500')!);
        }

        return this.responseData(200, false, message200, repoResult.data);
    }

    protected async getItemWithId(id: number, message200: string, message404: string = "Item was not found") {
        const repoResult = await this.repo!.getItemWithId(id);
        if (repoResult.error) {
            return this.responseData(500, true, http("500") as string);
        }

        const data = repoResult.data;
        const statusCode = data ? 200 : 404;
        const error: boolean = !data;
        const message = error ? message404 : message200;

        return this.responseData(statusCode, error, message, data);
    }

    public async emailExists(email: string) {
        const emailExists = await this.repo!.getItemWithEmail(email);

        if (emailExists.error) {
            return this.responseData(500, true, http("500") as string);
        }

        const statusCode = emailExists.data ? 400 : 200;
        const error: boolean = !!emailExists.data;

        return this.responseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    public async paginate(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip, take);

        if (repoResult.error) {
            return this.responseData(500, true, http('500')!);
        }

        const totalRecords = repoResult.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        repoResult.data.forEach((item: any) => delete item.password);

        return this.responseData(200, false, `Items were retrieved successfully`, { // TODO: make this more specific
            data: repoResult.data,
            pagination
        });
    }

    protected async deleteWithId(vendorId: number) {
        const repoResult = await this.repo!.deleteWithId(vendorId);
        if (repoResult.error) {
            return this.responseData(repoResult.type!, true, repoResult.message!);
        }

        return this.responseData(200, false, "Item was deleted successfully");
    }

}