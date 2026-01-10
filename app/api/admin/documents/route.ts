/**
 * Document Processing API
 * POST: Upload a new document
 * GET: List all uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pythonService } from '@/lib/python-service';

// ============================================
// GET - List all document uploads
// ============================================

export async function GET(request: NextRequest) {
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
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionsStr = formData.get('options') as string;
    const options = optionsStr ? JSON.parse(optionsStr) : {};

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const filename = `${uuidv4()}.${fileExt}`;
    const uploadDir = join(process.cwd(), 'uploads', 'documents');
    const filePath = join(uploadDir, filename);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determine file type
    const fileType = fileExt === 'pdf' ? 'PDF' : 'DOCX';

    // Create database record
    const upload = await prisma.documentUpload.create({
      data: {
        filename,
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
