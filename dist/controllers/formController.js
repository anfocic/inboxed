"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFormSubmission = void 0;
const formValidator_1 = require("../validation/formValidator");
const mailer_1 = require("../mailer");
const handleFormSubmission = async (req, res) => {
    const { website } = req.body;
    if (website && website.trim() !== "") {
        res.status(400).json({ error: 'Bot detected.' });
        return;
    }
    const parseResult = formValidator_1.formSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            error: 'Invalid request data',
            details: parseResult.error.errors,
        });
        return;
    }
    const { name, email, message, data } = parseResult.data;
    try {
        await (0, mailer_1.sendFormEmail)({
            fromName: name,
            fromEmail: email,
            message: message || '',
            additionalData: data,
        });
        res.status(200).json({ success: true, message: "Form submitted" });
    }
    catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};
exports.handleFormSubmission = handleFormSubmission;
