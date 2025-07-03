import nodemailer from "nodemailer";
import {config} from "./env";

export const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});