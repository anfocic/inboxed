import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

function getEnvNumber(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number, got: ${value}`);
    }
    return parsed;
}

interface SMTPConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
}

interface RateLimitConfig {
    windowMs: number;
    max: number;
}

interface FileUploadConfig {
    maxFileSize: number;
    maxFiles: number;
    allowedTypes: string[];
}

interface AppConfig {
    port: number;
    nodeEnv: string;
    smtp: SMTPConfig;
    toEmail: string;
    rateLimit: RateLimitConfig;
    fileUpload: FileUploadConfig;
    logLevel: string;
    logFile?: string;
}

// Validate and create configuration
export const config: AppConfig = {
    port: getEnvNumber('PORT', 3000),
    nodeEnv: process.env.NODE_ENV || 'development',

    smtp: {
        host: requireEnv("SMTP_HOST"),
        port: getEnvNumber("SMTP_PORT", 587),
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASS"),
        secure: getEnvNumber("SMTP_PORT", 587) === 465,
    },

    toEmail: requireEnv("TO_EMAIL"),

    rateLimit: {
        windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
        max: getEnvNumber('RATE_LIMIT_MAX', 100),
    },

    fileUpload: {
        maxFileSize: getEnvNumber('MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB
        maxFiles: getEnvNumber('MAX_FILES', 5),
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    },

    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE,
};

// Validate configuration on startup
export function validateConfig(): void {
    console.log('🔧 Validating configuration...');

    // Validate SMTP configuration
    if (!config.smtp.host.includes('.')) {
        throw new Error('SMTP_HOST appears to be invalid');
    }

    if (config.smtp.port < 1 || config.smtp.port > 65535) {
        throw new Error('SMTP_PORT must be between 1 and 65535');
    }

    if (!config.toEmail.includes('@')) {
        throw new Error('TO_EMAIL must be a valid email address');
    }

    // Validate file upload limits
    if (config.fileUpload.maxFileSize > 50 * 1024 * 1024) { // 50MB
        console.warn('⚠️ MAX_FILE_SIZE is very large (>50MB), this may cause memory issues');
    }

    if (config.fileUpload.maxFiles > 20) {
        console.warn('⚠️ MAX_FILES is very large (>20), this may cause performance issues');
    }

    console.log('✅ Configuration validated successfully');
    console.log(`📧 Email destination: ${config.toEmail}`);
    console.log(`🚀 Server will start on port: ${config.port}`);
    console.log(`📝 Log level: ${config.logLevel}`);
    console.log(`🔒 Environment: ${config.nodeEnv}`);
}
