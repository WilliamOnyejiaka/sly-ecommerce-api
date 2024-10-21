import { randomInt } from "../utils";
import { Email } from ".";
import { OTPCache } from "../cache";
import constants, { http } from "../constants";
import Service from ".";


export default class OTP {

    private readonly email: string;
    private readonly templateData: any;
    private otpCode!: string;

    constructor(email: string, templateData: any=null){
        this.email = email;
        this.templateData = templateData;
    }

    private generateOTP() {
        let otp: string = "";
        for (let i = 0; i <= 5; i++) otp += randomInt(0, 9);
        return otp;
    }

    private async storeOTP() {
        return await OTPCache.set(this.email,this.otpCode);
    }

    private async sendOTP() {
        const email = new Email();
        const emailContent = await email.getEmailTemplate(this.templateData);
        const mailResult = await email.sendEmail(
            "Ecommerce Api",
            this.email,
            "Vendor Email Verification",
            emailContent as string
        );
        return mailResult;
    }

    private setOTP(){
        this.otpCode = this.generateOTP();
        this.templateData.otpCode = this.otpCode;
    }

    public async send(){
        this.setOTP();
        const storedOTP = await this.storeOTP();

        if(storedOTP){
            const sentOTP = await this.sendOTP();
            const error: boolean = sentOTP ? false : true;
            const statusCode: number = sentOTP ? 200 : 500;
            const message: string = sentOTP ? "OTP has been sent successfully" : http("500")!;

            return Service.responseData(statusCode,error,message);
        }
        return Service.responseData(500,true,constants("failedCache")!);
    }

    public async confirmOTP(otpCode: string) {
        const cacheResult = await OTPCache.get(this.email);
        
        if(cacheResult.error){
            return Service.responseData(500, cacheResult.error, http("500")!);
        }

        const validOTPCode = cacheResult.otpCode === otpCode;
        const message = validOTPCode ? "Email has been verified successfully" : "Invalid otp";
        const statusCode = validOTPCode ? 200 : 401;
        return Service.responseData(statusCode, validOTPCode,message);
    }
}