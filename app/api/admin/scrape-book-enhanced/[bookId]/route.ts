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

// تنظيف HTML وإزالة العبارات غير المطلوبة
function cleanHtml(html: string): string {
  if (!html) return '';

  // إزالة scripts و styles أولاً
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // إزالة عناصر navigation و header
  html = html.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  // الحفاظ على breaks كـ newlines
  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<\/p>/gi, '\n\n');
  html = html.replace(/<p[^>]*>/gi, '');
  html = html.replace(/<\/div>/gi, '\n');

  // إزالة باقي HTML tags
  html = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&laquo;/g, '«');
  html = html.replace(/&raquo;/g, '»');
  html = html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)));

  // إزالة عبارة اللغات وما شابهها
  html = html.replace(/العربية[\s\S]{0,100}?Français/gi, '');
  html = html.replace(/فارسی|اردو|English|Azərbaycan|Türkçe|Français/gi, '');

  // إزالة عبارات الموقع
  html = html.replace(/موقع مكتب سماحة المرجع الديني الأعلى السيد علي الحسيني السيستاني \(دام ظله\)/gi, '');
  html = html.replace(/مكتب سماحة المرجع الديني/gi, '');

  // تنظيف المسافات
  html = html.replace(/[ \t]+/g, ' ');
  html = html.replace(/\n\s+/g, '\n');
  html = html.replace(/\n{3,}/g, '\n\n');

  // إزالة أسطر فارغة في البداية والنهاية
  html = html.trim();

  // إزالة أي سطور تحتوي فقط على رموز أو علامات
  html = html.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !/^[\.،؛:\-_=]+$/.test(trimmed);
  }).join('\n');

  return html;
}

// إضافة تنسيق HTML للمحتوى مع الألوان
function formatContent(content: string): string {
  // تلوين "مسألة ١" أو "مسألة 1" باللون الأخضر
  content = content.replace(
    /(مسألة\s*[٠-٩0-9]+\s*[:：]?)/g,
    '<span class="text-green-600 dark:text-green-400 font-bold">$1</span>'
  );

  // تلوين "الأحوط" باللون الأصفر
  content = content.replace(
    /(الأحوط|على الأحوط|الاحوط)/g,
    '<span class="text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded">$1</span>'
  );

  // تلوين النصوص الدينية بين قوسين
  content = content.replace(
    /\((صلى الله عليه وآله وسلم|صلى الله عليه وآله|عليه السلام|عليها السلام)\)/g,
    '<span class="text-blue-600 dark:text-blue-400 text-sm">($1)</span>'
  );

  // إضافة فواصل الأسطر
  content = content.replace(/\n/g, '<br/>');

  return content;
}

// استخراج المسائل من المحتوى
function extractMasail(content: string): Array<{number: number, title: string, content: string}> {
  const masail: Array<{number: number, title: string, content: string}> = [];

  // Pattern للمسائل: مسألة ١ أو مسألة 1
  const patterns = [
    /(?:مسألة|المسألة)\s*([٠-٩0-9]+)\s*[:：]?\s*(.*?)(?=(?:مسألة|المسألة)\s*[٠-٩0-9]+|$)/gs,
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);

    for (const match of matches) {
      const numberStr = match[1];
      // تحويل الأرقام العربية إلى إنجليزية
      const number = parseInt(numberStr.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()));
      const masalaContent = match[2].trim();

      if (masalaContent.length > 20) {
        masail.push({
          number: isNaN(number) ? parseInt(numberStr) : number,
          title: `مسألة ${number}`,
          content: masalaContent
        });
      }
    }
  }

  return masail;
}

// تحليل البنية الهرمية (فصل → أقسام)
function parseHierarchy(chapters: any[]): any[] {
  const hierarchy: any[] = [];
  let currentMainChapter: any = null;

  for (const chapter of chapters) {
    const title = chapter.title;

    // التحقق إذا كان فصل رئيسي (يحتوي على "كتاب" أو "أحكام")
    const isMainChapter =
      title.includes('كتاب') ||
      title.includes('أحكام') && !title.includes('»') ||
      title.includes('الاجتهاد') ||
      title.includes('الواجبات') ||
      title.includes('المقدّمة');

    if (isMainChapter || !title.includes('»')) {
      // فصل رئيسي جديد
      currentMainChapter = {
        ...chapter,
        subsections: []
      };
      hierarchy.push(currentMainChapter);
    } else {
      // قسم فرعي
      if (currentMainChapter) {
        currentMainChapter.subsections.push(chapter);
      } else {
        // إذا لم يكن هناك فصل رئيسي، اعتبره فصل رئيسي
        currentMainChapter = {
          ...chapter,
          subsections: []
        };
        hierarchy.push(currentMainChapter);
      }
    }
  }

  return hierarchy;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const { maxChapters = 50 } = await request.json().catch(() => ({}));

    const bookInfo = AVAILABLE_BOOKS[bookId as keyof typeof AVAILABLE_BOOKS];
    if (!bookInfo) {
      return NextResponse.json({ error: 'كتاب غير موجود' }, { status: 404 });
    }

    console.log(`🕌 بدء استخراج محسّن للكتاب ${bookId}: ${bookInfo.title}`);

    const baseUrl = 'https://www.sistani.org';
    const bookPageUrl = `${baseUrl}/arabic/book/${bookId}/`;

    // استخراج قائمة الفصول
    const response = await fetch(bookPageUrl);
    const html = await response.text();

    const chapterRegex = new RegExp(`href="/arabic/book/${bookId}/(\\d+)/">([^<]+)</a>`, 'g');
    const rawChapters: Array<{id: string, title: string}> = [];
    let match;

    while ((match = chapterRegex.exec(html)) !== null) {
      const chapterId = match[1];
      const title = cleanHtml(match[2]);

      if (!rawChapters.find(c => c.id === chapterId)) {
        rawChapters.push({ id: chapterId, title });
      }
    }

    console.log(`   ✓ وجدت ${rawChapters.length} عنصر`);

    const chaptersToScrape = rawChapters.slice(0, Math.min(maxChapters, rawChapters.length));
    const scrapedChapters = [];

    // استخراج محتوى كل فصل
    for (let i = 0; i < chaptersToScrape.length; i++) {
      const chapter = chaptersToScrape[i];
      console.log(`   [${i + 1}/${chaptersToScrape.length}] ${chapter.title}`);

      try {
        const chapterUrl = `${baseUrl}/arabic/book/${bookId}/${chapter.id}/`;
        const chapterResponse = await fetch(chapterUrl);
        const chapterHtml = await chapterResponse.text();

        // استخراج المحتوى من div.rtl
        const contentMatch = chapterHtml.match(/<div[^>]*class="[^"]*rtl[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
        let rawContent = contentMatch ? contentMatch[1] : chapterHtml;

        // تنظيف المحتوى
        const cleanedContent = cleanHtml(rawContent);

        // استخراج المسائل
        const masail = extractMasail(cleanedContent);

        scrapedChapters.push({
          id: chapter.id,
          title: chapter.title,
          rawContent: cleanedContent,
          masail: masail,
          order: i + 1
        });

        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error: any) {
        console.error(`   ✗ خطأ: ${error.message}`);
      }
    }

    // تحليل البنية الهرمية
    const hierarchy = parseHierarchy(scrapedChapters);

    console.log(`\n📊 الإحصائيات:`);
    console.log(`   - فصول رئيسية: ${hierarchy.filter(h => h.subsections.length > 0 || !h.title.includes('»')).length}`);
    console.log(`   - أقسام فرعية: ${hierarchy.reduce((sum, h) => sum + (h.subsections?.length || 0), 0)}`);
    console.log(`   - مسائل: ${scrapedChapters.reduce((sum, ch) => sum + ch.masail.length, 0)}`);

    // حفظ في قاعدة البيانات
    const category = await prisma.category.findFirst({
      where: { arabicName: 'الفقه' }
    });

    if (!category) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 });
    }

    // بناء بنية الفصول والأقسام للحفظ
    const chaptersData = hierarchy.map((mainChapter, idx) => {
      const sections = [];

      // إضافة محتوى الفصل الرئيسي كقسم إذا كان لديه مسائل
      if (mainChapter.masail && mainChapter.masail.length > 0) {
        mainChapter.masail.forEach((masala: any, mIdx: number) => {
          sections.push({
            title: masala.title,
            content: formatContent(masala.content),
            order: mIdx + 1
          });
        });
      } else if (mainChapter.rawContent) {
        sections.push({
          title: mainChapter.title,
          content: formatContent(mainChapter.rawContent.substring(0, 50000)),
          order: 1
        });
      }

      // إضافة الأقسام الفرعية
      if (mainChapter.subsections && mainChapter.subsections.length > 0) {
        mainChapter.subsections.forEach((subsection: any) => {
          if (subsection.masail && subsection.masail.length > 0) {
            subsection.masail.forEach((masala: any) => {
              sections.push({
                title: `${subsection.title.split('»').pop()?.trim()} - ${masala.title}`,
                content: formatContent(masala.content),
                order: sections.length + 1
              });
            });
          } else if (subsection.rawContent) {
            sections.push({
              title: subsection.title.split('»').pop()?.trim() || subsection.title,
              content: formatContent(subsection.rawContent.substring(0, 50000)),
              order: sections.length + 1
            });
          }
        });
      }

      return {
        title: mainChapter.title.split('»')[0].trim(),
        order: idx + 1,
        sections: {
          create: sections.length > 0 ? sections : [{
            title: mainChapter.title,
            content: formatContent(mainChapter.rawContent?.substring(0, 50000) || 'لا يوجد محتوى'),
            order: 1
          }]
        }
      };
    });

    const book = await prisma.book.create({
      data: {
        title: bookInfo.title,
        author: bookInfo.author,
        categoryId: category.id,
        order: parseInt(bookId),
        chapters: {
          create: chaptersData
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
    const totalMasail = scrapedChapters.reduce((sum, ch) => sum + ch.masail.length, 0);

    return NextResponse.json({
      success: true,
      message: 'تم استخراج الكتاب بنجاح مع التنسيق المحسّن',
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        chaptersCount: book.chapters.length,
        sectionsCount: totalSections,
        masailCount: totalMasail
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
