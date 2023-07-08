"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.message = message;
        this.status = status;
        this.status = status;
    }
}
exports.default = HttpError;
