/**
 * File Security Utilities
 * Provides secure file path validation and sanitization
 * Prevents Path Traversal attacks (CWE-22)
 */

import path from 'path';
import crypto from 'crypto';

/**
 * Validates that a file path is within the allowed directory
 * Prevents Path Traversal attacks like "../../etc/passwd"
 *
 * @param filePath - The file path to validate
 * @param allowedDir - The allowed base directory (default: uploads/)
 * @returns The resolved safe path if valid
 * @throws Error if path is outside allowed directory
 */
export function validateFilePath(
  filePath: string,
  allowedDir: string = 'uploads'
): string {
  // Get absolute path to allowed directory
  const allowedDirResolved = path.resolve(process.cwd(), allowedDir);

  // Resolve the file path (handles .., ., etc.)
  const filePathResolved = path.resolve(filePath);

  // Check if the resolved path starts with the allowed directory
  if (!filePathResolved.startsWith(allowedDirResolved)) {
    throw new Error(
      `Security violation: Path "${filePath}" is outside allowed directory "${allowedDir}"`
    );
  }

  return filePathResolved;
}

/**
 * Sanitizes a filename by removing dangerous characters
 * Prevents directory traversal and special characters
 *
 * @param filename - The filename to sanitize
 * @returns A safe filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and parent directory references
  let sanitized = filename.replace(/[\/\\]/g, '');
  sanitized = sanitized.replace(/\.\./g, '');

  // Remove or replace special characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');

  // Limit length to 255 characters
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }

  // Ensure filename is not empty
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = 'file';
  }

  return sanitized;
}

/**
 * Generates a secure random filename
 * Uses crypto.randomBytes for security
 *
 * @param originalFilename - Original filename to extract extension
 * @param prefix - Optional prefix for the filename
 * @returns A secure random filename
 */
export function generateSecureFilename(
  originalFilename: string,
  prefix: string = ''
): string {
  // Extract extension
  const ext = path.extname(originalFilename);

  // Generate random name using crypto
  const randomName = crypto.randomBytes(16).toString('hex');

  // Combine prefix, random name, and extension
  const safeName = prefix
    ? `${sanitizeFilename(prefix)}_${randomName}${ext}`
    : `${randomName}${ext}`;

  return safeName;
}

/**
 * Validates file size
 *
 * @param size - File size in bytes
 * @param maxSizeMB - Maximum allowed size in MB (default: 50MB)
 * @returns true if valid
 * @throws Error if file is too large
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number = 50
): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (size > maxBytes) {
    throw new Error(
      `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`
    );
  }

  return true;
}

/**
 * Checks if a file path exists within the allowed directory
 * Safe wrapper around filesystem operations
 *
 * @param filePath - The file path to check
 * @param allowedDir - The allowed base directory
 * @returns The validated path or null if invalid
 */
export function getSafeFilePath(
  filePath: string,
  allowedDir: string = 'uploads'
): string | null {
  try {
    return validateFilePath(filePath, allowedDir);
  } catch (error) {
    console.error('Path validation failed:', error);
    return null;
  }
}

/**
 * Creates a safe upload path
 * Combines allowed directory with sanitized filename
 *
 * @param filename - The filename
 * @param subdir - Optional subdirectory within uploads
 * @returns Safe full path
 */
export function createSafeUploadPath(
  filename: string,
  subdir: string = ''
): string {
  const sanitized = sanitizeFilename(filename);
  const basePath = path.join('uploads', subdir, sanitized);

  // Validate the resulting path
  return validateFilePath(basePath);
}

/**
 * File type signatures (Magic Bytes)
 * Used for validating actual file content, not just extensions
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  pdf: [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  docx: [
    [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP format used by DOCX)
  ],
  abx: [
    [0x50, 0x4b, 0x03, 0x04], // PK.. (if ABX is ZIP-based)
    [0x3c, 0x3f, 0x78, 0x6d], // <?xml (if ABX is XML-based)
  ],
  zip: [
    [0x50, 0x4b, 0x03, 0x04], // PK..
  ],
};

/**
 * Validates file content by checking magic bytes
 * Prevents attackers from uploading malicious files with fake extensions
 *
 * @param buffer - File content as Buffer or ArrayBuffer
 * @param expectedType - Expected file type (pdf, docx, abx)
 * @returns true if file matches expected type
 * @throws Error if file type doesn't match
 */
export async function validateFileContent(
  buffer: Buffer | ArrayBuffer,
  expectedType: 'pdf' | 'docx' | 'abx'
): Promise<boolean> {
  // Convert ArrayBuffer to Uint8Array if needed
  const bytes = buffer instanceof Buffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer);

  // Get first 4 bytes (most magic numbers are 4 bytes)
  const header = Array.from(bytes.slice(0, 4));

  // Get signatures for expected type
  const signatures = FILE_SIGNATURES[expectedType];
  if (!signatures) {
    throw new Error(`Unknown file type: ${expectedType}`);
  }

  // Check if header matches any of the signatures
  const isValid = signatures.some(signature =>
    signature.every((byte, index) => byte === header[index])
  );

  if (!isValid) {
    const headerHex = header.map(b => b.toString(16).padStart(2, '0')).join(' ');
    logSecurityEvent('invalid_file_content', 'memory', {
      expectedType,
      actualHeader: headerHex,
      reason: 'Magic bytes mismatch - possible file type spoofing'
    });

    throw new Error(
      `File content validation failed: Expected ${expectedType.toUpperCase()} but got different file signature. ` +
      `This could indicate a file type spoofing attempt.`
    );
  }

  return true;
}

/**
 * Validates file by both extension and content (magic bytes)
 * Double validation for maximum security
 *
 * @param file - The File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param allowedExtensions - Array of allowed file extensions
 * @returns Object with validation results
 */
export async function validateFileTypeAndContent(
  file: File,
  allowedTypes: string[] = [],
  allowedExtensions: string[] = []
): Promise<{
  isValid: boolean;
  fileType: 'pdf' | 'docx' | 'abx' | null;
  error?: string;
}> {
  try {
    // Step 1: Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        fileType: null,
        error: `File extension ${fileExtension} is not allowed. Allowed: ${allowedExtensions.join(', ')}`
      };
    }

    // Step 2: Check MIME type (client-provided, can be spoofed)
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      // Don't reject immediately - MIME type can be wrong, check magic bytes
      console.warn(`MIME type mismatch: ${file.type} for ${fileExtension}`);
    }

    // Step 3: Validate file content (magic bytes) - THE CRITICAL CHECK
    const buffer = await file.arrayBuffer();
    let fileType: 'pdf' | 'docx' | 'abx' | null = null;

    if (fileExtension === '.pdf') {
      await validateFileContent(buffer, 'pdf');
      fileType = 'pdf';
    } else if (fileExtension === '.docx') {
      await validateFileContent(buffer, 'docx');
      fileType = 'docx';
    } else if (fileExtension === '.abx') {
      await validateFileContent(buffer, 'abx');
      fileType = 'abx';
    }

    return {
      isValid: true,
      fileType,
    };
  } catch (error) {
    logSecurityEvent('file_validation_failed', file.name, {
      size: file.size,
      type: file.type,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      isValid: false,
      fileType: null,
      error: error instanceof Error ? error.message : 'File validation failed'
    };
  }
}

/**
 * Detects actual file type from content (magic bytes)
 * Useful for identifying what a file really is
 *
 * @param buffer - File content as Buffer or ArrayBuffer
 * @returns Detected file type or 'unknown'
 */
export function detectFileType(buffer: Buffer | ArrayBuffer): string {
  const bytes = buffer instanceof Buffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer);

  const header = Array.from(bytes.slice(0, 4));

  // Check against all known signatures
  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (signature.every((byte, index) => byte === header[index])) {
        return type;
      }
    }
  }

  return 'unknown';
}

/**
 * Security logging for suspicious file operations
 *
 * @param action - The action being performed
 * @param filePath - The file path involved
 * @param details - Additional details
 */
export function logSecurityEvent(
  action: 'path_validation_failed' | 'file_deleted' | 'file_uploaded' | 'suspicious_filename' | 'invalid_file_content' | 'file_validation_failed',
  filePath: string,
  details?: Record<string, any>
): void {
  const event = {
    timestamp: new Date().toISOString(),
    action,
    filePath,
    ...details
  };

  console.warn('[SECURITY]', JSON.stringify(event));

  // In production, you would send this to a security monitoring service
  // e.g., Sentry, CloudWatch, etc.
}
