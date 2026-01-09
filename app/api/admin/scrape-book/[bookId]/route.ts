import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// قائمة الكتب المتاحة
const AVAILABLE_BOOKS = {
  '13': { title: 'المسائل المنتخبة', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '14': { title: 'مناسك الحج وملحقاتها', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '15': { title: 'منهاج الصالحين ـ الجزء الثاني', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '16': { title: 'منهاج الصالحين ـ الجزء الثالث', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '17': { title: 'الفقه للمغتربين', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '18': { title: 'الميسّر في الحج والعمرة', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '19': { title: 'الفتاوى الميسّـرة', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '22': { title: 'التعليقة على العروة الوثقى ـ الجزء الأول', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '23': { title: 'التعليقة على العروة الوثقى ـ الجزء الثاني', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '24': { title: 'الوجيز في أحكام العبادات', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '23720': { title: 'منهاج الصالحين ـ الجزء الأول', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
  '26278': { title: 'الصيام جُنة من النار', author: 'آية الله العظمى السيد علي الحسيني السيستاني' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    const bookInfo = AVAILABLE_BOOKS[bookId as keyof typeof AVAILABLE_BOOKS];
    if (!bookInfo) {
      return NextResponse.json(
        { error: 'كتاب غير موجود', availableBooks: Object.keys(AVAILABLE_BOOKS) },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'لاستخراج هذا الكتاب، استخدم POST request',
      bookId,
      bookInfo,
      instructions: {
        ar: 'قم بإرسال POST request لهذا المسار لبدء استخراج الكتاب',
        en: 'Send a POST request to this endpoint to start scraping the book'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const { maxChapters = 10 } = await request.json().catch(() => ({}));

    const bookInfo = AVAILABLE_BOOKS[bookId as keyof typeof AVAILABLE_BOOKS];
    if (!bookInfo) {
      return NextResponse.json(
        { error: 'كتاب غير موجود' },
        { status: 404 }
      );
    }

    console.log(`🕌 بدء استخراج الكتاب ${bookId}: ${bookInfo.title}`);

    //  استخراج قائمة الفصول من الموقع
    const baseUrl = 'https://www.sistani.org';
    const bookPageUrl = `${baseUrl}/arabic/book/${bookId}/`;

    const response = await fetch(bookPageUrl);
    const html = await response.text();

    // استخراج روابط الفصول
    const chapterRegex = new RegExp(`href="/arabic/book/${bookId}/(\\d+)/">`, 'g');
    const chapterIds: string[] = [];
    let match;

    while ((match = chapterRegex.exec(html)) !== null) {
      const chapterId = match[1];
      if (!chapterIds.includes(chapterId)) {
        chapterIds.push(chapterId);
      }
    }

    console.log(`   ✓ وجدت ${chapterIds.length} فصل`);

    // حد أقصى للفصول
    const chaptersToScrape = chapterIds.slice(0, Math.min(maxChapters, chapterIds.length));

    // استخراج محتوى كل فصل
    const chapters = [];

    for (let i = 0; i < chaptersToScrape.length; i++) {
      const chapterId = chaptersToScrape[i];
      console.log(`   [${i + 1}/${chaptersToScrape.length}] استخراج الفصل ${chapterId}...`);

      try {
        const chapterUrl = `${baseUrl}/arabic/book/${bookId}/${chapterId}/`;
        const chapterResponse = await fetch(chapterUrl);
        const chapterHtml = await chapterResponse.text();

        // استخراج العنوان
        const titleMatch = chapterHtml.match(/<h2[^>]*>([^<]+)<\/h2>/i) ||
                          chapterHtml.match(/<h3[^>]*>([^<]+)<\/h3>/i) ||
                          chapterHtml.match(/<title>([^<]+)<\/title>/i);

        const title = titleMatch ? titleMatch[1]
          .replace(' - موقع مكتب سماحة المرجع الديني الأعلى السيد علي الحسيني السيستاني (دام ظله)', '')
          .trim() : `الفصل ${i + 1}`;

        // استخراج المحتوى
        const contentMatch = chapterHtml.match(/<div[^>]*class="[^"]*rtl[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        let content = contentMatch ? contentMatch[1] : '';

        // تنظيف HTML
        content = content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();

        chapters.push({
          title,
          order: i + 1,
          content: content.substring(0, 10000) // حد أقصى 10000 حرف لكل فصل
        });

        // تأخير صغير
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`   ✗ خطأ في الفصل ${chapterId}:`, error.message);
      }
    }

    // حفظ في قاعدة البيانات
    const category = await prisma.category.findFirst({
      where: { arabicName: 'الفقه' }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'التصنيف غير موجود' },
        { status: 404 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: bookInfo.title,
        author: bookInfo.author,
        categoryId: category.id,
        order: parseInt(bookId),
        chapters: {
          create: chapters.map(ch => ({
            title: ch.title,
            order: ch.order,
            sections: {
              create: [{
                title: ch.title,
                content: ch.content,
                order: 1
              }]
            }
          }))
        }
      },
      include: {
        chapters: {
          include: {
            sections: true
          }
        }
      }
    });

    const totalSections = book.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

    return NextResponse.json({
      success: true,
      message: 'تم استخراج الكتاب بنجاح',
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        chaptersCount: book.chapters.length,
        sectionsCount: totalSections
      }
    });

  } catch (error: any) {
    console.error('Error scraping book:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
