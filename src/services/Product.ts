import { Product as ProductRepo } from "../repos";
import BaseService from "./bases/BaseService";
import { Store, SubCategory, Category, SSE } from ".";
import { InventoryDto, ProductDto } from "../types/dtos";
import { uploadProductQueue } from "../jobs/queues";
import { logger } from "../config";
import { getPagination } from "../utils";

export default class Product extends BaseService<ProductRepo> {

    public constructor() {
        super(new ProductRepo());
    }

    public async uploadProduct(productDto: ProductDto, inventoryDto: InventoryDto, images: Express.Multer.File[], userType: string, clientId: number) {
        const storeResult = await (new Store()).getItemWithId(productDto.storeId); // TODO: validate if store belongs to the vendor
        if (!storeResult.json.data) {
            return super.responseData(404, true, "Store does not exist");
        }

        const categoryResult = await (new Category()).getItemWithId(productDto.categoryId!);
        if (!categoryResult.json.data) {
            return super.responseData(404, true, "Category does not exist");
        }

        if (typeof productDto.subcategoryId! === "number") {
            const subcategoryResult = await (new SubCategory()).getItemWithId(productDto.subcategoryId!);
            if (!subcategoryResult.json.data) {
                return super.responseData(404, true, "Subcategory does not exist");
            }
        }

        const imageMetadata = super.convertFilesToMeta(images);

        const job = await uploadProductQueue.add('uploadProductQueue', {
            images: imageMetadata,
            inventoryDto,
            productDto,
            userType,
            clientId
        });

        const wasAdded = await SSE.addJob(job.id, userType, clientId);
        if (wasAdded) {
            logger.info(`Job ${job.id} added to queue for ${userType} - ${clientId}`);
            return super.responseData(200, false, "Product upload is processing")
        }

        return super.responseData(500, true, "Something went wrong");
    }

    public async getProduct(productId: number) {
        const repoResult = await this.repo!.getProduct(productId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        if (data) {
            const imageUrls = data!.productImage.map((item: any) => item.imageUrl);
            data.productImage = imageUrls;
        }
        return super.responseData(200, false, repoResult.message, data);
    }

    public async getProducts(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.getProducts(skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        let items = data.items;
        if (items) {
            items = items.map((item: any) => ({
                ...item,
                productImage: item.productImage.map((img: any) => img.imageUrl)
            }));
        }
        return super.responseData(200, true, "Products were retrieved successfully", { items, pagination });
    }

}