import { RequestHandler } from 'express';
import { formSchema } from '../validation/formValidator';
import { sendFormEmail } from '../mailer';

export const handleFormSubmission: RequestHandler = async (req, res) => {
    const { website } = req.body;
    if (website && website.trim() !== "") {
        res.status(400).json({ error: 'Bot detected.' });
        return;
    }

    const parseResult = formSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            error: 'Invalid request data',
            details: parseResult.error.errors,
        });
        return;
    }

    const { name, email, message, data } = parseResult.data;

    try {
        await sendFormEmail({
            fromName: name,
            fromEmail: email,
            message: message || '',
            additionalData: data,
        });
        res.status(200).json({ success: true, message: "Form submitted" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};