import express from 'express';
import * as authController from './auth.controller.js';
import isLogined from '../../common/middlewares/isLogined.js';
import validateInput from '../../common/middlewares/validateInput.js';
import * as authValidate from './auth.validation.js';

const router = express.Router();

router.post(
    '/signup',
    validateInput(authValidate.signupSchema, 'body'),
    authController.signup,
);

router.post(
    '/login',
    validateInput(authValidate.loginSchema, 'body'),
    authController.login,
);

router.get(
    '/verify',
    isLogined,
    authController.verify,
);

export default router;