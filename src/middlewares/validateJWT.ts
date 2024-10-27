import { Request, Response, NextFunction } from 'express';
import { Token } from '../services';

const validateJWT = (types: string[], tokenSecret: string, neededData: string[] = ['data']) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Token missing"
        });
        return;
    }
    const tokenValidationResult: any = Token.validateToken(token, types, tokenSecret);

    console.log(tokenValidationResult);
    

    if (tokenValidationResult.error === true) {
        if (tokenValidationResult.decodingError) {
            res.status(400).json({
                error: true,
                message: tokenValidationResult.decodingError,
            });
            return;
        }

        if (tokenValidationResult.typeError) {
            res.status(400).json({
                error: true,
                message: tokenValidationResult.typeError,
            });
            return;
        }
    }


    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.decoded[item];
    }
    next();
}

export default validateJWT;