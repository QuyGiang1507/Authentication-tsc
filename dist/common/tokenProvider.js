"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sign = (username) => {
    const identityData = {
        username,
    };
    const token = jsonwebtoken_1.default.sign(identityData, process.env.PRIVATE_KEY, {
        expiresIn: process.env.EXPIRE_TIME || "2 days"
    });
    return token;
};
exports.sign = sign;
const verify = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.PRIVATE_KEY);
};
exports.verify = verify;
