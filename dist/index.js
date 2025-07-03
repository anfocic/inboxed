"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const form_routes_1 = __importDefault(require("./routes/form.routes"));
const rateLimiter_1 = __importDefault(require("./middleware/rateLimiter"));
const cors_1 = __importDefault(require("./middleware/cors"));
const env_1 = require("./utils/env");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
app.use(cors_1.default);
app.use(rateLimiter_1.default);
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.send('Welcome to FormBridge!');
});
app.use('/api/form', form_routes_1.default);
app.listen(env_1.config.port, () => {
    console.log(`Listening on port ${env_1.config.port}`);
    logger_1.logger.log(`🚀 Server running at http://localhost:${env_1.config.port}`);
});
