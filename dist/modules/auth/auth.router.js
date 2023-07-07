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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("./auth.controller.js"));
const isLogined_js_1 = __importDefault(require("../../common/middlewares/isLogined.js"));
const validateInput_js_1 = __importDefault(require("../../common/middlewares/validateInput.js"));
const authValidate = __importStar(require("./auth.validation.js"));
const router = express_1.default.Router();
router.post('/signup', (0, validateInput_js_1.default)(authValidate.signupSchema, 'body'), authController.signup);
router.post('/login', (0, validateInput_js_1.default)(authValidate.loginSchema, 'body'), authController.login);
router.get('/verify', isLogined_js_1.default, authController.verify);
exports.default = router;
