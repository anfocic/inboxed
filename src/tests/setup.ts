// Test environment setup
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.ALLOWED_ORIGINS = '*';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-password';
process.env.TO_EMAIL = 'test@example.com';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
