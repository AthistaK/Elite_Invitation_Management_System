import path from 'path';
import fs from 'fs';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface StoredFile {
  filename: string;
  url: string;
  path: string;
}

export function validateUploadedFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WEBP images and PDF files are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum limit of 10MB.' };
  }
  return { valid: true };
}

export async function processFileStorage(file: Express.Multer.File): Promise<StoredFile> {
  const isCloudStorageEnabled = process.env.STORAGE_DRIVER === 's3' && process.env.S3_BUCKET;

  if (isCloudStorageEnabled) {
    // S3 Cloud Storage Integration Hook (for production deployment)
    const cloudUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/uploads/${file.filename}`;
    return {
      filename: file.filename,
      url: cloudUrl,
      path: cloudUrl,
    };
  }

  // Local filesystem storage for development and standard server environments
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const relativeUrl = `/uploads/${file.filename}`;
  return {
    filename: file.filename,
    url: relativeUrl,
    path: path.join(uploadsDir, file.filename),
  };
}
