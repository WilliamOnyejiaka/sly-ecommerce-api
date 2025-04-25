import BaseService from "./bases/BaseService";
import { NewFollower as NewFollowerRepo } from "../repos";

export default class NewFollower extends BaseService<NewFollowerRepo> {

    public constructor() {
        super(new NewFollowerRepo());
    }


}