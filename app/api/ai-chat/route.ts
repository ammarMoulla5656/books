import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callAI, getAISettings } from '@/lib/ai-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || message.trim().length < 1) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiSettings = await getAISettings();
    if (!aiSettings.apiKey) {
      return NextResponse.json({
        error: 'AI API key not configured'
      }, { status: 400 });
    }

    // Search for relevant content
    const searchKeywords = message.split(' ').slice(0, 5);
    const sections = await prisma.section.findMany({
      where: {
        OR: searchKeywords.map(keyword => ({
          content: {
            contains: keyword,
            mode: 'insensitive',
          },
        })),
      },
      include: {
        chapter: {
          include: {
            book: true,
          },
        },
      },
      take: 3,
    });

    // Build context from relevant sections
    let contextText = '';
    if (sections.length > 0) {
      contextText = '\n\nالمصادر المتاحة:\n';
      sections.forEach((section, idx) => {
        const excerpt = section.content.substring(0, 500);
        contextText += `\n[${idx + 1}] من كتاب "${section.chapter.book.title}" - ${section.chapter.title}:\n${excerpt}...\n`;
      });
    }

    // Call AI
    const reply = await callAI([
      {
        role: 'system',
        content: `أنت مساعد ذكي متخصص في الكتب الإسلامية وكتب أهل البيت عليهم السلام.
مهمتك مساعدة المستخدمين في فهم النصوص الإسلامية والإجابة على أسئلتهم بناءً على محتوى الكتب المتاحة.
استخدم المصادر المتاحة أدناه للإجابة بدقة.${contextText}`
      },
      ...(context || []),
      {
        role: 'user',
        content: message
      }
    ], aiSettings);

    // Add source references
    const sources = sections.map((section, idx) => ({
      id: idx + 1,
      bookId: section.chapter.book.id,
      bookTitle: section.chapter.book.title,
      chapterTitle: section.chapter.title,
      sectionId: section.id,
    }));

    return NextResponse.json({
      reply,
      sources,
    });

  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
