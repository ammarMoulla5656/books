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

const ARABIC_TAGS = {
  identity: '\u0647\u0648\u064a\u0629 \u0627\u0644\u0643\u062a\u0627\u0628',
  bookName: '\u0627\u0633\u0645 \u0627\u0644\u0643\u062a\u0627\u0628',
  author: '\u0627\u0633\u0645 \u0627\u0644\u0645\u0624\u0644\u0641',
  volume: '\u062c\u0632\u0621',
  deathYear: '\u0633\u0646\u0629 \u0627\u0644\u0648\u0641\u0627\u0629',
  category: '\u0645\u062c\u0645\u0648\u0639\u0629',
  publisher: '\u0627\u0644\u0646\u0627\u0634\u0631',
  printYear: '\u0633\u0646\u0629 \u0627\u0644\u0637\u0628\u0639',
  edition: '\u0637\u0628\u0639\u0629',
  page: '\u0635\u0641\u062d\u0629',
  attachment: '\u0645\u0644\u062d\u0642',
  tocPrefix: '\u0641\u0647\u0631\u0633',
  footnote: '\u0647\u0627\u0645\u0634',
  link: '\u0627\u0631\u062a\u0628\u0627\u0637',
  poetry: '\u0634\u0639\u0631',
};

const FOOTNOTE_MARKER = '__ABX_FOOTNOTES__';

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

  // Override with Arabic ABX metadata if available
  const identityBlock = extractBlock(xmlContent, ARABIC_TAGS.identity) || xmlContent;
  metadata.bookName = extractTagFromList(identityBlock, [
    ARABIC_TAGS.bookName,
    'õüë. õë"ëŸ¦õù',
  ]) || metadata.bookName;
  metadata.author = extractTagFromList(identityBlock, [
    ARABIC_TAGS.author,
    'õüë. õë"ë.Ïë"ë?',
  ]) || metadata.author;

  const arabicVolumeStr = extractTagFromList(identityBlock, [
    ARABIC_TAGS.volume,
    'ªý­',
  ]);
  if (arabicVolumeStr) metadata.volume = parseInt(arabicVolumeStr);

  const arabicDeathYearStr = extractTagFromList(identityBlock, [
    ARABIC_TAGS.deathYear,
    'üëÅ¸ õë"ë^ë?õ¸',
  ]);
  if (arabicDeathYearStr) metadata.deathYear = parseInt(arabicDeathYearStr);

  metadata.category = extractTagFromList(identityBlock, [
    ARABIC_TAGS.category,
    'ë.ªë.ë^û¸',
  ]) || metadata.category || '';
  metadata.publisher = extractTagFromList(identityBlock, [
    ARABIC_TAGS.publisher,
    'õë"ëÅõïñ',
  ]) || metadata.publisher || '';
  metadata.printYear = extractTagFromList(identityBlock, [
    ARABIC_TAGS.printYear,
    'üëÅ¸ õë"úùû',
  ]) || metadata.printYear || '';
  metadata.edition = extractTagFromList(identityBlock, [
    ARABIC_TAGS.edition,
    'úùû¸',
  ]) || metadata.edition || '';

  const forcedBookName = extractTagFromList(identityBlock, [ARABIC_TAGS.bookName]);
  if (forcedBookName) metadata.bookName = forcedBookName;

  const forcedAuthor = extractTagFromList(identityBlock, [ARABIC_TAGS.author]);
  if (forcedAuthor) metadata.author = forcedAuthor;

  const forcedVolumeStr = extractTagFromList(identityBlock, [ARABIC_TAGS.volume]);
  if (forcedVolumeStr) metadata.volume = parseInt(forcedVolumeStr);

  const forcedDeathYearStr = extractTagFromList(identityBlock, [ARABIC_TAGS.deathYear]);
  if (forcedDeathYearStr) metadata.deathYear = parseInt(forcedDeathYearStr);

  const forcedCategory = extractTagFromList(identityBlock, [ARABIC_TAGS.category]);
  if (forcedCategory) metadata.category = forcedCategory;

  const forcedPublisher = extractTagFromList(identityBlock, [ARABIC_TAGS.publisher]);
  if (forcedPublisher) metadata.publisher = forcedPublisher;

  const forcedPrintYear = extractTagFromList(identityBlock, [ARABIC_TAGS.printYear]);
  if (forcedPrintYear) metadata.printYear = forcedPrintYear;

  const forcedEdition = extractTagFromList(identityBlock, [ARABIC_TAGS.edition]);
  if (forcedEdition) metadata.edition = forcedEdition;

  // Extract pages with their content
  const pages: ABXPage[] = [];
  const fullTextParts: string[] = [];
  const chapters: ABXChapter[] = [];
  let currentChapter: ABXChapter | null = null;
  let chapterOrder = 0;

  // Split by page markers - improved regex to handle all variations
  const pageRegex = /<\s*صفحة\s*>\s*(\d+)\s*<\s*\/\s*صفحة\s*>/g;
  const attachmentRegex = /<\s*ملحق\s*=\s*(\d+)\s*>([\s\S]*?)<\s*\/\s*ملحق\s*=\s*\1\s*>/g;

  // Extract all pages and their content
  const pageNumbers: number[] = [];
  const pageContents: Map<number, string> = new Map();

  // First, collect all page numbers
  let pageMatch;
  while ((pageMatch = pageRegex.exec(xmlContent)) !== null) {
    pageNumbers.push(parseInt(pageMatch[1]));
  }

  // Then, collect all attachments with their content
  let attachMatch;
  while ((attachMatch = attachmentRegex.exec(xmlContent)) !== null) {
    const attachNum = parseInt(attachMatch[1]);
    const content = attachMatch[2];
    pageContents.set(attachNum, content);
  }

  const arabicPageNumbers = extractPageNumbers(xmlContent, ARABIC_TAGS.page);
  const legacyPageNumbers = extractPageNumbers(xmlContent, 'æë?ð¸');
  const effectivePageNumbers = arabicPageNumbers.length > 0 ? arabicPageNumbers : pageNumbers.length > 0 ? pageNumbers : legacyPageNumbers;

  const arabicPageContents = extractAttachments(xmlContent, ARABIC_TAGS.attachment);
  const legacyPageContents = extractAttachments(xmlContent, 'ë.ë"ðë\'');
  const effectivePageContents = arabicPageContents.size > 0 ? arabicPageContents : pageContents.size > 0 ? pageContents : legacyPageContents;

  const normalizedPageNumbers = arabicPageNumbers.length > 0 ? arabicPageNumbers : pageNumbers;
  const normalizedPageContents = arabicPageContents.size > 0 ? arabicPageContents : pageContents;

  // Process each page
  normalizedPageNumbers.forEach((pageNum, index) => {
    let pageContent = normalizedPageContents.get(pageNum) || '';

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
    if (tocEntries.length === 0) {
      extractTocEntries(pageContent).forEach((tocTitle) => {
        tocEntries.push(tocTitle);

        if (currentChapter) {
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
      });
    }

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
    if (footnotes.length === 0) {
      const arabicFootnoteRegex = buildTagContentRegex(ARABIC_TAGS.footnote, 'g');
      while ((footnoteMatch = arabicFootnoteRegex.exec(pageContent)) !== null) {
        const footnoteText = footnoteMatch[1].trim();
        if (footnoteText) {
          footnotes.push({
            number: footnoteNumber++,
            text: footnoteText,
          });

          if (currentChapter) {
            currentChapter.footnotes.push({
              number: footnoteNumber - 1,
              text: footnoteText,
            });
          }
        }
      }
    }

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
    if (poetry.length === 0) {
      const arabicPoetryRegex = buildTagContentRegex(ARABIC_TAGS.poetry, 'g');
      while ((poetryMatch = arabicPoetryRegex.exec(pageContent)) !== null) {
        const poetryText = poetryMatch[1].trim();
        if (poetryText) {
          const verses = poetryText.split('\n').map(v => v.trim()).filter(v => v);
          poetry.push({ verses });
        }
      }
    }

    let formattedContent = pageContent;

    // Remove TOC entries from content (they're already extracted)
    formattedContent = removePrefixedTag(formattedContent, ARABIC_TAGS.tocPrefix);
    formattedContent = formattedContent.replace(/<\s*فهرس الموضوعات\s*>[\s\S]*?<\s*\/\s*فهرس الموضوعات\s*>/g, '');

    // Remove link tags but keep text
    formattedContent = removeLinkTags(formattedContent, ARABIC_TAGS.link);
    formattedContent = formattedContent.replace(/<\s*ارتباط[^>]*>|<\s*\/\s*ارتباط[^>]*>/g, '');

    // Format poetry with proper line breaks
    formattedContent = formattedContent.replace(buildTagContentRegex(ARABIC_TAGS.poetry), (match, poetryText) => {
      const verses = poetryText.trim().split('\n').filter((v: string) => v.trim());
      return '\n\n' + verses.join('\n') + '\n\n';
    });
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

    if (footnotes.length > 0) {
      footnotesText = footnotes.map(f => `[${f.number}] ${f.text}`).join('\n');
    }

    // Remove footnote tags from main content
    formattedContent = formattedContent.replace(/<\s*هامش\s*>[\s\S]*?<\s*\/\s*هامش\s*>/g, '');

    formattedContent = formattedContent.replace(buildTagContentRegex(ARABIC_TAGS.footnote, 'g'), '');
    formattedContent = formattedContent.replace(/<[^>]+>/g, '');
    formattedContent = formatABXText(formattedContent);

    // Build final page content
    let cleanContent = formattedContent;
    if (footnotesText) {
      cleanContent = `${formattedContent}\n\n${FOOTNOTE_MARKER}\n${footnotesText}`;
    }

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
      fullTextParts.push(formattedContent);

      // Add to current chapter
      if (currentChapter) {
        currentChapter.content += '\n\n' + cleanContent;
        currentChapter.pages.push(page);
      }
    }
  });

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
  const pattern = buildTagPattern(tagName);
  const regex = new RegExp(`<\\s*${pattern}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${pattern}\\s*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractTagFromList(xml: string, tagNames: string[]): string | null {
  for (const tagName of tagNames) {
    const value = extractTag(xml, tagName);
    if (value) return value;
  }
  return null;
}

function extractBlock(xml: string, tagName: string): string | null {
  const pattern = buildTagPattern(tagName);
  const regex = new RegExp(`<\\s*${pattern}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${pattern}\\s*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function extractPageNumbers(xml: string, tagName: string): number[] {
  const pattern = buildTagPattern(tagName);
  const regex = new RegExp(`<\\s*${pattern}\\s*>\\s*(\\d+)\\s*<\\s*\\/\\s*${pattern}\\s*>`, 'g');
  const numbers: number[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    numbers.push(parseInt(match[1]));
  }
  return numbers;
}

function extractAttachments(xml: string, tagName: string): Map<number, string> {
  const pattern = buildTagPattern(tagName);
  const regex = new RegExp(`<\\s*${pattern}\\s*=\\s*(\\d+)\\s*>([\\s\\S]*?)<\\s*\\/\\s*${pattern}\\s*=\\s*\\1\\s*>`, 'g');
  const attachments: Map<number, string> = new Map();
  let match;
  while ((match = regex.exec(xml)) !== null) {
    attachments.set(parseInt(match[1]), match[2]);
  }
  return attachments;
}

function extractTocEntries(pageContent: string): string[] {
  const entries: string[] = [];
  const arabicTocRegex = new RegExp(`<\\s*${escapeRegex(ARABIC_TAGS.tocPrefix)}[^>]*\\s*>([\\s\\S]*?)<\\s*\\/\\s*${escapeRegex(ARABIC_TAGS.tocPrefix)}[^>]*\\s*>`, 'g');
  const legacyTocRegex = /<\s*ë?ëÎñü[^>]*\s*>([\s\S]*?)<\s*\/\s*ë?ëÎñü[^>]*\s*>/g;

  let match;
  while ((match = arabicTocRegex.exec(pageContent)) !== null) {
    const title = match[1].trim();
    if (title) entries.push(title);
  }
  while ((match = legacyTocRegex.exec(pageContent)) !== null) {
    const title = match[1].trim();
    if (title) entries.push(title);
  }

  return entries;
}

function removePrefixedTag(text: string, tagPrefix: string): string {
  const prefixPattern = escapeRegex(tagPrefix);
  const regex = new RegExp(`<\\s*${prefixPattern}[^>]*\\s*>[\\s\\S]*?<\\s*\\/\\s*${prefixPattern}[^>]*\\s*>`, 'g');
  return text.replace(regex, '');
}

function removeLinkTags(text: string, tagName: string): string {
  const pattern = buildTagPattern(tagName);
  const regex = new RegExp(`<\\s*${pattern}\\s*=\\s*[^>]+>|<\\s*\\/\\s*${pattern}\\s*=\\s*[^>]+>`, 'g');
  return text.replace(regex, '');
}

function buildTagContentRegex(tagName: string, flags = ''): RegExp {
  const pattern = buildTagPattern(tagName);
  return new RegExp(`<\\s*${pattern}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${pattern}\\s*>`, flags);
}

function buildTagPattern(tagName: string): string {
  return tagName
    .trim()
    .split(/\s+/)
    .map(part => escapeRegex(part))
    .join('\\s+');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatABXText(text: string): string {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = cleaned.split('\n').map(line => line.trim()).filter(Boolean);
  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    if (!current) {
      current = line;
      continue;
    }

    if (endsSentence(current) || isHeadingLine(line)) {
      paragraphs.push(current);
      current = line;
      continue;
    }

    current = `${current} ${line}`;
  }

  if (current) paragraphs.push(current);

  return paragraphs.join('\n\n');
}

function endsSentence(text: string): boolean {
  return /[.!?\u061f\u061b:)\u06d4]$/.test(text);
}

function isHeadingLine(text: string): boolean {
  return /^\s*(\u0633\u0624\u0627\u0644|\u0627\u0644\u062c\u0648\u0627\u0628|\u0627\u0644\u0633\u0624\u0627\u0644)\s*/.test(text);
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

  categories.fiqh.push('\u0627\u0644\u0641\u0642\u0647', '\u0641\u0642\u0647');
  categories.aqeedah.push('\u0627\u0644\u0639\u0642\u064a\u062f\u0629', '\u0639\u0642\u064a\u062f\u0629');
  categories.usul.push('\u0623\u0635\u0648\u0644');
  categories.tafsir.push('\u062a\u0641\u0633\u064a\u0631');
  categories.hadith.push('\u062d\u062f\u064a\u062b');
  categories.history.push('\u062a\u0627\u0631\u064a\u062e');
  categories.ethics.push('\u0623\u062e\u0644\u0627\u0642', '\u0627\u0644\u0623\u062e\u0644\u0627\u0642');
  categories.dua.push('\u062f\u0639\u0627\u0621');

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
