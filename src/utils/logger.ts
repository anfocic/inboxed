import winston from 'winston';

// Create Winston logger instance
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: {
        service: 'inboxed',
        version: process.env.npm_package_version || '1.0.0'
    },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
                })
            )
        }),

        // Write error logs to file (if LOG_FILE env var is set)
        ...(process.env.LOG_FILE ? [
            new winston.transports.File({
                filename: process.env.LOG_FILE,
                level: 'error',
                format: winston.format.json()
            })
        ] : [])
    ],
});

// Enhanced logger interface with structured logging
export const logger = {
    info: (message: string, meta?: Record<string, any>) => {
        winstonLogger.info(message, meta);
    },

    error: (message: string, error?: Error | Record<string, any>) => {
        if (error instanceof Error) {
            winstonLogger.error(message, {
                error: error.message,
                stack: error.stack,
                name: error.name
            });
        } else {
            winstonLogger.error(message, error);
        }
    },

    warn: (message: string, meta?: Record<string, any>) => {
        winstonLogger.warn(message, meta);
    },

    debug: (message: string, meta?: Record<string, any>) => {
        winstonLogger.debug(message, meta);
    },

    // Legacy support for existing console.log calls
    log: (message: string, meta?: Record<string, any>) => {
        winstonLogger.info(message, meta);
    },

    // Specific logging methods for common use cases
    formSubmission: (data: {
        formId: string;
        tenant: string;
        email: string;
        hasAttachments: boolean;
        submissionTime: string;
    }) => {
        winstonLogger.info('Form submission received', {
            event: 'form_submission',
            ...data
        });
    },

    emailSent: (data: {
        formId: string;
        tenant: string;
        recipientEmail: string;
        attachmentCount: number;
        processingTimeMs: number;
    }) => {
        winstonLogger.info('Email sent successfully', {
            event: 'email_sent',
            ...data
        });
    },

    fileCleanup: (data: {
        filesCount: number;
        successCount: number;
        failureCount: number;
    }) => {
        winstonLogger.info('File cleanup completed', {
            event: 'file_cleanup',
            ...data
        });
    },

    securityEvent: (event: string, data: Record<string, any>) => {
        winstonLogger.warn(`Security event: ${event}`, {
            event: 'security',
            securityEvent: event,
            ...data
        });
    }
};