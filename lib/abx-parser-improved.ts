/**
 * ABX File Parser - Improved Version
 * محلل ملفات ABX المحسّن - مشابه لمكتبة أهل البيت
 *
 * التحسينات:
 * - استخراج أفضل للبيانات الوصفية
 * - معالجة محسّنة للصفحات والفصول
 * - دعم أفضل للهوامش والشعر
 * - معالجة أخطاء محسّنة
 */

export interface ABXMetadata {
  bookName: string;
  author: string;
  volume?: number;
  deathYear?: number;
  category?: string;
  publisher?: string;
  city?: string;
  printYear?: string;
  edition?: string;
}

export interface ABXFootnote {
  number: number;
  text: string;
}

export interface ABXPoetry {
  verses: string[];
}

export interface ABXPage {
  pageNumber: number;
  content: string;
  footnotes: ABXFootnote[];
  poetry: ABXPoetry[];
  hasTableOfContents: boolean;
  tocEntries: string[];
}

export interface ABXChapter {
  title: string;
  startPage: number;
  order: number;
  content: string;
  footnotes: ABXFootnote[];
  pages: ABXPage[];
}

export interface ABXBook {
  metadata: ABXMetadata;
  pages: ABXPage[];
  chapters: ABXChapter[];
  fullText: string;
}

/**
 * استخراج محتوى من tag XML بطريقة آمنة
 */
function safeExtractTag(xml: string, tagName: string): string | null {
  try {
    // إزالة المسافات من اسم الـ tag
    const cleanTag = tagName.trim();

    // محاولة الاستخراج بعدة طرق
    const patterns = [
      // Pattern 1: النمط القياسي
      new RegExp(`<${cleanTag}>([\\s\\S]*?)<\\/${cleanTag}>`, 'i'),
      // Pattern 2: مع مسافات
      new RegExp(`<\\s*${cleanTag}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${cleanTag}\\s*>`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  } catch (error) {
    console.error(`Error extracting tag ${tagName}:`, error);
    return null;
  }
}

/**
 * استخراج جميع التطابقات من tag
 */
function safeExtractAllTags(xml: string, tagName: string): string[] {
  try {
    const results: string[] = [];
    const cleanTag = tagName.trim();
    const pattern = new RegExp(`<\\s*${cleanTag}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${cleanTag}\\s*>`, 'gi');

    let match;
    while ((match = pattern.exec(xml)) !== null) {
      if (match[1]) {
        results.push(match[1].trim());
      }
    }

    return results;
  } catch (error) {
    console.error(`Error extracting all tags ${tagName}:`, error);
    return [];
  }
}

/**
 * استخراج الأرقام من الصفحات
 */
function extractPageNumbers(xml: string): Map<number, string> {
  const pages = new Map<number, string>();

  try {
    // Pattern للصفحة: <صفحة>رقم</صفحة>
    const pagePattern = /<\s*صفحة\s*>\s*(\d+)\s*<\s*\/\s*صفحة\s*>/g;
    const pageNumbers: number[] = [];

    let match;
    while ((match = pagePattern.exec(xml)) !== null) {
      const pageNum = parseInt(match[1]);
      if (!isNaN(pageNum)) {
        pageNumbers.push(pageNum);
      }
    }

    // Pattern للملحق: <ملحق=رقم>محتوى</ملحق=رقم>
    const attachPattern = /<\s*ملحق\s*=\s*(\d+)\s*>([\s\S]*?)<\s*\/\s*ملحق\s*=\s*\1\s*>/g;

    while ((match = attachPattern.exec(xml)) !== null) {
      const pageNum = parseInt(match[1]);
      const content = match[2];

      if (!isNaN(pageNum) && content) {
        pages.set(pageNum, content);
      }
    }

    // إذا لم نجد محتوى للصفحات، نقسم المحتوى بالتساوي
    if (pages.size === 0 && pageNumbers.length > 0) {
      console.warn('No page content found, will split text evenly');
      // سيتم التعامل مع هذا لاحقاً
    }

    return pages;
  } catch (error) {
    console.error('Error extracting page numbers:', error);
    return new Map();
  }
}

/**
 * استخراج البيانات الوصفية من الملف
 */
function extractMetadata(xml: string): ABXMetadata {
  const metadata: ABXMetadata = {
    bookName: 'كتاب غير معنون',
    author: 'مؤلف غير معروف',
  };

  try {
    // استخراج كتلة هوية الكتاب
    const identityBlock = safeExtractTag(xml, 'هوية الكتاب') || xml;

    // استخراج البيانات الأساسية
    const bookName = safeExtractTag(identityBlock, 'اسم الكتاب');
    if (bookName) metadata.bookName = bookName;

    const author = safeExtractTag(identityBlock, 'اسم المؤلف');
    if (author) metadata.author = author;

    // البيانات الإضافية
    const volume = safeExtractTag(identityBlock, 'جزء');
    if (volume) metadata.volume = parseInt(volume);

    const deathYear = safeExtractTag(identityBlock, 'سنة الوفاة');
    if (deathYear) metadata.deathYear = parseInt(deathYear);

    const category = safeExtractTag(identityBlock, 'مجموعة');
    if (category) metadata.category = category;

    const publisher = safeExtractTag(identityBlock, 'الناشر');
    if (publisher) metadata.publisher = publisher;

    const city = safeExtractTag(identityBlock, 'مدينة الطبع');
    if (city) metadata.city = city;

    const printYear = safeExtractTag(identityBlock, 'سنة الطبع');
    if (printYear) metadata.printYear = printYear;

    const edition = safeExtractTag(identityBlock, 'طبعة');
    if (edition) metadata.edition = edition;

  } catch (error) {
    console.error('Error extracting metadata:', error);
  }

  return metadata;
}

/**
 * استخراج الهوامش من صفحة
 */
function extractFootnotes(pageContent: string): ABXFootnote[] {
  const footnotes: ABXFootnote[] = [];

  try {
    const footnoteTexts = safeExtractAllTags(pageContent, 'هامش');

    footnoteTexts.forEach((text, index) => {
      if (text.trim()) {
        footnotes.push({
          number: index + 1,
          text: text.trim(),
        });
      }
    });
  } catch (error) {
    console.error('Error extracting footnotes:', error);
  }

  return footnotes;
}

/**
 * استخراج الشعر من صفحة
 */
function extractPoetry(pageContent: string): ABXPoetry[] {
  const poetry: ABXPoetry[] = [];

  try {
    const poetryTexts = safeExtractAllTags(pageContent, 'شعر');

    poetryTexts.forEach((text) => {
      if (text.trim()) {
        const verses = text
          .split('\n')
          .map(v => v.trim())
          .filter(v => v.length > 0);

        if (verses.length > 0) {
          poetry.push({ verses });
        }
      }
    });
  } catch (error) {
    console.error('Error extracting poetry:', error);
  }

  return poetry;
}

/**
 * استخراج عناوين الفهرس
 */
function extractTocEntries(pageContent: string): string[] {
  const entries: string[] = [];

  try {
    // محاولة استخراج "فهرس الموضوعات"
    const tocTexts = safeExtractAllTags(pageContent, 'فهرس الموضوعات');
    tocTexts.forEach(text => {
      if (text.trim()) {
        entries.push(text.trim());
      }
    });

    // محاولة استخراج tags فهرس عامة
    if (entries.length === 0) {
      const pattern = /<\s*فهرس[^>]*\s*>([\s\S]*?)<\s*\/\s*فهرس[^>]*\s*>/gi;
      let match;

      while ((match = pattern.exec(pageContent)) !== null) {
        if (match[1] && match[1].trim()) {
          entries.push(match[1].trim());
        }
      }
    }
  } catch (error) {
    console.error('Error extracting TOC entries:', error);
  }

  return entries;
}

/**
 * تنظيف وتنسيق محتوى الصفحة
 */
function cleanPageContent(content: string): string {
  try {
    let cleaned = content;

    // إزالة tags الفهرس
    cleaned = cleaned.replace(/<\s*فهرس[^>]*\s*>[\s\S]*?<\s*\/\s*فهرس[^>]*\s*>/gi, '');

    // إزالة tags الهامش
    cleaned = cleaned.replace(/<\s*هامش\s*>[\s\S]*?<\s*\/\s*هامش\s*>/gi, '');

    // إزالة tags الارتباط لكن نحتفظ بالنص
    cleaned = cleaned.replace(/<\s*ارتباط[^>]*>/gi, '');
    cleaned = cleaned.replace(/<\s*\/\s*ارتباط[^>]*>/gi, '');

    // تنسيق الشعر
    cleaned = cleaned.replace(/<\s*شعر\s*>([\s\S]*?)<\s*\/\s*شعر\s*>/gi, (match, poetry) => {
      const verses = poetry.trim().split('\n').filter((v: string) => v.trim());
      return '\n\n' + verses.join('\n') + '\n\n';
    });

    // إزالة جميع tags المتبقية
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // تنظيف المسافات
    cleaned = cleaned
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleaned;
  } catch (error) {
    console.error('Error cleaning content:', error);
    return content;
  }
}

/**
 * تحليل ملف ABX بشكل كامل
 */
export function parseABXFile(xmlContent: string): ABXBook {
  console.log('📖 بدء تحليل ملف ABX...');

  try {
    // إزالة BOM إذا كان موجوداً
    xmlContent = xmlContent.replace(/^\uFEFF/, '');

    // استخراج البيانات الوصفية
    const metadata = extractMetadata(xmlContent);
    console.log('✅ تم استخراج البيانات الوصفية:', metadata.bookName);

    // استخراج الصفحات
    const pagesMap = extractPageNumbers(xmlContent);
    console.log(`✅ تم العثور على ${pagesMap.size} صفحة`);

    const pages: ABXPage[] = [];
    const chapters: ABXChapter[] = [];
    const fullTextParts: string[] = [];

    let currentChapter: ABXChapter | null = null;
    let chapterOrder = 0;

    // معالجة كل صفحة
    const sortedPages = Array.from(pagesMap.entries()).sort((a, b) => a[0] - b[0]);

    for (const [pageNum, pageContent] of sortedPages) {
      // استخراج معلومات الصفحة
      const tocEntries = extractTocEntries(pageContent);
      const footnotes = extractFootnotes(pageContent);
      const poetry = extractPoetry(pageContent);

      // إذا وجدنا عنوان فهرس، ننشئ فصل جديد
      if (tocEntries.length > 0) {
        // حفظ الفصل السابق
        if (currentChapter) {
          chapters.push(currentChapter);
        }

        // إنشاء فصل جديد
        chapterOrder++;
        currentChapter = {
          title: tocEntries[0],
          startPage: pageNum,
          order: chapterOrder,
          content: '',
          footnotes: [],
          pages: [],
        };

        console.log(`📑 فصل جديد: ${tocEntries[0]} (صفحة ${pageNum})`);
      }

      // تنظيف المحتوى
      const cleanContent = cleanPageContent(pageContent);

      // إنشاء محتوى الصفحة مع الهوامش
      let fullPageContent = cleanContent;
      if (footnotes.length > 0) {
        const footnotesText = footnotes.map(f => `[${f.number}] ${f.text}`).join('\n\n');
        fullPageContent = `${cleanContent}\n\n${'─'.repeat(50)}\n\n${footnotesText}`;
      }

      // إضافة الصفحة
      const page: ABXPage = {
        pageNumber: pageNum,
        content: fullPageContent,
        footnotes,
        poetry,
        hasTableOfContents: tocEntries.length > 0,
        tocEntries,
      };

      pages.push(page);
      fullTextParts.push(cleanContent);

      // إضافة للفصل الحالي
      if (currentChapter) {
        currentChapter.content += '\n\n' + fullPageContent;
        currentChapter.footnotes.push(...footnotes);
        currentChapter.pages.push(page);
      }
    }

    // حفظ آخر فصل
    if (currentChapter) {
      chapters.push(currentChapter);
    }

    // إذا لم نجد فصول، ننشئ فصل واحد للكتاب كله
    if (chapters.length === 0 && pages.length > 0) {
      chapters.push({
        title: metadata.bookName,
        startPage: 1,
        order: 1,
        content: fullTextParts.join('\n\n'),
        footnotes: pages.flatMap(p => p.footnotes),
        pages: pages,
      });
    }

    console.log(`✅ تم إنشاء ${chapters.length} فصل`);
    console.log('✅ اكتمل تحليل ملف ABX بنجاح');

    return {
      metadata,
      pages,
      chapters,
      fullText: fullTextParts.join('\n\n'),
    };

  } catch (error) {
    console.error('❌ خطأ في تحليل ملف ABX:', error);
    throw new Error(`فشل تحليل ملف ABX: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * تحديد التصنيف بناءً على المحتوى
 */
export function detectCategory(metadata: ABXMetadata, fullText: string): string {
  const { bookName, category } = metadata;
  const searchText = `${bookName} ${category || ''} ${fullText.substring(0, 3000)}`.toLowerCase();

  const categories = {
    'fiqh': ['فقه', 'أحكام', 'حلال', 'حرام', 'واجب', 'مستحب', 'الفتاوى', 'المسائل', 'الاستفتاءات'],
    'aqeedah': ['عقائد', 'عقيدة', 'توحيد', 'الإمامة', 'النبوة', 'المعاد', 'العدل'],
    'usul': ['أصول الفقه', 'الاجتهاد', 'القياس', 'الاستنباط', 'الأدلة'],
    'tafsir': ['تفسير', 'القرآن', 'الآية', 'السورة', 'التأويل', 'المعاني'],
    'hadith': ['حديث', 'رواية', 'الإسناد', 'السند', 'المتن', 'الراوي'],
    'history': ['تاريخ', 'السيرة', 'الوفاة', 'الولادة', 'الأحداث'],
    'ethics': ['أخلاق', 'الأدب', 'السلوك', 'الفضائل', 'الرذائل', 'التهذيب'],
    'dua': ['دعاء', 'أدعية', 'الزيارة', 'المناجاة', 'الابتهال'],
  };

  let bestMatch = 'fiqh';
  let maxScore = 0;

  for (const [cat, keywords] of Object.entries(categories)) {
    let score = 0;
    for (const keyword of keywords) {
      const occurrences = (searchText.match(new RegExp(keyword, 'g')) || []).length;
      score += occurrences;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = cat;
    }
  }

  return bestMatch;
}

/**
 * تحويل كتاب ABX إلى صيغة قاعدة البيانات
 */
export function abxToBookData(abxBook: ABXBook) {
  const { metadata, pages, chapters, fullText } = abxBook;
  const category = detectCategory(metadata, fullText);

  return {
    title: metadata.bookName,
    author: metadata.author,
    categoryId: category,
    volume: metadata.volume,
    publisher: metadata.publisher,
    description: `${metadata.bookName} للمؤلف ${metadata.author}${metadata.volume ? ` - الجزء ${metadata.volume}` : ''}`,
    totalPages: pages.length,
    chapters: chapters.map(chapter => ({
      title: chapter.title,
      order: chapter.order,
      content: chapter.content,
      footnotes: chapter.footnotes.map(f => `[${f.number}] ${f.text}`).join('\n\n'),
      pages: chapter.pages.map(page => ({
        pageNumber: page.pageNumber,
        content: page.content,
        footnotes: page.footnotes.map(f => `[${f.number}] ${f.text}`),
        poetry: page.poetry.map(p => p.verses.join('\n')),
        tocEntries: page.tocEntries,
      })),
    })),
    content: {
      fullText,
      pages: pages.map(page => ({
        pageNumber: page.pageNumber,
        content: page.content,
        footnotes: page.footnotes.map(f => `[${f.number}] ${f.text}`),
        poetry: page.poetry.map(p => p.verses.join('\n')),
        tocEntries: page.tocEntries,
      })),
    },
    metadata: {
      deathYear: metadata.deathYear,
      publisher: metadata.publisher,
      printYear: metadata.printYear,
      edition: metadata.edition,
      volume: metadata.volume,
      city: metadata.city,
      source: 'abx',
      totalChapters: chapters.length,
      totalPages: pages.length,
    },
  };
}
