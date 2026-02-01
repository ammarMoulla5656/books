/**
 * Document Upload API - Single Document Operations
 * GET: Get document details
 * DELETE: Delete document and files
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { validateFilePath, logSecurityEvent } from '@/lib/file-utils';
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';

// ============================================
// GET - Get document upload details
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id] (GET)', request);
    return authCheck.error;
  }

  try {
    const { id } = await params;

    const upload = await prisma.documentUpload.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'asc' },
        },
        extractedToc: {
          orderBy: { order: 'asc' },
          where: { parentId: null }, // Only top-level items
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    const book = upload.bookId
      ? await prisma.book.findUnique({
          where: { id: upload.bookId },
          select: { id: true, title: true },
        })
      : null;

    return NextResponse.json({
      ...upload,
      book,
    });
  } catch (error) {
    console.error('Failed to fetch upload:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete document upload
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id] (DELETE)', request);
    return authCheck.error;
  }

  try {
    const { id} = await params;

    const upload = await prisma.documentUpload.findUnique({
      where: { id },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Delete file from storage with path validation
    try {
      // 🔒 Security: Validate that the file path is within uploads directory
      // Prevents Path Traversal attacks (CWE-22)
      const safePath = validateFilePath(upload.storagePath, 'uploads');

      // Log security event
      logSecurityEvent('file_deleted', safePath, {
        uploadId: id,
        originalPath: upload.storagePath
      });

      await unlink(safePath);
    } catch (fileError) {
      // Check if it's a security error or file system error
      if (fileError instanceof Error && fileError.message.includes('Security violation')) {
        console.error('⚠️ SECURITY ALERT: Path traversal attempt detected!', {
          uploadId: id,
          attemptedPath: upload.storagePath,
          error: fileError.message
        });

        return NextResponse.json(
          { error: 'Invalid file path detected' },
          { status: 400 }
        );
      }

      console.warn('Failed to delete file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database (cascades to logs and toc items)
    await prisma.documentUpload.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Upload deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}
