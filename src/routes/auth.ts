import { Router, Request, Response  } from "express";
import { Auth } from "../controllers";
import { getBasicAuthHeader,validateBody } from "../middlewares";

const auth: Router = Router();

function test(req: Request, res: Response){
    res.status(400).json({
        error: false,
        message: "invalid email"
    });
}

auth.post("/vendor-sign-up",validateBody([
    'firstName',
    'lastName',
    'password',
    'email',
    'businessName',
    'address',
    'phoneNumber'
]),Auth.vendorSignUp);

auth.get("/vendor-login", getBasicAuthHeader, Auth.vendorLogin);
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;