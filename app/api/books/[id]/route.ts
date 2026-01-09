import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        chapters: {
          include: {
            sections: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// PUT update book
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, author, coverImage, categoryId, chapters, pageCount } = body;

    // Delete existing chapters first
    await prisma.chapter.deleteMany({
      where: { bookId: id },
    });

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        coverImage,
        categoryId,
        pageCount,
        chapters: {
          create: chapters?.map((chapter: any, index: number) => ({
            title: chapter.title,
            order: index,
            sections: {
              create: chapter.sections?.map((section: any, sIndex: number) => ({
                title: section.title,
                content: section.content,
                order: sIndex,
                pageCount: section.pageCount,
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        category: true,
        chapters: {
          include: {
            sections: true,
          },
        },
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE book
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
