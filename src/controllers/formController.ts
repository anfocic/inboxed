import {Request, RequestHandler, Response} from 'express';
import {formSchema} from '../validation/formValidator';
import {sendEmail} from '../mailer';
import {sanitizeImages, sanitizeText} from "../utils/sanitize";
import {cleanupFiles} from "../utils/fileCleanup";
import {logger} from "../utils/logger";

export const handleSubmit: RequestHandler = async (req: Request, res: Response) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.info('Form submission started', {
        requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection?.remoteAddress || 'unknown'
    });

    const { website } = req.body;
    if (website && website.trim() !== "") {
        logger.securityEvent('honeypot_triggered', {
            requestId,
            honeypotValue: website,
            ip: req.ip || req.connection?.remoteAddress || 'unknown'
        });
        res.status(400).json({ error: 'Bot detected.' });
        return;
    }

    let parsedData: any = {};
    try {
        parsedData = JSON.parse(req.body.data);
    } catch (err) {
        logger.warn('Invalid JSON in data field', {
            requestId,
            error: err instanceof Error ? err.message : 'Unknown error',
            dataField: req.body.data
        });
        res.status(400).json({ error: 'Invalid JSON in `data` field' });
        return;
    }

    // ✅ Rebuild request body to match expected shape for validation
    const inputForValidation = {
        tenant: req.body.tenant,
        formId: req.body.formId,
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        website: req.body.website,
        data: parsedData,
        // Note: attachments are handled separately via multer (req.files)
    };


    //Validation
    const parseResult = formSchema.safeParse(inputForValidation);
    if (!parseResult.success) {
        logger.warn('Form validation failed', {
            requestId,
            validationErrors: parseResult.error.errors,
            formId: req.body.formId,
            tenant: req.body.tenant
        });
        res.status(400).json({
            error: 'Invalid request data',
            details: parseResult.error.errors,
        });
        return;
    }

    const { name, email, message, data, formId, tenant } = parseResult.data;

    const sanitizedName = sanitizeText(name);

    // Get files from multer - they should be in req.files as an array
    const files = (req.files as Express.Multer.File[]) || [];

    logger.info('Files received from multer', {
        requestId,
        fileCount: files.length,
        files: files.map(file => ({
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size
        }))
    });

    const sanitizedFiles = sanitizeImages(files);

    // Log form submission details
    logger.formSubmission({
        formId,
        tenant,
        email,
        hasAttachments: sanitizedFiles.length > 0,
        submissionTime: new Date().toISOString()
    });

    try {
        await sendEmail({
            fromName: sanitizedName,
            fromEmail: email,
            message: message || '',
            data: {
                ...data,
            },
            attachments: sanitizedFiles,
            formId,
            tenant
        });

        const processingTime = Date.now() - startTime;

        logger.emailSent({
            formId,
            tenant,
            recipientEmail: process.env.TO_EMAIL || 'unknown',
            attachmentCount: sanitizedFiles.length,
            processingTimeMs: processingTime
        });

        // Clean up uploaded files after successful email sending
        if (sanitizedFiles.length > 0) {
            await cleanupFiles(sanitizedFiles);
        }

        logger.info('Form submission completed successfully', {
            requestId,
            processingTimeMs: processingTime
        });

        res.status(200).json({ success: true, message: "Form submitted" });
    } catch (error) {
        const processingTime = Date.now() - startTime;

        logger.error("Email sending failed", {
            requestId,
            formId,
            tenant,
            processingTimeMs: processingTime,
            error: error instanceof Error ? error : new Error(String(error))
        });

        // Still clean up files even if email failed to prevent disk space issues
        if (sanitizedFiles.length > 0) {
            await cleanupFiles(sanitizedFiles);
        }

        res.status(500).json({ error: "Failed to send email" });
    }
};