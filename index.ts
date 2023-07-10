import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {ok} from 'assert/strict';
import mongoose, { ConnectOptions } from 'mongoose';
import HttpError from './common/httpErrors.js';
import AuthRouter from './modules/auth/index.js';

async function App() {
    dotenv.config();
    ok(
        process.env.MONGODB_URI
    );
    const options: ConnectOptions = {
        dbName: "small-test-1"
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log("Mongodb connected");

    const app: Express = express();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello, World!');
    });
    
    app.use('/api/auth', AuthRouter);

    app.use('*', (req: Request, res: Response) => {
        throw new HttpError('Not found api', 404);
    })

    app.listen(process.env.PORT || 9900, () => {
    
        console.log('Server connected');
    });
}

App();
// 0888330000