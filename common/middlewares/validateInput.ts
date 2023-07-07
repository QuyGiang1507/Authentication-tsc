import HttpError from "../httpErrors";
import { Request, Response, NextFunction } from "express";
import { Schema, ValidationError } from "joi";

const validateInput = (schema : Schema, property : keyof Request) => {
    return function (req : Request, res : Response, next : NextFunction) {
        const input = req[property];

        const { error } = schema.validate(input);
        const valid = !Boolean(error);

        if (valid) {
            next();
        } else {
            const { details } = error as ValidationError;

            const message: string = details.map(i => i.message).join(',');
            throw new HttpError(message, 422);
        }
    }
}

export default validateInput;