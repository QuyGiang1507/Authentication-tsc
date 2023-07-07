"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpErrors_1 = __importDefault(require("../httpErrors"));
const validateInput = (schema, property) => {
    return function (req, res, next) {
        const input = req[property];
        const { error } = schema.validate(input);
        const valid = !Boolean(error);
        if (valid) {
            next();
        }
        else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            throw new httpErrors_1.default(message, 422);
        }
    };
};
exports.default = validateInput;
