import {Store} from ".";

export default class AdminStore {

    private readonly storeService = new Store();

    public async retreiveVendorStore(vendorId: number,baseUrl: string){
        return await this.storeService.getStoreAll(vendorId, baseUrl);
    } 
}