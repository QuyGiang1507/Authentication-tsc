import UserModel from "./user.js";
import { Request, Response } from "express";
import HttpError from "../../common/httpErrors.js";
import bcrypt from 'bcrypt';
import redis, { createClient } from 'redis';
import { KafkaClient, Producer, Consumer } from 'kafka-node';
import * as tokenProvider from '../../common/tokenProvider.js';

const redisClient = createClient();
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.log(err.message);
});

const kafkaClient = new KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const producer = new Producer(kafkaClient);
const consumer = new Consumer(
    kafkaClient,
    [{ topic: 'login-topic' }, { topic: 'signup-topic' }],
    { autoCommit: true }
);

consumer.on('message', async (message) => {
    console.log('Received message:', message.value);

    const { topic, value } = message;

    if (topic === 'login-topic') {
        const { username, password } = JSON.parse(value.toString());

        // Check if user info is cached in Redis
        const data = await redisClient.get(username);

        if (data) {
            const hashPassword = JSON.parse(data).password;
            const passwordMatch = await bcrypt.compare(password, hashPassword);

            if (!passwordMatch) {
                throw new HttpError('Invalid username or password!');
            }

            console.log('Login successful (from cache)');
        } else {
            const user = await UserModel.findOne({ username });
            console.log('Login successful');
            if (!user) {
                throw new HttpError('Invalid username or password!');
            }

            const hashPassword = user.password;

            const passwordMatch = await bcrypt.compare(password, hashPassword);

            if (!passwordMatch) {
                throw new HttpError('Invalid username or password!');
            }

            await redisClient.set(username, JSON.stringify(user));
        } 
    } else if (topic === 'signup-topic') {
        const { username, password } = JSON.parse(value.toString());
    
        // Perform signup logic
        const userExists = await UserModel.findOne({ username });

        if (userExists) {
            throw new HttpError('Signup fail! Username already exist!');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create a new user in MongoDB
        const newUser = await UserModel.create({ username, password: hashPassword });
    
        // Cache user info in Redis
        redisClient.set(username, JSON.stringify(newUser));
    
        console.log('Signup successful');
    }
});

const signup = (req : Request, res : Response) => {
    const { username, password } = req.body;
    // Publish a message to Kafka indicating a new user signed up
    try {
        const message = JSON.stringify({ username, password, action: 'signup' });
        const payloads = [
            { topic: 'signup-topic', messages: message },
        ];
        
        producer.send(payloads, (err, data) => {
            if (err) {
                console.error('Error publishing to Kafka:', err);
                res.send({
                    success: 0,
                    data: null,
                    message: 'Something went wrong!',
                });
            } else {
                console.log('Published message to Kafka:', data);
                const token = tokenProvider.sign(username);
                res.send({
                    success: 1,
                    data,
                    token,
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
}

const login = (req : Request, res : Response) => {
    const { username, password } = req.body;

    try {
        const message = JSON.stringify({ username, password, action: 'login' });
        const payloads = [
            { topic: 'login-topic', messages: message },
        ];
    
        producer.send(payloads, (err, data) => {
            if (err) {
                console.error('Error publishing to Kafka: ', err);
                res.send({
                    success: 0,
                    data: null,
                    message: 'Something went wrong!',
                });
            } else {
                console.log('Published message to Kafka: ', data);
                const token = tokenProvider.sign(username);
                res.send({
                    success: 1,
                    data,
                    token,
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
};

const verify = (req : Request, res: Response) => {
    const { user } = req;
    const userInfo = user ? user : null;

    res.send({
        success: 1,
        data: userInfo,
    });
}

export {
    signup,
    login,
    verify,
};