"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}
exports.default = HttpError;
