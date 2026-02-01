/**
 * 🔒 File Validation Library
 *
 * Comprehensive file validation including:
 * - Magic bytes verification (prevents file type spoofing)
 * - MIME type validation
 * - File extension validation
 * - File size validation
 * - Filename sanitization
 *
 * SECURITY: Never trust client-provided MIME types or extensions alone!
 * Always verify the actual file content using magic bytes.
 */

// ============================================
// Magic Bytes Signatures
// ============================================

interface MagicBytesSignature {
  bytes: number[];
  offset?: number; // Default is 0
  description: string;
}

/**
 * Known file type signatures (magic bytes)
 * These are the actual byte sequences at the start of files
 */
const FILE_SIGNATURES: Record<string, MagicBytesSignature[]> = {
  pdf: [
    {
      bytes: [0x25, 0x50, 0x44, 0x46], // %PDF
      description: 'PDF Document'
    }
  ],

  // DOCX files are ZIP archives with specific structure
  docx: [
    {
      bytes: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP header)
      description: 'Office Open XML (DOCX/XLSX/etc)'
    }
  ],

  // ABX can be either ZIP-based or plain text XML
  abx: [
    {
      bytes: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP-based ABX)
      description: 'ABX Archive (ZIP)'
    },
    {
      bytes: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], // <?xml
      description: 'ABX XML Document'
    },
    {
      bytes: [0xef, 0xbb, 0xbf, 0x3c, 0x3f, 0x78, 0x6d, 0x6c], // BOM + <?xml
      description: 'ABX XML with UTF-8 BOM'
    },
    {
      // ABX files from Ahlulbayt Library start with "abl" signature
      bytes: [0x61, 0x62, 0x6c], // abl
      description: 'ABX Library Format (Ahlulbayt Library)'
    },
    {
      bytes: [0x3c], // < (generic XML/HTML start)
      description: 'ABX XML/Text Format'
    }
  ]
};

// ============================================
// Allowed MIME Types
// ============================================

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-abx',
  'application/zip', // ABX can be ZIP
  'text/xml', // ABX can be XML
  'application/xml' // ABX can be XML
];

// ============================================
// File Size Limits (in MB)
// ============================================

const FILE_SIZE_LIMITS = {
  pdf: 50,
  docx: 50,
  abx: 50,
  default: 50
};

// ============================================
// Magic Bytes Validation
// ============================================

/**
 * Read the first N bytes from a File object
 */
async function readFileHeader(file: File, bytesToRead: number = 16): Promise<Uint8Array> {
  const slice = file.slice(0, bytesToRead);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes: Uint8Array, signature: MagicBytesSignature): boolean {
  const offset = signature.offset || 0;

  for (let i = 0; i < signature.bytes.length; i++) {
    if (bytes[offset + i] !== signature.bytes[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 🔒 SECURITY: Validate file content by checking magic bytes
 *
 * This prevents attackers from uploading malicious files by:
 * - Renaming a .exe to .pdf (extension spoofing)
 * - Changing MIME type in the browser (MIME type spoofing)
 *
 * We check the ACTUAL file content, not what the client claims it is.
 */
export async function validateFileContent(file: File): Promise<{
  valid: boolean;
  detectedType?: string;
  error?: string;
}> {
  try {
    // Read first 16 bytes (enough for most signatures)
    const header = await readFileHeader(file, 16);

    // Try to detect file type from magic bytes
    for (const [fileType, signatures] of Object.entries(FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (matchesSignature(header, signature)) {
          return {
            valid: true,
            detectedType: fileType
          };
        }
      }
    }

    // No matching signature found
    return {
      valid: false,
      error: 'File content does not match any allowed file type. The file may be corrupted or is not a valid PDF, DOCX, or ABX file.'
    };

  } catch (error) {
    console.error('Error validating file content:', error);
    return {
      valid: false,
      error: 'Failed to read file content for validation'
    };
  }
}


/**
 * Validate ABX text content (non-XML, non-ZIP)
 */
async function validateAbxTextContent(file: File): Promise<boolean> {
  try {
    const header = await readFileHeader(file, 32768); // Read more bytes for better detection
    let text = '';

    if (typeof TextDecoder !== 'undefined') {
      text = new TextDecoder('utf-8', { fatal: false }).decode(header);
    } else {
      text = Buffer.from(header).toString('utf-8');
    }

    // Check for ABX signature patterns
    const signaturePatterns = [
      /^abl\d{3}/i, // ABX Library format (e.g., abl001)
      /<\s*هوية\s*الكتاب/i, // Book identity tag
      /<\s*صفحة\s*>/i, // Page tag
      /<\s*ملحق\s*=/i, // Attachment tag
      /<\s*الكتاب\s*>/i, // Book tag
      /<\s*اسم\s*الكتاب\s*>/i, // Book name tag
      /<\s*اسم\s*المؤلف\s*>/i, // Author tag
    ];

    // Check if at least one pattern matches
    const hasAbxPattern = signaturePatterns.some((pattern) => pattern.test(text));

    if (hasAbxPattern) {
      console.log('✅ ABX content validated: Found ABX-specific tags');
      return true;
    }

    // Additional check: look for multiple XML tags
    const xmlTagCount = (text.match(/<[^>]+>/g) || []).length;
    if (xmlTagCount > 5) {
      console.log('✅ ABX content validated: Found multiple XML tags');
      return true;
    }

    console.log('⚠️ ABX content validation: No ABX patterns found');
    return false;

  } catch (error) {
    console.error('Error validating ABX text content:', error);
    return false;
  }
}


// ============================================
// MIME Type Validation
// ============================================

/**
 * Validate MIME type (as a secondary check)
 */
export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

// ============================================
// File Extension Validation
// ============================================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): {
  valid: boolean;
  extension?: string;
  error?: string;
} {
  const extension = getFileExtension(filename);
  const allowedExtensions = ['pdf', 'docx', 'abx'];

  if (!extension) {
    return {
      valid: false,
      error: 'File must have an extension'
    };
  }

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension .${extension}. Only PDF, DOCX, and ABX files are allowed.`
    };
  }

  return {
    valid: true,
    extension
  };
}

// ============================================
// File Size Validation
// ============================================

/**
 * 🔒 SECURITY: Validate file size to prevent DoS attacks
 *
 * Reduced limit from 100MB to 50MB to prevent:
 * - Server memory exhaustion
 * - Storage abuse
 * - Processing timeouts
 */
export function validateFileSizeLimit(fileSize: number, fileType?: string): {
  valid: boolean;
  maxSize?: number;
  error?: string;
} {
  const maxSizeMB = fileType && FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS]
    ? FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS]
    : FILE_SIZE_LIMITS.default;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      maxSize: maxSizeMB,
      error: `File size (${(fileSize / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of ${maxSizeMB} MB`
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes)'
    };
  }

  return {
    valid: true,
    maxSize: maxSizeMB
  };
}

// ============================================
// Filename Sanitization
// ============================================

/**
 * 🔒 SECURITY: Sanitize filename to prevent:
 * - Path traversal attacks (../, ..\)
 * - Command injection (special characters)
 * - Unicode attacks (right-to-left override, etc)
 * - Null byte injection (%00)
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');

  // Remove special characters (keep only alphanumeric, dots, dashes, underscores)
  sanitized = sanitized.replace(/[^a-zA-Z0-9._\-\u0600-\u06FF]/g, '_');

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

  // Limit length to 255 characters (filesystem limit)
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 250 - (extension?.length || 0)) + '.' + extension;
  }

  // If sanitization resulted in empty string, use fallback
  if (!sanitized || sanitized === '.') {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

/**
 * Generate a secure unique filename
 * Format: timestamp_randomId_sanitizedOriginalName
 */
export function generateSecureFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);

  // Extract extension
  const extension = getFileExtension(sanitized);
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));

  // Create secure filename
  return `${timestamp}_${randomId}_${nameWithoutExt}.${extension}`;
}

// ============================================
// Comprehensive File Validation
// ============================================

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    detectedType: string;
    extension: string;
    size: number;
    sanitizedName: string;
    secureName: string;
  };
}

/**
 * 🔒 COMPREHENSIVE FILE VALIDATION
 *
 * Performs ALL security checks:
 * 1. Magic bytes verification (prevents spoofing)
 * 2. File extension validation
 * 3. MIME type validation (secondary check)
 * 4. File size validation
 * 5. Filename sanitization
 *
 * This is the main function to use for file uploads.
 */
export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate file extension
  const extResult = validateFileExtension(file.name);
  if (!extResult.valid) {
    errors.push(extResult.error!);
    return { valid: false, errors, warnings };
  }

  // 2. Validate file size
  const sizeResult = validateFileSizeLimit(file.size, extResult.extension);
  if (!sizeResult.valid) {
    errors.push(sizeResult.error!);
    return { valid: false, errors, warnings };
  }

  // 3. Validate MIME type (warning only, not blocking)
  if (!validateMimeType(file.type)) {
    warnings.push(`MIME type '${file.type}' is not in the standard allowed list, but will proceed with magic bytes check`);
  }

  // 4. ?Y"' CRITICAL: Validate actual file content (magic bytes)
  let contentResult = { valid: false } as { valid: boolean; detectedType?: string; error?: string };
  if (extResult.extension === 'abx') {
    const abxTextOk = await validateAbxTextContent(file);
    if (abxTextOk) {
      contentResult = { valid: true, detectedType: 'abx' };
    } else {
      contentResult = await validateFileContent(file);
    }
  } else {
    contentResult = await validateFileContent(file);
  }

  if (!contentResult.valid) {
    errors.push(contentResult.error!);
    errors.push('?s???? SECURITY: File content validation failed. This may be an attempt to upload a malicious file.');
    return { valid: false, errors, warnings };
  }

  // 5. Check if detected type matches extension
  if (contentResult.detectedType !== extResult.extension) {
    // Special case: DOCX is detected as ZIP (which is correct)
    // ABX can also be ZIP or XML
    if (!(
      (extResult.extension === 'docx' && contentResult.detectedType === 'docx') ||
      (extResult.extension === 'abx' && (contentResult.detectedType === 'abx' || contentResult.detectedType === 'docx'))
    )) {
      errors.push(`File extension (.${extResult.extension}) does not match detected file type (${contentResult.detectedType})`);
      errors.push('⚠️ SECURITY: Possible file type spoofing detected.');
      return { valid: false, errors, warnings };
    }
  }

  // 6. Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  const secureName = generateSecureFilename(file.name);

  if (sanitizedName !== file.name) {
    warnings.push(`Filename was sanitized from '${file.name}' to '${sanitizedName}'`);
  }

  // All checks passed
  return {
    valid: true,
    errors: [],
    warnings,
    fileInfo: {
      detectedType: contentResult.detectedType!,
      extension: extResult.extension!,
      size: file.size,
      sanitizedName,
      secureName
    }
  };
}

// ============================================
// Virus Scanning Placeholder
// ============================================

/**
 * 🔒 FUTURE: Integrate with ClamAV or similar antivirus
 *
 * This is a placeholder for virus scanning functionality.
 * In production, you should integrate with an antivirus service.
 */
export async function scanForViruses(filePath: string): Promise<{
  clean: boolean;
  threat?: string;
}> {
  // TODO: Integrate with ClamAV
  // Example: const result = await clamav.scanFile(filePath);

  console.log('⚠️ Virus scanning not yet implemented. Consider integrating ClamAV.');

  return {
    clean: true // Always returns clean until implemented
  };
}

// ============================================
// Security Event Logging
// ============================================

/**
 * Log security-related file events
 */
export function logFileSecurityEvent(
  event: 'upload_attempt' | 'validation_failed' | 'suspicious_file' | 'file_rejected',
  details: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };

  // In production, send to security monitoring system
  console.log('🔒 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));

  // TODO: Send to security monitoring (e.g., Datadog, Sentry, CloudWatch)
}
