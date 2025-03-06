import BaseFacade from "./bases/BaseFacade";
import { ImageService, Store } from "../services";
import { StoreDetailsDto } from "../types/dtos";


export default class StoreManagementFacade extends BaseFacade {

    public readonly storeService: Store = new Store();
    private readonly imageService: ImageService = new ImageService();

    public async createStoreAll(storeDetailsDto: StoreDetailsDto,images: Express.Multer.File[]){
        return await this.storeService.createStoreAll(storeDetailsDto,images);
    }

    public async createStore(storeDetailsDto: StoreDetailsDto){
        return await this.storeService.createStore(storeDetailsDto);
    }

}