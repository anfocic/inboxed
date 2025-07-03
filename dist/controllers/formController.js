"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFormSubmission = handleFormSubmission;
const formValidator_1 = require("../validation/formValidator");
const mailer_1 = require("../mailer");
async function handleFormSubmission(req, res) {
    console.log(req.body);
    const { website } = req.body;
    if (website && website.trim() !== "") {
        return res.status(400).json({ error: 'Bot detected.' });
    }
    const parseResult = formValidator_1.formSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid request data',
            details: parseResult.error.errors,
        });
    }
    const { name, email, message, data } = parseResult.data;
    try {
        await (0, mailer_1.sendFormEmail)({
            fromName: name,
            fromEmail: email,
            message: message || '',
            additionalData: data,
        });
        return res.status(200).json({ success: true, message: "Form submitted" });
    }
    catch (error) {
        console.error("Email error:", error);
        return res.status(500).json({ error: "Failed to send email" });
    }
}
