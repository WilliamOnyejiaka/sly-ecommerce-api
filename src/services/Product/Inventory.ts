import { Product as ProductRepo, Inventory as InventoryRepo } from "../../repos";
import BaseService from "../bases/BaseService";

export default class Inventory extends BaseService<InventoryRepo> {

    public constructor(){
        super(new InventoryRepo());
    }


}