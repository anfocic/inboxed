import sanitizeHtml from 'sanitize-html';
import sanitizeFilename from 'sanitize-filename';

export function sanitizeText(text: string): string {
    const sanitized = sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {},
    }).trim();

    return sanitized
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export function sanitizeImages(images: Express.Multer.File[]): { path: string; originalName: string }[] {
    return images.map(img => ({
        path: img.path,
        originalName: sanitizeFilename(img.originalname)
    }));
}