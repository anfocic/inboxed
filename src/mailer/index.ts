import {transporter} from "../utils/mail";
import {EmailOptions} from "../models/email.model";
import {generateEmailHTML, generateEmailText} from "../templates/emailTemplate";

export async function sendEmail({
                                    fromName,
                                    fromEmail,
                                    message,
                                    data,
                                    attachments = [],
                                    formId,
                                    tenant
                                }: EmailOptions) {

    const submissionTime = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const templateData = {
        fromName,
        fromEmail,
        message: message || '',
        data: data || {},
        submissionTime,
        formId: formId || 'unknown',
        tenant: tenant || 'unknown'
    };

    const emailHTML = generateEmailHTML(templateData);
    const emailText = generateEmailText(templateData);

    await transporter.sendMail({
        from: `"${fromName}" <${process.env.SMTP_USER}>`,
        to: process.env.TO_EMAIL,
        subject: `📬 New Form Submission from ${fromName}`,
        replyTo: fromEmail,
        text: emailText,
        html: emailHTML,
        attachments: attachments.map(file => ({
            filename: file.originalName,
            path: file.path,
        })),
    });

}