import path from 'path';
import fs from 'fs';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

export interface StoredFile {
  filename: string;
  url: string;
  path: string;
}

export function validateUploadedFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }
  const mime = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  if (!ALLOWED_MIME_TYPES.includes(mime) && !allowedExts.includes(ext)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WEBP images and PDF files are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum limit of 15MB.' };
  }
  return { valid: true };
}

export async function processFileStorage(file: Express.Multer.File): Promise<StoredFile> {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = file.filename || `${file.fieldname || 'attachment'}-${Date.now()}${path.extname(file.originalname)}`;
  const filePath = file.path || path.join(uploadsDir, filename);

  if (file.buffer && !fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.buffer);
  }

  const relativeUrl = `/uploads/${path.basename(filePath)}`;
  return {
    filename: path.basename(filePath),
    url: relativeUrl,
    path: filePath,
  };
}

