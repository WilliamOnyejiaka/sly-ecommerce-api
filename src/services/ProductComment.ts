import constants, { http, urls } from "../constants";
import { CommentLike, ProductComment as ProductCommentRepo } from "../repos";
import BaseService from "./bases/BaseService";
import { ProductCommentDto } from "../types/dtos";
import { getPagination } from "../utils";

export default class ProductComment extends BaseService<ProductCommentRepo> {

    public commentLikeRepo = new CommentLike();

    public constructor() {
        super(new ProductCommentRepo())
    }

    public async createComment(data: ProductCommentDto) {
        if (data.parentId) {
            const parentExists = await this.repo!.getItemWithId(data.parentId);
            const repoResultError = this.handleRepoError(parentExists);
            if (repoResultError) return repoResultError;
            if (!parentExists.data) return this.responseData(404, true, "Parent comment wa not found");
        }
        return super.create<ProductCommentDto>(data, "Product Comment");
    }

    public async getWithId(id: number, depth: number) {
        const include = this.buildInclude(depth);
        const repoResult = await this.repo!.getWithId(id, include);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, true, constants('200Comment')!, repoResult.data);
    }

    public async paginateComments(productId: number, page: number, pageSize: number, depth: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip, take, {
            where: {
                productId: productId,
                OR: [
                    { parentId: null },          // Matches explicit null
                    // { parentId: { isSet: false } } // Matches missing fields - only for mongodb 
                ],
            }, include: this.buildInclude(depth)
        }, {
            where: {
                productId: productId,
                OR: [
                    { parentId: null },          // Matches explicit null
                    // { parentId: { isSet: false } } // Matches missing fields - only for mongodb 
                ],
            }
        });
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        return super.responseData(200, true, constants('200Comments')!, { data: repoResult.data, pagination });
    }

    public async paginateReplies(productId: number, page: number, pageSize: number, depth: number, parentId: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip, take, { where: { parentId: parentId, productId: productId }, include: this.buildInclude(depth) }, { where: { parentId: parentId, productId: productId } });
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        return super.responseData(200, true, constants('200Comments')!, { data: repoResult.data, pagination });
    }

    private buildInclude(depth: number) {
        let include: any = {};
        let current = include;
        for (let i = 0; i < depth; i++) {
            current.replies = { include: {} };
            current = current.replies.include;
        }
        return include;
    }

    public async like(commentId: number, userId: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const repoResult = await this.repo!.getWithId(commentId, {});
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        if (repoResult.data) {
            const likeResult = await this.commentLikeRepo.toggleLike(userId, commentId);
            const likeResultError = this.handleRepoError(likeResult);
            if (likeResultError) return likeResultError;
            return this.responseData(200, false, "Action was taken", likeResult.data);
        }
        return this.responseData(404, true, "Comment was not found");
    }
}