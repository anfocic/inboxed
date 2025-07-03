"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSchema = void 0;
const zod_1 = require("zod");
exports.formSchema = zod_1.z.object({
    tenant: zod_1.z.string().min(1, 'tenant is required'),
    formId: zod_1.z.string().min(1, 'Form ID is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().max(100).email('Invalid email address'),
    message: zod_1.z.string().max(1000).optional(),
    data: zod_1.z.record(zod_1.z.any()),
});
