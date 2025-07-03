"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFormEmail = sendFormEmail;
const env_1 = require("../utils/env");
const mailUtils_1 = require("../utils/mailUtils");
async function sendFormEmail({ fromName, fromEmail, message, additionalData, }) {
    const emailText = `
        Name: ${fromName}
        Email: ${fromEmail}
        Message: ${message}
        Extra: ${JSON.stringify(additionalData, null, 2)}
    `;
    await mailUtils_1.transporter.sendMail({
        from: `"${fromName}" <${env_1.config.smtp.user}>`,
        to: env_1.config.toEmail,
        subject: "New Form Submission",
        replyTo: fromEmail,
        text: emailText,
    });
}
