import {config} from "../utils/env";
import {transporter} from "../utils/mailUtils";

interface EmailOptions {
    fromName: string;
    fromEmail: string;
    message: string;
    additionalData?: any;
}

export async function sendFormEmail({
                                        fromName,
                                        fromEmail,
                                        message,
                                        additionalData,
                                    }: EmailOptions) {
    const emailText = `
        Name: ${fromName}
        Email: ${fromEmail}
        Message: ${message}
        Extra: ${JSON.stringify(additionalData, null, 2)}
    `;

    await transporter.sendMail({
        from: `"${fromName}" <${config.smtp.user}>`,
        to: config.toEmail,
        subject: "New Form Submission",
        replyTo: fromEmail,
        text: emailText,
    });

}