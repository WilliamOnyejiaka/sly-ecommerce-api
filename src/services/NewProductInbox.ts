import BaseService from "./bases/BaseService";
import { NewProductInbox as NewProductInboxRepo } from "../repos";
import { getPagination } from "../utils";

export default class NewProductInbox extends BaseService<NewProductInboxRepo> {

    public constructor() {
        super(new NewProductInboxRepo());
    }

    public async inbox(customerId: number, page: number, pageSize: number, viewed?: boolean) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getInbox(customerId, skip, take, viewed);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        return super.responseData(200, true, "Inbox was retrieved successfully", { data: data.items, pagination });
    }

    public async markAsViewed(customerId: number, id: number) {
        const repoResult = await this.repo!.markAsViewed(customerId, id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, true, "Item was viewed successfully", { data: repoResult.data });
    }
}