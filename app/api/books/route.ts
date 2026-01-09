import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all books
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const books = await prisma.book.findMany({
      where: search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { category: { arabicName: { contains: search, mode: 'insensitive' } } },
        ],
      } : undefined,
      include: {
        category: true,
        chapters: {
          include: {
            sections: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST create new book
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, coverImage, categoryId, chapters, pageCount } = body;

    const book = await prisma.book.create({
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
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
