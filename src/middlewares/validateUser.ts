import { NextFunction, Response, Request } from "express";
import constants, { http } from "../constants";
import Repository from "../interfaces/Repository";
import Cache from "../interfaces/Cache";

const validateUser = <T extends Cache, U extends Repository>(cache: T, repo: U) => async (req: Request, res: Response, next: NextFunction) => {
    const email = res.locals.data.email;
    const cacheResult = await cache.get(email);

    if (cacheResult.error) {
        res.status(500).json({
            error: true,
            message: http("500")!
        });
        return;

    }

    if (!cacheResult.data) {
        const user = await repo.getUserWithEmail(email);

        if (user.error) {
            res.status(404).json({
                error: true,
                message: constants('404User')
            });
            return;
        }

        if (!user.data) {
            res.status(404).json({
                error: true,
                message: constants('404User')
            });
            return;
        } else {
            cache.set(email, user.data);
            next();
            return;

        }
    }

    next();
}

export default validateUser;