/**
 * ABX File Parser - XML Format
 * Parses Islamic library books in ABX XML format with Arabic tags
 * Preserves original book structure and order
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

export interface ABXChapter {
  title: string;
  startPage: number;
  order: number;
  content: string;
  footnotes: ABXFootnote[];
  pages: ABXPage[];
}

export interface ABXPage {
  pageNumber: number;
  content: string;
  footnotes: ABXFootnote[];
  poetry: ABXPoetry[];
  hasTableOfContents: boolean;
  tocEntries: string[];
}

export interface ABXBook {
  metadata: ABXMetadata;
  pages: ABXPage[];
  chapters: ABXChapter[];
  fullText: string;
}

/**
 * Parse ABX XML file content
 */
export function parseABXFile(xmlContent: string): ABXBook {
  // Remove BOM if present
  xmlContent = xmlContent.replace(/^\uFEFF/, '');

  const metadata: ABXMetadata = {
    bookName: '',
    author: '',
  };

  // Extract metadata from <هوية الكتاب>
  metadata.bookName = extractTag(xmlContent, 'اسم الكتاب') || '';
  metadata.author = extractTag(xmlContent, 'اسم المؤلف') || '';

  const volumeStr = extractTag(xmlContent, 'جزء');
  if (volumeStr) metadata.volume = parseInt(volumeStr);

  const deathYearStr = extractTag(xmlContent, 'سنة الوفاة');
  if (deathYearStr) metadata.deathYear = parseInt(deathYearStr);

  metadata.category = extractTag(xmlContent, 'مجموعة') || '';
  metadata.publisher = extractTag(xmlContent, 'الناشر') || '';
  metadata.printYear = extractTag(xmlContent, 'سنة الطبع') || '';
  metadata.edition = extractTag(xmlContent, 'طبعة') || '';

  // Extract pages with their content
  const pages: ABXPage[] = [];
  const fullTextParts: string[] = [];
  const chapters: ABXChapter[] = [];
  let currentChapter: ABXChapter | null = null;
  let chapterOrder = 0;

  // Split by page markers
  const pageRegex = /<\s*صفحة\s*>[\s\S]*?<\s*\/\s*صفحة\s*>[\s\S]*?<\s*ملحق\s*=\s*\d+\s*>[\s\S]*?<\s*\/\s*ملحق\s*=\s*\d+\s*>/g;
  const pageMatches = xmlContent.match(pageRegex);

  if (pageMatches) {
    pageMatches.forEach((pageBlock, index) => {
      // Extract page number
      const pageNumberStr = extractTag(pageBlock, 'صفحة');
      const pageNum = pageNumberStr ? parseInt(pageNumberStr) : index + 1;

      // Extract main content from ملحق
      const attachmentRegex = /<\s*ملحق\s*=\s*\d+\s*>([\s\S]*?)<\s*\/\s*ملحق\s*=\s*\d+\s*>/;
      const attachmentMatch = pageBlock.match(attachmentRegex);
      let pageContent = attachmentMatch ? attachmentMatch[1].trim() : '';

      // Extract فهرس الموضوعات (Table of Contents entries)
      const tocEntries: string[] = [];
      const tocRegex = /<\s*فهرس الموضوعات\s*>([\s\S]*?)<\s*\/\s*فهرس الموضوعات\s*>/g;
      let tocMatch;
      while ((tocMatch = tocRegex.exec(pageContent)) !== null) {
        const tocTitle = tocMatch[1].trim();
        if (tocTitle) {
          tocEntries.push(tocTitle);

          // Create a new chapter when we find a TOC entry
          if (currentChapter) {
            // Save previous chapter
            chapters.push(currentChapter);
          }

          chapterOrder++;
          currentChapter = {
            title: tocTitle,
            startPage: pageNum,
            order: chapterOrder,
            content: '',
            footnotes: [],
            pages: [],
          };
        }
      }

      // Extract هامش (Footnotes)
      const footnotes: ABXFootnote[] = [];
      const footnoteRegex = /<\s*هامش\s*>([\s\S]*?)<\s*\/\s*هامش\s*>/g;
      let footnoteMatch;
      let footnoteNumber = 1;
      while ((footnoteMatch = footnoteRegex.exec(pageContent)) !== null) {
        const footnoteText = footnoteMatch[1].trim();
        if (footnoteText) {
          footnotes.push({
            number: footnoteNumber++,
            text: footnoteText,
          });

          // Add to current chapter's footnotes
          if (currentChapter) {
            currentChapter.footnotes.push({
              number: footnoteNumber - 1,
              text: footnoteText,
            });
          }
        }
      }

      // Extract شعر (Poetry)
      const poetry: ABXPoetry[] = [];
      const poetryRegex = /<\s*شعر\s*>([\s\S]*?)<\s*\/\s*شعر\s*>/g;
      let poetryMatch;
      while ((poetryMatch = poetryRegex.exec(pageContent)) !== null) {
        const poetryText = poetryMatch[1].trim();
        if (poetryText) {
          const verses = poetryText.split('\n').map(v => v.trim()).filter(v => v);
          poetry.push({ verses });
        }
      }

      // Build formatted page content preserving structure
      let formattedContent = pageContent;

      // Remove TOC entries from content (they're already extracted)
      formattedContent = formattedContent.replace(/<\s*فهرس الموضوعات\s*>[\s\S]*?<\s*\/\s*فهرس الموضوعات\s*>/g, '');

      // Remove link tags but keep text
      formattedContent = formattedContent.replace(/<\s*ارتباط[^>]*>|<\s*\/\s*ارتباط[^>]*>/g, '');

      // Format poetry with proper line breaks
      formattedContent = formattedContent.replace(/<\s*شعر\s*>([\s\S]*?)<\s*\/\s*شعر\s*>/g, (match, poetryText) => {
        const verses = poetryText.trim().split('\n').filter((v: string) => v.trim());
        return '\n\n' + verses.join('\n') + '\n\n';
      });

      // Extract and format footnotes separately
      let footnotesText = '';
      if (footnotes.length > 0) {
        footnotesText = '\n\n' + '─'.repeat(50) + '\n\n';
        footnotesText += footnotes.map(f => `[${f.number}] ${f.text}`).join('\n\n');
      }

      // Remove footnote tags from main content
      formattedContent = formattedContent.replace(/<\s*هامش\s*>[\s\S]*?<\s*\/\s*هامش\s*>/g, '');

      // Build final page content
      let cleanContent = formattedContent.trim() + footnotesText;

      if (cleanContent) {
        const page: ABXPage = {
          pageNumber: pageNum,
          content: cleanContent,
          footnotes,
          poetry,
          hasTableOfContents: tocEntries.length > 0,
          tocEntries,
        };

        pages.push(page);
        fullTextParts.push(cleanContent);

        // Add to current chapter
        if (currentChapter) {
          currentChapter.content += '\n\n' + cleanContent;
          currentChapter.pages.push(page);
        }
      }
    });
  }

  // Add last chapter
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // If no chapters found from TOC, create one chapter for entire book
  if (chapters.length === 0) {
    chapters.push({
      title: metadata.bookName,
      startPage: 1,
      order: 1,
      content: fullTextParts.join('\n\n'),
      footnotes: pages.flatMap(p => p.footnotes),
      pages: pages,
    });
  }

  return {
    metadata,
    pages,
    chapters,
    fullText: fullTextParts.join('\n\n'),
  };
}

/**
 * Extract content from XML tag
 */
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<\\s*${tagName}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${tagName}\\s*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Detect category from book content and metadata
 */
export function detectCategory(metadata: ABXMetadata, fullText: string): string {
  const { bookName, category } = metadata;
  const searchText = `${bookName} ${category || ''} ${fullText.substring(0, 2000)}`.toLowerCase();

  // Category detection keywords
  const categories = {
    'fiqh': ['فقه', 'أحكام', 'حلال', 'حرام', 'واجب', 'مستحب', 'الفتاوى', 'المسائل'],
    'aqeedah': ['عقائد', 'عقيدة', 'توحيد', 'الإمامة', 'النبوة', 'المعاد', 'العدل'],
    'usul': ['أصول الفقه', 'الاجتهاد', 'القياس', 'الاستنباط', 'الأدلة'],
    'tafsir': ['تفسير', 'القرآن', 'الآية', 'السورة', 'التأويل', 'المعاني'],
    'hadith': ['حديث', 'رواية', 'الإسناد', 'السند', 'المتن', 'الراوي'],
    'history': ['تاريخ', 'السيرة', 'الوفاة', 'الولادة', 'الأحداث'],
    'ethics': ['أخلاق', 'الأدب', 'السلوك', 'الفضائل', 'الرذائل', 'التهذيب'],
    'dua': ['دعاء', 'أدعية', 'الزيارة', 'المناجاة', 'الابتهال'],
  };

  let bestMatch = 'ethics'; // Default based on the sample
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
 * Convert ABX book to database format
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
      source: 'abx',
      totalChapters: chapters.length,
      totalPages: pages.length,
    },
  };
}
