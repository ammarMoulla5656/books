/**
 * Document Processing API
 * POST: Upload a new document
 * GET: List all uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DocumentType } from '@prisma/client';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { pythonService } from '@/lib/python-service';
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
import { validateFilePath, logSecurityEvent } from '@/lib/file-utils';
import {
  validateUploadedFile,
  logFileSecurityEvent,
  scanForViruses
} from '@/lib/file-validation';

// ============================================
// GET - List all document uploads
// ============================================

export async function GET(request: NextRequest) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents (GET)', request);
    return authCheck.error;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = status ? { status: status as any } : {};

    const [uploads, total] = await Promise.all([
      prisma.documentUpload.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.documentUpload.count({ where }),
    ]);

    return NextResponse.json({
      uploads,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Upload a new document
// ============================================

export async function POST(request: NextRequest) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents (POST)', request);
    return authCheck.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionsStr = formData.get('options') as string;
    const options = optionsStr ? JSON.parse(optionsStr) : {};

    if (!file) {
      logFileSecurityEvent('upload_attempt', {
        error: 'No file provided',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 🔒 COMPREHENSIVE SECURITY VALIDATION
    // This performs ALL security checks:
    // 1. Magic bytes verification (prevents file type spoofing)
    // 2. File extension validation
    // 3. MIME type validation
    // 4. File size validation (50MB max)
    // 5. Filename sanitization
    console.log('🔒 Starting comprehensive file validation...');
    const validation = await validateUploadedFile(file);

    if (!validation.valid) {
      // Log security event for failed validation
      logFileSecurityEvent('validation_failed', {
        filename: file.name,
        size: file.size,
        type: file.type,
        errors: validation.errors,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      console.error('❌ File validation failed:', validation.errors);

      return NextResponse.json(
        {
          error: 'File validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('⚠️ File validation warnings:', validation.warnings);
    }

    console.log('✅ File validation passed:', validation.fileInfo);

    // Use the secure filename from validation
    const secureFilename = validation.fileInfo!.secureName;
    const fileExt = validation.fileInfo!.extension;

    // 🔒 SECURITY: Create safe upload path within allowed directory
    const uploadDir = join(process.cwd(), 'uploads', 'documents');
    const filePath = join(uploadDir, secureFilename);

    // Double-check path is safe (defense in depth)
    try {
      validateFilePath(filePath, 'uploads');
    } catch (pathError) {
      logFileSecurityEvent('suspicious_file', {
        originalName: file.name,
        generatedPath: filePath,
        error: pathError,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      console.error('⚠️ SECURITY ALERT: Invalid path detected!', {
        originalName: file.name,
        generatedPath: filePath,
        error: pathError
      });

      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 🔒 SECURITY: Scan for viruses (placeholder for now)
    const virusScan = await scanForViruses(filePath);
    if (!virusScan.clean) {
      // Delete the file immediately
      await unlink(filePath).catch(() => {});

      logFileSecurityEvent('file_rejected', {
        filename: secureFilename,
        reason: 'Virus detected',
        threat: virusScan.threat,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });

      console.error('🚨 SECURITY ALERT: Virus detected in uploaded file!', virusScan);

      return NextResponse.json(
        { error: 'File rejected: Security threat detected' },
        { status: 400 }
      );
    }

    // Log successful upload
    logSecurityEvent('file_uploaded', filePath, {
      originalName: file.name,
      secureName: secureFilename,
      size: file.size,
      type: file.type,
      detectedType: validation.fileInfo!.detectedType
    });

    logFileSecurityEvent('upload_attempt', {
      filename: secureFilename,
      originalName: file.name,
      size: file.size,
      detectedType: validation.fileInfo!.detectedType,
      success: true,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Determine file type
    let fileType: DocumentType = 'PDF';
    if (fileExt === 'pdf') fileType = 'PDF';
    else if (fileExt === 'docx') fileType = 'DOCX';
    else if (fileExt === 'abx') fileType = 'ABX' as DocumentType;

    // Create database record
    const upload = await prisma.documentUpload.create({
      data: {
        filename: secureFilename,
        originalName: file.name,
        fileType,
        fileSize: file.size,
        storagePath: filePath,
        status: 'PENDING',
        useOcr: options.useOcr ?? false,
        useAiParsing: options.useAiParsing ?? true,
        aiProvider: options.aiProvider ?? 'local',
      },
    });

    // Log upload step
    await prisma.processingLog.create({
      data: {
        uploadId: upload.id,
        step: 'UPLOAD',
        status: 'COMPLETED',
        message: `File uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      },
    });

    // Start processing in background
    try {
      await pythonService.processDocument(upload.id, filePath, {
        useOcr: options.useOcr,
        useAiParsing: options.useAiParsing,
        aiProvider: options.aiProvider,
        ocrProvider: options.ocrProvider,
      });
    } catch (pythonError) {
      console.error('Failed to start Python processing:', pythonError);
      // Update status to indicate Python service issue
      await prisma.documentUpload.update({
        where: { id: upload.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Failed to connect to processing service. Please ensure Python service is running.',
        },
      });
    }

    return NextResponse.json({
      uploadId: upload.id,
      status: upload.status,
      message: 'Upload successful, processing started',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
