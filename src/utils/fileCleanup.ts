import fs from 'fs/promises';
import {logger} from './logger';

export interface FileToCleanup {
    path: string;
    originalName: string;
}

/**
 * Safely delete uploaded files after email has been sent
 */
export async function cleanupFiles(files: FileToCleanup[]): Promise<void> {
    let successCount = 0;
    let failureCount = 0;

    const cleanupPromises = files.map(async (file) => {
        try {
            // Verify the file exists before attempting to delete
            await fs.access(file.path);

            // Only delete files in the /tmp directory for safety
            if (file.path.startsWith('/tmp/') || file.path.startsWith('./uploads/')) {
                await fs.unlink(file.path);
                logger.debug('File cleaned up successfully', {
                    originalName: file.originalName,
                    path: file.path
                });
                successCount++;
            } else {
                logger.warn('Skipped cleanup for file outside safe directory', {
                    originalName: file.originalName,
                    path: file.path
                });
                failureCount++;
            }
        } catch (error) {
            // Don't throw errors for cleanup failures - just log them
            logger.error('Failed to cleanup file', {
                originalName: file.originalName,
                path: file.path,
                error: error instanceof Error ? error : new Error(String(error))
            });
            failureCount++;
        }
    });

    // Wait for all cleanup operations to complete
    await Promise.allSettled(cleanupPromises);

    // Log summary
    logger.fileCleanup({
        filesCount: files.length,
        successCount,
        failureCount
    });
}

/**
 * Schedule file cleanup with a delay (useful for debugging or if files need to persist briefly)
 */
export function scheduleFileCleanup(files: FileToCleanup[], delayMs: number = 0): void {
    setTimeout(async () => {
        await cleanupFiles(files);
    }, delayMs);
}

/**
 * Get file size and other metadata before cleanup (for logging purposes)
 */
export async function getFileMetadata(filePath: string): Promise<{
    size: number;
    exists: boolean;
    lastModified: Date | null;
}> {
    try {
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            exists: true,
            lastModified: stats.mtime
        };
    } catch (error) {
        return {
            size: 0,
            exists: false,
            lastModified: null
        };
    }
}
