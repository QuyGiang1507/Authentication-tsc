"use strict";
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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const strict_1 = require("assert/strict");
const mongoose_1 = __importDefault(require("mongoose"));
const httpErrors_js_1 = __importDefault(require("./common/httpErrors.js"));
const index_js_1 = __importDefault(require("./modules/auth/index.js"));
function App() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv_1.default.config();
        (0, strict_1.ok)(process.env.MONGODB_URI);
        const options = {
            dbName: "small-test-1"
        };
        yield mongoose_1.default.connect(process.env.MONGODB_URI, options);
        console.log("Mongodb connected");
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.get('/', (req, res) => {
            res.send('Hello, World!');
        });
        app.use('/api/auth', index_js_1.default);
        app.use('*', (req, res) => {
            throw new httpErrors_js_1.default('Not found api', 404);
        });
        app.listen(process.env.PORT || 9900, () => {
            console.log('Server connected');
        });
    });
}
App();
