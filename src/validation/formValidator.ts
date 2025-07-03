import {z} from 'zod';

export const formSchema = z.object({
    tenant: z.string().min(1, 'tenant is required'),
    formId: z.string().min(1, 'Form ID is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().max(100).email('Invalid email address'),
    message: z.string().max(1000).optional(),
    data: z.record(z.any()),
});
