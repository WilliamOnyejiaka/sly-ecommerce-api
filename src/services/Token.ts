import jsonwebtoken from 'jsonwebtoken';
import { env } from '../config';

export default class Token {

    public static validateToken(token: string, type: string, tokenSecret: string) {
        let result = {};
        jsonwebtoken.verify(
            token,
            tokenSecret,
            (err, decoded: any) => {
                if (err) {
                    result = {
                        error: true,
                        decodingError: err
                    };
                } else if (decoded.type === type) {
                    result = {
                        error: false,
                        decoded: decoded
                    };
                } else {
                    result = {
                        error: true,
                        typeError: `${type} token needed`,
                    };
                }
            }
        );

        return result;
    }

    public static createToken(data: any,type: string = "access") {
        return jsonwebtoken.sign(
            { data: data, type: type },
            env("accessTokenSecret") as string,
            { expiresIn: "30d" }
        );
    }
}