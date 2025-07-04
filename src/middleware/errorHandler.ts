import {NextFunction, Request, Response} from 'express';
import {logger} from '../utils/logger';
import {config} from '../utils/env';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
): void => {
    const requestId = Math.random().toString(36).substring(7);
    
    // Log the error with context
    logger.error('Unhandled error occurred', {
        requestId,
        error: {
            name: error.name,
            message: error.message,
            stack: config.nodeEnv === 'development' ? error.stack : undefined,
            statusCode: error.statusCode
        },
        request: {
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent')
        }
    });

    // Determine status code
    const statusCode = error.statusCode || 500;
    
    // Prepare error response
    const errorResponse: any = {
        error: 'An error occurred while processing your request',
        requestId
    };

    // Add more details in development
    if (config.nodeEnv === 'development') {
        errorResponse.details = {
            message: error.message,
            stack: error.stack
        };
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent')
    });

    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.url}`
    });
};

/**
 * Handle multer errors specifically
 */
export const multerErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        logger.securityEvent('file_size_exceeded', {
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            maxSize: config.fileUpload.maxFileSize
        });
        
        res.status(400).json({
            error: 'File too large',
            message: `Maximum file size is ${Math.round(config.fileUpload.maxFileSize / 1024 / 1024)}MB`
        });
        return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        logger.securityEvent('file_count_exceeded', {
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            maxFiles: config.fileUpload.maxFiles
        });
        
        res.status(400).json({
            error: 'Too many files',
            message: `Maximum ${config.fileUpload.maxFiles} files allowed`
        });
        return;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({
            error: 'Unexpected file field',
            message: 'Files must be uploaded in the "attachments" field'
        });
        return;
    }

    // Handle other multer errors
    if (error.message && error.message.includes('not allowed')) {
        res.status(400).json({
            error: 'Invalid file type',
            message: error.message
        });
        return;
    }

    // Pass to general error handler
    next(error);
};

/**
 * Graceful shutdown handler
 */
export const setupGracefulShutdown = (server: any): void => {
    const shutdown = (signal: string) => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        
        server.close((err: any) => {
            if (err) {
                logger.error('Error during server shutdown', err);
                process.exit(1);
            }
            
            logger.info('Server closed successfully');
            process.exit(0);
        });
        
        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception', error);
        process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled promise rejection', {
            reason: reason instanceof Error ? reason : new Error(String(reason)),
            promise: promise.toString()
        });
        process.exit(1);
    });
};
