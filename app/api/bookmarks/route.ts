import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// GET user bookmarks
export async function GET() {
  try {
    const sessionId = await getUserSession();

    // Get user session from database
    let userSession = await prisma.userSession.findUnique({
      where: { sessionToken: sessionId },
    });

    // Create session if doesn't exist
    if (!userSession) {
      userSession = await prisma.userSession.create({
        data: {
          sessionToken: sessionId,
        },
      });
    }

    // Get bookmarks with related data
    const bookmarks = await prisma.bookmark.findMany({
      where: { sessionId: userSession.id },
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

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// POST create bookmark
export async function POST(request: Request) {
  try {
    const sessionId = await getUserSession();
    const body = await request.json();
    const { bookId, sectionId, text, pageNumber } = body;

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

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        sessionId: userSession.id,
        bookId,
        sectionId,
        text,
        pageNumber,
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

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}
