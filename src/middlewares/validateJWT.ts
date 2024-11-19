import { Request, Response, NextFunction } from 'express';
import { Token } from '../services';
import { http } from '../constants';

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
    
    if(tokenValidationResult.error){
        const statusCode = tokenValidationResult.message == http("401") ? 401 : 400;
        res.status(statusCode).json({
            error: true,
            message: tokenValidationResult.message
        });
        return;
    }

    let data = {};
    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.data[item];
    }
    next();
}

export default validateJWT;