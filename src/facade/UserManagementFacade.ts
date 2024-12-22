import { Admin, Customer, Vendor } from "../services";

export default class UserManagementFacade {

    private readonly customerService: Customer = new Customer();
    private readonly adminService: Admin = new Admin();
    private readonly vendorService: Vendor = new Vendor();

    public async createVendor(){
        return 
    }
}