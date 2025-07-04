import express from 'express';
import formRoute from './routes/form.routes';
import rateLimiter from "./middleware/rateLimiter";
import cors from "./middleware/cors";
import { config, validateConfig } from './utils/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler, multerErrorHandler, setupGracefulShutdown } from './middleware/errorHandler';

// Validate configuration before starting the server
try {
    validateConfig();
} catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
}

export const app = express();

// Security and parsing middleware
app.use(cors);
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (_req, res) => {
    res.send('Welcome to Inboxed! 📬');
});

// Health check endpoint for Docker and monitoring
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.nodeEnv
    });
});

// API routes
app.use('/api/form', formRoute);

// Error handling middleware (must be last)
app.use(multerErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running at http://localhost:${config.port}`, {
        port: config.port,
        environment: config.nodeEnv,
        logLevel: config.logLevel
    });
});

// Setup graceful shutdown
setupGracefulShutdown(server);
