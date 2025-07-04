export interface EmailOptions {
    fromName: string;
    fromEmail: string;
    message: string;
    data?: Record<string, any>;
    attachments?: { path: string; originalName: string }[];
    formId?: string;
    tenant?: string;
}
