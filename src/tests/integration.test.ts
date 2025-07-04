import request from 'supertest';
import { app } from '../index';
import { sendEmail } from '../mailer';
import path from 'path';
import fs from 'fs';

// Mock sendEmail to avoid sending real emails
jest.mock('../mailer');

describe('Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (sendEmail as jest.Mock).mockResolvedValue(true);
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'healthy',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                version: expect.any(String),
                environment: expect.any(String)
            });
        });
    });

    describe('Form Submission API', () => {
        it('should successfully submit a form with all fields', async () => {
            const formData = {
                tenant: 'test-tenant',
                formId: 'contact-form',
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello, this is a test message!',
                website: '', // honeypot field
                data: JSON.stringify({
                    phone: '+1-555-0123',
                    company: 'Test Company',
                    source: 'website'
                })
            };

            const response = await request(app)
                .post('/api/form/submit')
                .field('tenant', formData.tenant)
                .field('formId', formData.formId)
                .field('name', formData.name)
                .field('email', formData.email)
                .field('message', formData.message)
                .field('website', formData.website)
                .field('data', formData.data)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Form submitted'
            });

            expect(sendEmail).toHaveBeenCalledWith({
                fromName: 'John Doe',
                fromEmail: 'john@example.com',
                message: 'Hello, this is a test message!',
                data: {
                    phone: '+1-555-0123',
                    company: 'Test Company',
                    source: 'website'
                },
                attachments: [],
                formId: 'contact-form',
                tenant: 'test-tenant'
            });
        });

        it('should handle form submission with file attachments', async () => {
            // Create a test file
            const testFilePath = path.join(__dirname, 'test-image.png');
            const testFileContent = Buffer.from('fake-png-content');
            fs.writeFileSync(testFilePath, testFileContent);

            try {
                const response = await request(app)
                    .post('/api/form/submit')
                    .field('tenant', 'test-tenant')
                    .field('formId', 'contact-form')
                    .field('name', 'Jane Doe')
                    .field('email', 'jane@example.com')
                    .field('message', 'Test with attachment')
                    .field('website', '')
                    .field('data', '{}')
                    .attach('attachments', testFilePath)
                    .expect(200);

                expect(response.body).toEqual({
                    success: true,
                    message: 'Form submitted'
                });

                expect(sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        fromName: 'Jane Doe',
                        fromEmail: 'jane@example.com',
                        attachments: expect.arrayContaining([
                            expect.objectContaining({
                                originalName: 'test-image.png',
                                path: expect.any(String)
                            })
                        ])
                    })
                );
            } finally {
                // Clean up test file
                if (fs.existsSync(testFilePath)) {
                    fs.unlinkSync(testFilePath);
                }
            }
        });

        it('should reject honeypot submissions', async () => {
            const response = await request(app)
                .post('/api/form/submit')
                .field('tenant', 'test-tenant')
                .field('formId', 'contact-form')
                .field('name', 'Bot User')
                .field('email', 'bot@example.com')
                .field('message', 'I am a bot')
                .field('website', 'http://spam-site.com') // honeypot triggered
                .field('data', '{}')
                .expect(400);

            expect(response.body).toEqual({
                error: 'Bot detected.'
            });

            expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/form/submit')
                .field('tenant', '') // missing required field
                .field('formId', '')
                .field('name', '')
                .field('email', 'invalid-email')
                .field('website', '')
                .field('data', '{}')
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'Invalid request data',
                details: expect.any(Array)
            });

            expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON in data field', async () => {
            const response = await request(app)
                .post('/api/form/submit')
                .field('tenant', 'test-tenant')
                .field('formId', 'contact-form')
                .field('name', 'John Doe')
                .field('email', 'john@example.com')
                .field('website', '')
                .field('data', 'invalid-json{')
                .expect(400);

            expect(response.body).toEqual({
                error: 'Invalid JSON in `data` field'
            });

            expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should handle email sending failures gracefully', async () => {
            (sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP connection failed'));

            const response = await request(app)
                .post('/api/form/submit')
                .field('tenant', 'test-tenant')
                .field('formId', 'contact-form')
                .field('name', 'John Doe')
                .field('email', 'john@example.com')
                .field('website', '')
                .field('data', '{}')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to send email'
            });
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/unknown-route')
                .expect(404);

            expect(response.body).toMatchObject({
                error: 'Route not found',
                message: expect.stringContaining('Cannot GET /unknown-route')
            });
        });

        it('should handle malformed requests', async () => {
            const response = await request(app)
                .post('/api/form/submit')
                .send('malformed data')
                .expect(400);

            // Should handle the error gracefully
            expect(response.status).toBe(400);
        });
    });

    describe('Security', () => {
        it('should include security headers', async () => {
            const response = await request(app)
                .options('/api/form/submit')
                .set('Origin', 'https://example.com')
                .expect(204);

            // Check for CORS headers on preflight request
            expect(response.headers).toHaveProperty('access-control-allow-origin');
            expect(response.headers).toHaveProperty('access-control-allow-methods');
        });

        it('should include rate limit headers', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            // Check for rate limit headers
            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(response.headers).toHaveProperty('ratelimit-remaining');
        });
    });
});
