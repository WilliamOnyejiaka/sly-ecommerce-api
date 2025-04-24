import { Product as ProductRepo } from "../repos";
import BaseService from "./bases/BaseService";
import { Store, SubCategory, Category, SSE } from ".";
import { InventoryDto, ProductDto } from "../types/dtos";
import { uploadProductQueue } from "../jobs/queues";

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
            return super.responseData(200, false, `Job ${job.id} added to queue for client ${userType} - ${clientId}`)
        }

        return super.responseData(500, true, "Something went wrong");
    }
}