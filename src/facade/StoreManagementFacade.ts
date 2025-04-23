import BaseFacade from "./bases/BaseFacade";
import { ImageService, Store } from "../services";
import { StoreDetailsDto } from "../types/dtos";
import { UserType } from "../types/enums";


export default class StoreManagementFacade extends BaseFacade {

    public readonly storeService: Store = new Store();
    private readonly imageService: ImageService = new ImageService();

    public async createStoreAll(storeDetailsDto: StoreDetailsDto, images: Express.Multer.File[], userType: UserType) {
        return await this.storeService.createStoreAll(storeDetailsDto, images, userType);
    }

    public async createStore(storeDetailsDto: StoreDetailsDto) {
        return await this.storeService.createStore(storeDetailsDto);
    }

}