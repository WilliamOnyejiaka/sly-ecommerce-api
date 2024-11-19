import jsonwebtoken from 'jsonwebtoken';
import { http } from '../constants';

export default class Token {

    public static validateToken(token: string, types: string[], tokenSecret: string) {
        let result: any = {};
        try {
            result = jsonwebtoken.verify(token, tokenSecret);

        } catch (err: any) {
            console.error("\nError: ",err.message,"\n");

            const message = err.message[0].toUpperCase() + err.message.slice(1);
            return {
                error: true,
                message: message,
                data: {}
            };
        }

        let validTypes = true;

        for (const type of result.types) {
            if (!types.includes(type)) {
                validTypes = false;
                break;
            }
        }

        return validTypes ? {
            error: false,
            message: null,
            data: {}
        } : {
            error: true,
            message: http("401"),
            data: {}
        }
    }

    public static createToken(secretKey: string, data: any, types: string[] = ["access"]) {
        return jsonwebtoken.sign(
            { data: data, types: types },
            secretKey,
            { expiresIn: "30d" }
        );
    }
}