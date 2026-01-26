/**
 * Path Traversal Security Tests
 * Tests the file path validation to prevent Path Traversal attacks (CWE-22)
 */

import {
  validateFilePath,
  sanitizeFilename,
  generateSecureFilename,
  validateFileSize,
  getSafeFilePath
} from '@/lib/file-utils';
import path from 'path';

describe('Path Traversal Security Tests', () => {
  describe('validateFilePath', () => {
    it('should allow valid paths within uploads directory', () => {
      const validPath = path.join(process.cwd(), 'uploads', 'test.pdf');
      expect(() => validateFilePath(validPath, 'uploads')).not.toThrow();
    });

    it('should block path traversal with ../', () => {
      const maliciousPath = path.join(process.cwd(), 'uploads', '..', '..', 'etc', 'passwd');
      expect(() => validateFilePath(maliciousPath, 'uploads')).toThrow('Security violation');
    });

    it('should block absolute paths outside uploads', () => {
      const maliciousPath = '/etc/passwd';
      expect(() => validateFilePath(maliciousPath, 'uploads')).toThrow('Security violation');
    });

    it('should block Windows path traversal', () => {
      const maliciousPath = path.join(process.cwd(), 'uploads', '..\\..\\windows\\system32\\config\\sam');
      expect(() => validateFilePath(maliciousPath, 'uploads')).toThrow('Security violation');
    });

    it('should block encoded path traversal', () => {
      // Even after decoding, this should be caught
      const maliciousPath = path.join(process.cwd(), 'uploads', '..%2F..%2Fetc%2Fpasswd');
      expect(() => validateFilePath(maliciousPath, 'uploads')).toThrow();
    });

    it('should allow nested directories within uploads', () => {
      const validPath = path.join(process.cwd(), 'uploads', 'documents', 'test.pdf');
      expect(() => validateFilePath(validPath, 'uploads')).not.toThrow();
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      expect(sanitizeFilename('../../etc/passwd')).not.toContain('/');
      expect(sanitizeFilename('..\\..\\windows\\system32')).not.toContain('\\');
    });

    it('should remove parent directory references', () => {
      const sanitized = sanitizeFilename('../../../malicious.pdf');
      expect(sanitized).not.toContain('..');
    });

    it('should remove special characters', () => {
      const filename = 'file<>:"|?*.pdf';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe('file.pdf');
    });

    it('should preserve valid filenames', () => {
      const filename = 'valid-file_name.pdf';
      expect(sanitizeFilename(filename)).toBe(filename);
    });

    it('should handle empty or invalid filenames', () => {
      expect(sanitizeFilename('')).toBe('file');
      expect(sanitizeFilename('.')).toBe('file');
      expect(sanitizeFilename('..')).toBe('file');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });

    it('should handle Arabic filenames', () => {
      const arabicName = 'كتاب_الفقه.pdf';
      const sanitized = sanitizeFilename(arabicName);
      expect(sanitized).toContain('.pdf');
    });
  });

  describe('generateSecureFilename', () => {
    it('should generate random filenames', () => {
      const filename1 = generateSecureFilename('test.pdf');
      const filename2 = generateSecureFilename('test.pdf');
      expect(filename1).not.toBe(filename2);
    });

    it('should preserve file extension', () => {
      const filename = generateSecureFilename('test.pdf');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should handle malicious original filenames', () => {
      const filename = generateSecureFilename('../../etc/passwd.pdf');
      expect(filename).toMatch(/\.pdf$/);
      expect(filename).not.toContain('..');
      expect(filename).not.toContain('/');
    });

    it('should include prefix if provided', () => {
      const filename = generateSecureFilename('test.pdf', 'upload');
      expect(filename).toMatch(/^upload_[a-f0-9]+\.pdf$/);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files under limit', () => {
      const size = 10 * 1024 * 1024; // 10MB
      expect(() => validateFileSize(size, 50)).not.toThrow();
    });

    it('should reject files over limit', () => {
      const size = 100 * 1024 * 1024; // 100MB
      expect(() => validateFileSize(size, 50)).toThrow('exceeds maximum allowed size');
    });

    it('should use default 50MB limit', () => {
      const size = 60 * 1024 * 1024; // 60MB
      expect(() => validateFileSize(size)).toThrow();
    });

    it('should accept files exactly at limit', () => {
      const size = 50 * 1024 * 1024; // 50MB exactly
      expect(() => validateFileSize(size, 50)).not.toThrow();
    });
  });

  describe('getSafeFilePath', () => {
    it('should return validated path for safe paths', () => {
      const validPath = path.join(process.cwd(), 'uploads', 'test.pdf');
      const result = getSafeFilePath(validPath, 'uploads');
      expect(result).toBe(path.resolve(validPath));
    });

    it('should return null for malicious paths', () => {
      const maliciousPath = '../../etc/passwd';
      const result = getSafeFilePath(maliciousPath, 'uploads');
      expect(result).toBeNull();
    });

    it('should not throw errors for invalid paths', () => {
      const maliciousPath = '/etc/passwd';
      expect(() => getSafeFilePath(maliciousPath, 'uploads')).not.toThrow();
    });
  });
});

describe('Real-world Attack Scenarios', () => {
  it('should block null byte injection', () => {
    const filename = 'test.pdf\x00.txt';
    const sanitized = sanitizeFilename(filename);
    expect(sanitized).not.toContain('\x00');
  });

  it('should block double encoding', () => {
    const path1 = 'uploads/%252e%252e%252f%252e%252e%252fetc%252fpasswd';
    const sanitized = sanitizeFilename(path1);
    expect(sanitized).not.toContain('..');
  });

  it('should block Unicode path traversal', () => {
    // Unicode variants of ../
    const filename = '\u002e\u002e\u002f\u002e\u002e\u002ftest.pdf';
    const sanitized = sanitizeFilename(filename);
    expect(sanitized).not.toContain('..');
  });

  it('should handle mixed separators', () => {
    const filename = '..\\/../\\../etc/passwd';
    const sanitized = sanitizeFilename(filename);
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('\\');
  });

  it('should prevent overwriting system files via database', () => {
    // Simulating attacker modifying storagePath in database
    const attackPath = '../../etc/passwd';
    expect(() => validateFilePath(attackPath, 'uploads')).toThrow('Security violation');
  });

  it('should prevent reading sensitive files', () => {
    const sensitiveFiles = [
      '/etc/passwd',
      '/etc/shadow',
      'C:\\Windows\\System32\\config\\SAM',
      '../../.env',
      '../../../package.json'
    ];

    sensitiveFiles.forEach(file => {
      expect(() => validateFilePath(file, 'uploads')).toThrow('Security violation');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete upload flow safely', () => {
    const userFilename = '../../malicious.pdf';

    // Step 1: Sanitize
    const sanitized = sanitizeFilename(userFilename);
    expect(sanitized).not.toContain('..');

    // Step 2: Generate secure name
    const secureName = generateSecureFilename(userFilename);
    expect(secureName).toMatch(/^[a-f0-9]+\.pdf$/);

    // Step 3: Create path
    const uploadPath = path.join(process.cwd(), 'uploads', 'documents', secureName);

    // Step 4: Validate
    expect(() => validateFilePath(uploadPath, 'uploads')).not.toThrow();
  });

  it('should handle complete delete flow safely', () => {
    // Simulating database with malicious path
    const storagePath = '../../etc/passwd';

    // This should throw before attempting to delete
    expect(() => validateFilePath(storagePath, 'uploads')).toThrow('Security violation');
  });
});
