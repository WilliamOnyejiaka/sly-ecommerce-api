import jsonwebtoken from 'jsonwebtoken';

export default class Token {

    public static validateToken(token: string, types: string[], tokenSecret: string) {
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
                }
                result = {
                    error: true,
                    typeError: "Invalid token type",
                };                
                for (const type of decoded.types) {                    
                    if (types.includes(type)) {
                        result = {
                            error: false,
                            decoded: decoded
                        };
                        break;
                    }
                }
            }
        );

        return result;
    }

    public static createToken(secretKey: string, data: any, types: string[] = ["access"]) {
        return jsonwebtoken.sign(
            { data: data, types: types },
            secretKey,
            { expiresIn: "30d" }
        );
    }
}