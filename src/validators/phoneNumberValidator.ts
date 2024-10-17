import { PhoneNumberUtil } from "google-libphonenumber";
import { validations } from "../constants";


export default function phoneNumberValidator(phoneNumber: string) {
    const phoneNumberUtil = PhoneNumberUtil.getInstance();
    try {
        const number = phoneNumberUtil.parse(phoneNumber);
        if (phoneNumberUtil.isValidNumber(number)){
            return null;
        }else {
            return validations('INVALID_PHONE_NUMBER');
        }
    } catch (error) {
        return validations('INVALID_PHONE_NUMBER');
    }
}