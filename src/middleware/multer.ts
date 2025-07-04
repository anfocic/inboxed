import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { config } from '../utils/env';
import { logger } from '../utils/logger';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || '/tmp';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = crypto.randomBytes(16).toString('hex') + ext;
        cb(null, name);
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (config.fileUpload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        logger.securityEvent('invalid_file_type', {
            filename: file.originalname,
            mimetype: file.mimetype,
            allowedTypes: config.fileUpload.allowedTypes,
            ip: req.ip || req.connection?.remoteAddress || 'unknown'
        });

        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${config.fileUpload.allowedTypes.join(', ')}`));
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: config.fileUpload.maxFileSize,
        files: config.fileUpload.maxFiles
    },
    fileFilter,
});