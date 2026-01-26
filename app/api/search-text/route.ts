import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // Search in sections content
    const sections = await prisma.section.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        chapter: {
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 50,
    });

    // Format results
    const results = sections.map(section => {
      const book = section.chapter.book;
      // Find the position of query in content
      const contentLower = section.content.toLowerCase();
      const queryLower = query.toLowerCase();
      const position = contentLower.indexOf(queryLower);

      // Extract context (100 chars before and after)
      const start = Math.max(0, position - 100);
      const end = Math.min(section.content.length, position + query.length + 100);
      let context = section.content.substring(start, end);

      if (start > 0) context = '...' + context;
      if (end < section.content.length) context = context + '...';

      // Highlight the query in context
      const highlightedContext = context.replace(
        new RegExp(query, 'gi'),
        match => `<mark style="background: #ffeb3b; font-weight: bold;">${match}</mark>`
      );

      return {
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        categoryName: book.category?.arabicName || 'غير مصنف',
        chapterTitle: section.chapter.title,
        sectionId: section.id,
        sectionTitle: section.title,
        context: highlightedContext,
      };
    });

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });

  } catch (error: any) {
    console.error('Error searching text:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
