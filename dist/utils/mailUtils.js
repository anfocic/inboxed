"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.config.smtp.host,
    port: env_1.config.smtp.port,
    secure: env_1.config.smtp.port === 465,
    auth: {
        user: env_1.config.smtp.user,
        pass: env_1.config.smtp.pass,
    },
});
