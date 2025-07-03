"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing required environment variable: ${name}`);
    return value;
}
exports.config = {
    port: process.env.PORT || 3000,
    smtp: {
        host: requireEnv("SMTP_HOST"),
        port: Number(process.env.SMTP_PORT || 587),
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASS"),
    },
    toEmail: requireEnv("TO_EMAIL"),
};
