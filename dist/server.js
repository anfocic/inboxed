"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const env_1 = require("./utils/env");
const logger_1 = require("./utils/logger");
index_1.default.listen(env_1.config.port, () => {
    console.log(`Listening on port ${env_1.config.port}`);
    logger_1.logger.log(`🚀 Server running at http://localhost:${env_1.config.port}`);
});
