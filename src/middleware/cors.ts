import cors from 'cors';
import { config } from '../utils/env';
import { logger } from '../utils/logger';

// Parse allowed origins from environment variable
const getAllowedOrigins = (): string[] | boolean => {
    const origins = process.env.ALLOWED_ORIGINS;

    if (!origins) {
        // In development, allow all origins
        if (config.nodeEnv === 'development') {
            return true;
        }
        // In production, require explicit origins
        throw new Error('ALLOWED_ORIGINS must be set in production environment');
    }

    if (origins === '*') {
        logger.warn('CORS configured to allow all origins - this may be insecure in production');
        return true;
    }

    return origins.split(',').map(origin => origin.trim());
};

export default cors({
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins === true) {
            return callback(null, true);
        }

        if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        logger.securityEvent('cors_violation', {
            origin,
            allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : ['*']
        });

        callback(new Error('Not allowed by CORS'));
    },
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    credentials: false, // Set to true if you need to support cookies
    maxAge: 86400, // 24 hours
});