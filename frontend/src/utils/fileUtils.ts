import { API_BASE_URL } from '../services/api';

/**
 * Resolves full file/image URL for backend uploads or remote assets cleanly in dev and production
 */
export function getFileUrl(pathStr?: string | null): string {
  if (!pathStr) return '';
  if (
    pathStr.startsWith('http://') ||
    pathStr.startsWith('https://') ||
    pathStr.startsWith('blob:') ||
    pathStr.startsWith('data:')
  ) {
    return pathStr;
  }

  const backendHost = API_BASE_URL.replace('/api/v1', '').replace(/\/$/, '');
  const cleanPath = pathStr.startsWith('/') ? pathStr : `/${pathStr}`;
  return `${backendHost}${cleanPath}`;
}

/**
 * Validates image files for JPG, JPEG, PNG, WEBP and size limits (default 15MB)
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = 15 * 1024 * 1024
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid image format. Only JPG, JPEG, PNG, and WEBP files are allowed.',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds the ${sizeMb} MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Safe Object URL creation wrapper
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Safe Object URL revocation helper to prevent browser memory leaks
 */
export function revokePreviewUrl(url?: string | null): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore if already revoked
    }
  }
}
