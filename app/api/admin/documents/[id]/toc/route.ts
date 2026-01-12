/**
 * Document TOC API
 * GET: Get extracted table of contents
 * PUT: Update/Edit table of contents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================
// GET - Get extracted TOC
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
        extractedToc: {
          orderBy: { order: 'asc' },
          where: { parentId: null },
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

    return NextResponse.json({
      uploadId: id,
      toc: upload.extractedToc,
      detectedTitle: upload.detectedTitle,
      detectedAuthor: upload.detectedAuthor,
    });
  } catch (error) {
    console.error('Failed to get TOC:', error);
    return NextResponse.json(
      { error: 'Failed to get TOC' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Update TOC
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { toc, detectedTitle, detectedAuthor } = body;

    const upload = await prisma.documentUpload.findUnique({
      where: { id },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Update detected info
    if (detectedTitle || detectedAuthor) {
      await prisma.documentUpload.update({
        where: { id },
        data: {
          detectedTitle: detectedTitle || upload.detectedTitle,
          detectedAuthor: detectedAuthor || upload.detectedAuthor,
        },
      });
    }

    // Update TOC items if provided
    if (toc && Array.isArray(toc)) {
      // Delete existing TOC items
      await prisma.extractedTocItem.deleteMany({
        where: { uploadId: id },
      });

      // Create new TOC items
      await createTocItems(id, toc, null);
    }

    // Fetch updated data
    const updated = await prisma.documentUpload.findUnique({
      where: { id },
      include: {
        extractedToc: {
          orderBy: { order: 'asc' },
          where: { parentId: null },
          include: {
            children: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'TOC updated successfully',
      toc: updated?.extractedToc,
    });
  } catch (error) {
    console.error('Failed to update TOC:', error);
    return NextResponse.json(
      { error: 'Failed to update TOC' },
      { status: 500 }
    );
  }
}

// ============================================
// Helper: Create TOC items recursively
// ============================================

async function createTocItems(
  uploadId: string,
  items: any[],
  parentId: string | null
) {
  for (const item of items) {
    const created = await prisma.extractedTocItem.create({
      data: {
        uploadId,
        title: item.title,
        pageNumber: item.pageNumber,
        level: item.level || 1,
        order: item.order,
        parentId,
        extractedContent: item.extractedContent,
        contentStartPage: item.contentStartPage,
        contentEndPage: item.contentEndPage,
      },
    });

    // Create children recursively
    if (item.children && item.children.length > 0) {
      await createTocItems(uploadId, item.children, created.id);
    }
  }
}
