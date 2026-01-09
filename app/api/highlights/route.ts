import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// GET user highlights
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const sessionId = await getUserSession();

    // Get user session from database
    let userSession = await prisma.userSession.findUnique({
      where: { sessionToken: sessionId },
    });

    if (!userSession) {
      userSession = await prisma.userSession.create({
        data: {
          sessionToken: sessionId,
        },
      });
    }

    // Get highlights
    const where: any = { sessionId: userSession.id };
    if (bookId) {
      where.bookId = bookId;
    }

    const highlights = await prisma.highlight.findMany({
      where,
      include: {
        book: {
          include: {
            category: true,
          },
        },
        section: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// POST create highlight
export async function POST(request: Request) {
  try {
    const sessionId = await getUserSession();
    const body = await request.json();
    const { bookId, sectionId, text, color, startOffset, endOffset } = body;

    // Get or create user session
    let userSession = await prisma.userSession.findUnique({
      where: { sessionToken: sessionId },
    });

    if (!userSession) {
      userSession = await prisma.userSession.create({
        data: {
          sessionToken: sessionId,
        },
      });
    }

    // Create highlight
    const highlight = await prisma.highlight.create({
      data: {
        sessionId: userSession.id,
        bookId,
        sectionId,
        text,
        color: color || '#FFEB3B',
        startOffset,
        endOffset,
      },
      include: {
        book: {
          include: {
            category: true,
          },
        },
        section: true,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}
