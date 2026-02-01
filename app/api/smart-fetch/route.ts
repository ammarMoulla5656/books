import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callAI, getAISettings } from '@/lib/ai-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    const aiSettings = await getAISettings();
    if (!aiSettings.apiKey) {
      return NextResponse.json({
        error: 'AI API key not configured. Please set it in admin settings.'
      }, { status: 400 });
    }

    // Use AI to understand the query and search semantically
    const keywords = await callAI([
      {
        role: 'system',
        content: 'أنت مساعد ذكي للبحث في المكتبة الإسلامية. مهمتك تحويل سؤال المستخدم إلى كلمات مفتاحية للبحث. أعط 5-10 كلمات مفتاحية مفصولة بفواصل.'
      },
      {
        role: 'user',
        content: query
      }
    ], { ...aiSettings, temperature: 0.3 });

    // Split keywords and search
    const keywordList = keywords.split(/[،,]/).map((k: string) => k.trim()).filter((k: string) => k);

    // Search in database
    const sections = await prisma.section.findMany({
      where: {
        OR: keywordList.map((keyword: string) => ({
          content: {
            contains: keyword,
            mode: 'insensitive',
          },
        })),
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
      take: limit,
    });

    // Format results
    const results = sections.map(section => {
      const book = section.chapter.book;

      return {
        bookId: book?.id || '',
        bookTitle: book?.title || '',
        bookAuthor: book?.author || '',
        categoryName: book?.category?.arabicName || 'غير مصنف',
        chapterTitle: section.chapter.title,
        sectionId: section.id,
        sectionTitle: section.title,
        excerpt: section.content.substring(0, 300) + '...',
      };
    });

    return NextResponse.json({
      query,
      keywords: keywordList,
      count: results.length,
      results,
    });

  } catch (error: any) {
    console.error('Error in smart fetch:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
