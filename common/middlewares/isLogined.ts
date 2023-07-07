import redis, { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';
import * as tokenProvider from '../tokenProvider.js';

declare module 'express' {
    interface Request {
      user?: object;
    }
}

const redisClient = createClient();
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.log(err.message);
})

async function isLogined(req : Request, res : Response, next: NextFunction) {
    const token: string | undefined = req.headers.authorization;

    let result: object | undefined;

    let isCached: boolean = false;
    try {
        if(!token) {
            next();
        }
        
        const identityData = tokenProvider.verify(token!);
        
        if (!identityData) {
            next();
        }
        
        const cacheResults = await redisClient.get(identityData.username);
        
        if (!cacheResults) {
            next();
        }

        isCached = true;
        result = JSON.parse(cacheResults!);

        req.user = result;

        next();
    } catch (err) {
        next();
    }
}

export default isLogined;