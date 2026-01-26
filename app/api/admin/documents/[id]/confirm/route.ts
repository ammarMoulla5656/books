/**
 * Confirm Document Processing API
 * POST: Create book from processed document
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pythonService } from '@/lib/python-service';
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/confirm', request);
    return authCheck.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { categoryId, title, author } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Get upload with TOC
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

    if (upload.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Processing not completed yet' },
        { status: 400 }
      );
    }

    if (upload.bookId) {
      return NextResponse.json(
        { error: 'Book already created from this upload' },
        { status: 400 }
      );
    }

    // Get processing result from Python service
    let processingResult = null;
    try {
      const status = await pythonService.getStatus(id);
      processingResult = status.result;
    } catch (e) {
      console.warn('Could not get processing result from Python:', e);
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title: title || upload.detectedTitle || upload.originalName.replace(/\.[^/.]+$/, ''),
        author: author || upload.detectedAuthor,
        categoryId,
        pageCount: upload.pageCount,
      },
    });

    // Create chapters and sections from TOC
    await createChaptersFromToc(book.id, upload.extractedToc, processingResult?.chapters);

    // Update upload with book reference
    await prisma.documentUpload.update({
      where: { id },
      data: { bookId: book.id },
    });

    // Log completion
    await prisma.processingLog.create({
      data: {
        uploadId: id,
        step: 'DB_SAVE',
        status: 'COMPLETED',
        message: `Book created: ${book.title} (ID: ${book.id})`,
      },
    });

    return NextResponse.json({
      message: 'Book created successfully',
      bookId: book.id,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
    });
  } catch (error) {
    console.error('Failed to confirm and create book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}

// ============================================
// Helper: Create chapters and sections from TOC
// ============================================

async function createChaptersFromToc(
  bookId: string,
  tocItems: any[],
  chaptersContent?: any[]
) {
  for (let i = 0; i < tocItems.length; i++) {
    const tocItem = tocItems[i];
    const chapterContent = chaptersContent?.[i];

    // Create chapter
    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        title: tocItem.title,
        order: tocItem.order || i + 1,
      },
    });

    // Create sections from children or from content
    if (tocItem.children && tocItem.children.length > 0) {
      // Create sections from TOC children
      for (let j = 0; j < tocItem.children.length; j++) {
        const child = tocItem.children[j];
        const sectionContent = chapterContent?.sections?.[j];

        await prisma.section.create({
          data: {
            chapterId: chapter.id,
            title: child.title,
            content: sectionContent?.content || child.extractedContent || '',
            order: child.order || j + 1,
            pageCount: child.contentEndPage && child.contentStartPage
              ? child.contentEndPage - child.contentStartPage + 1
              : null,
          },
        });
      }
    } else if (chapterContent?.content || tocItem.extractedContent) {
      // Create single section with chapter content
      await prisma.section.create({
        data: {
          chapterId: chapter.id,
          title: tocItem.title,
          content: chapterContent?.content || tocItem.extractedContent || '',
          order: 1,
        },
      });
    } else {
      // Create empty section as placeholder
      await prisma.section.create({
        data: {
          chapterId: chapter.id,
          title: tocItem.title,
          content: 'المحتوى غير متوفر',
          order: 1,
        },
      });
    }
  }
}
