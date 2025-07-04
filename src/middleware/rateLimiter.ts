import rateLimit from 'express-rate-limit';
import { config } from '../utils/env';
import { logger } from '../utils/logger';

export default rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.securityEvent('rate_limit_exceeded', {
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });

        res.status(429).json({
            error: "Too many requests. Please try again later.",
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
        });
    }
});