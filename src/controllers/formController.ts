import { Request, Response } from 'express';
import { formSchema } from '../validation/formValidator';
import { sendFormEmail } from '../mailer';

export async function handleFormSubmission(req: Request, res: Response) {
    console.log(req.body);
    const { website } = req.body;
    if (website && website.trim() !== "") {
        return res.status(400).json({ error: 'Bot detected.' });
    }

    const parseResult = formSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid request data',
            details: parseResult.error.errors,
        });
    }

    const { name, email, message, data } = parseResult.data;

    try {
        await sendFormEmail({
            fromName: name,
            fromEmail: email,
            message: message || '',
            additionalData: data,
        });
        return res.status(200).json({ success: true, message: "Form submitted" });
    } catch (error) {
        console.error("Email error:", error);
        return res.status(500).json({ error: "Failed to send email" });
    }
}