/**
 * Document Upload API - Single Document Operations
 * GET: Get document details
 * DELETE: Delete document and files
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';

// ============================================
// GET - Get document upload details
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        book: {
          select: {
            id: true,
            title: true,
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

    return NextResponse.json(upload);
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
  try {
    const { id } = await params;

    const upload = await prisma.documentUpload.findUnique({
      where: { id },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    try {
      await unlink(upload.storagePath);
    } catch (fileError) {
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
