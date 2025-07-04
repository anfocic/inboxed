import { sendEmail } from '../mailer';
import { Request, Response, NextFunction } from 'express';
import {handleSubmit} from "../controllers/formController";

// Mock sendEmail so we don't send real emails
jest.mock('../mailer');

describe('handleSubmit', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        next = jest.fn();
        res = { status: statusMock, json: jsonMock };

        // Mock request methods
        req = {
            get: jest.fn().mockReturnValue('test-user-agent'),
            ip: '127.0.0.1',
            body: {},
            files: []
        } as any;
    });

    it('returns 400 if honeypot (website) is filled in', async () => {
        req.body = {
            website: 'I am a bot 🕷️',
            name: 'Test User',
            email: 'test@example.com',
            message: 'Hi!',
            formId: '123',
            tenant: 'tenant1',
            data: '{}',
        };

        await handleSubmit(req as Request, res as Response, next);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Bot detected.' });
    });

    it('calls sendEmail and returns 200 on valid input', async () => {
        (sendEmail as jest.Mock).mockResolvedValueOnce(true);

        req.body = {
            website: '',
            name: 'Valid Name',
            email: 'valid@example.com',
            message: 'Test message',
            formId: 'form1',
            tenant: 'tenantX',
            data: '{}',
        };

        await handleSubmit(req as Request, res as Response, next);

        expect(sendEmail).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Form submitted' });
    });

    it('returns 400 if input is invalid', async () => {
        req.body = {
            website: '',
            name: '',
            email: 'not-an-email',
            formId: '',
            tenant: '',
            data: '{}',
        };

        await handleSubmit(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Invalid request data',
                details: expect.any(Array),
            })
        );
    });

    it('returns 500 if sendEmail throws', async () => {
        (sendEmail as jest.Mock).mockRejectedValue(new Error('Email fail'));

        req.body = {
            website: '',
            name: 'Fail Name',
            email: 'fail@example.com',
            message: 'This will fail',
            formId: 'failForm',
            tenant: 'failTenant',
            data: '{}',
        };

        await handleSubmit(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to send email' });
    });
});