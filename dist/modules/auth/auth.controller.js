"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.login = exports.signup = void 0;
const user_js_1 = __importDefault(require("./user.js"));
const httpErrors_js_1 = __importDefault(require("../../common/httpErrors.js"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const redis_1 = require("redis");
const kafka_node_1 = require("kafka-node");
const tokenProvider = __importStar(require("../../common/tokenProvider.js"));
const redisClient = (0, redis_1.createClient)();
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.log(err.message);
});
const kafkaClient = new kafka_node_1.KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const producer = new kafka_node_1.Producer(kafkaClient);
const consumer = new kafka_node_1.Consumer(kafkaClient, [{ topic: 'login-topic' }, { topic: 'signup-topic' }], { autoCommit: true });
consumer.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received message:', message.value);
    const { topic, value } = message;
    if (topic === 'login-topic') {
        const { username, password } = JSON.parse(value.toString());
        // Check if user info is cached in Redis
        const data = yield redisClient.get(username);
        if (data) {
            const hashPassword = JSON.parse(data).password;
            const passwordMatch = yield bcrypt_1.default.compare(password, hashPassword);
            if (!passwordMatch) {
                throw new httpErrors_js_1.default('Invalid username or password!');
            }
            console.log('Login successful (from cache)');
        }
        else {
            const user = yield user_js_1.default.findOne({ username });
            console.log('Login successful');
            if (!user) {
                throw new httpErrors_js_1.default('Invalid username or password!');
            }
            const hashPassword = user.password;
            const passwordMatch = yield bcrypt_1.default.compare(password, hashPassword);
            if (!passwordMatch) {
                throw new httpErrors_js_1.default('Invalid username or password!');
            }
            yield redisClient.set(username, JSON.stringify(user));
        }
    }
    else if (topic === 'signup-topic') {
        const { username, password } = JSON.parse(value.toString());
        // Perform signup logic
        const userExists = yield user_js_1.default.findOne({ username });
        if (userExists) {
            throw new httpErrors_js_1.default('Signup fail! Username already exist!');
        }
        // Hash the password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        // Create a new user in MongoDB
        const newUser = yield user_js_1.default.create({ username, password: hashPassword });
        // Cache user info in Redis
        redisClient.set(username, JSON.stringify(newUser));
        console.log('Signup successful');
    }
}));
const signup = (req, res) => {
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
            }
            else {
                console.log('Published message to Kafka:', data);
                const token = tokenProvider.sign(username);
                res.send({
                    success: 1,
                    data,
                    token,
                });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.signup = signup;
const login = (req, res) => {
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
            }
            else {
                console.log('Published message to Kafka: ', data);
                const token = tokenProvider.sign(username);
                res.send({
                    success: 1,
                    data,
                    token,
                });
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.login = login;
const verify = (req, res) => {
    const { user } = req;
    const userInfo = user ? user : null;
    res.send({
        success: 1,
        data: userInfo,
    });
};
exports.verify = verify;
