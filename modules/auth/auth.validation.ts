import Joi, { Schema } from 'joi';

const signupSchema: Schema = Joi.object({
    username: Joi.string().min(8).required(),
    password: Joi.string().min(6).required(),
});

const loginSchema: Schema = Joi.object({
    username: Joi.string().min(8).required(),
    password: Joi.string().min(6).required(),
});


export {
    signupSchema,
    loginSchema,
}