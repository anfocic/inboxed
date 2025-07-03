import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

interface SMTPConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
}

interface AppConfig {
    port: string | number;
    smtp: SMTPConfig;
    toEmail: string;
}

export const config: AppConfig = {
    port: process.env.PORT || 3000,
    smtp: {
        host: requireEnv("SMTP_HOST"),
        port: Number(process.env.SMTP_PORT || 587),
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASS"),
    },
    toEmail: requireEnv("TO_EMAIL"),
};
