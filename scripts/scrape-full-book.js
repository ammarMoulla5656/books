/**
 * استخراج كامل محتوى كتاب من موقع السيستاني بشكل حرفي
 * Full book scraper - extracts complete content from sistani.org
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.sistani.org';

// Helper to fetch URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Clean HTML and extract text
function cleanHtml(html) {
  if (!html) return '';

  // Preserve paragraph breaks
  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<\/p>/gi, '\n\n');
  html = html.replace(/<p[^>]*>/gi, '');

  // Remove all other HTML tags
  html = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&laquo;/g, '«');
  html = html.replace(/&raquo;/g, '»');
  html = html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

  // Clean up whitespace
  html = html.replace(/\s+/g, ' ');
  html = html.replace(/\n\s+/g, '\n');
  html = html.trim();

  return html;
}

// Extract table of contents from book page
async function extractTableOfContents(bookId) {
  console.log(`📋 استخراج فهرس الكتاب ${bookId}...`);

  const url = `${BASE_URL}/arabic/book/${bookId}/`;
  const html = await fetchUrl(url);

  // Extract book title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const bookTitle = titleMatch ? titleMatch[1].replace(' - موقع مكتب سماحة المرجع الديني الأعلى السيد علي الحسيني السيستاني (دام ظله)', '').trim() : '';

  // Extract all chapter links - simpler regex
  const linkRegex = new RegExp(`href="/arabic/book/${bookId}/(\\d+)/">([^<]+)</a>`, 'g');
  const chapters = [];
  const seenUrls = new Set();

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const chapterId = match[1];
    const title = match[2];
    const url = `/arabic/book/${bookId}/${chapterId}/`;

    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      chapters.push({
        id: chapterId,
        title: cleanHtml(title),
        url: url
      });
    }
  }

  console.log(`   ✓ وجدت ${chapters.length} فصل`);

  return {
    bookId,
    title: bookTitle,
    chapters
  };
}

// Extract complete content from a chapter page
async function extractChapterContent(bookId, chapterId) {
  const url = `${BASE_URL}/arabic/book/${bookId}/${chapterId}/`;
  console.log(`   📄 استخراج: ${url}`);

  try {
    const html = await fetchUrl(url);

    // Extract the main content div
    const contentMatch = html.match(/<div[^>]*class="[^"]*rtl[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    if (!contentMatch) {
      console.log(`      ⚠️  لم يتم العثور على المحتوى`);
      return null;
    }

    let content = contentMatch[1];

    // Extract title from content
    const titleMatch = content.match(/<h\d[^>]*>([^<]+)<\/h\d>/);
    const title = titleMatch ? cleanHtml(titleMatch[1]) : '';

    // Remove scripts and styles
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Split into masail (مسألة)
    const masailRegex = /(?:<[^>]*>)*\s*(?:مسألة|المسألة)\s*(\d+)\s*[:\s-]*([^]*?)(?=(?:<[^>]*>)*\s*(?:مسألة|المسألة)\s*\d+|$)/gi;

    const masail = [];
    let masalaMatch;

    while ((masalaMatch = masailRegex.exec(content)) !== null) {
      const number = masalaMatch[1];
      const text = cleanHtml(masalaMatch[2]);

      if (text.length > 10) { // Filter out false matches
        masail.push({
          number: parseInt(number),
          title: `مسألة ${number}`,
          content: text
        });
      }
    }

    // If no masail found, treat entire content as one section
    if (masail.length === 0) {
      const cleanContent = cleanHtml(content);
      if (cleanContent.length > 50) {
        masail.push({
          number: 1,
          title: title || 'المحتوى',
          content: cleanContent
        });
      }
    }

    console.log(`      ✓ ${masail.length} مسألة`);

    return {
      id: chapterId,
      title,
      masail
    };

  } catch (error) {
    console.error(`      ✗ خطأ: ${error.message}`);
    return null;
  }
}

// Main function to scrape a complete book
async function scrapeCompleteBook(bookId, maxChapters = null) {
  console.log('\n🕌 بسم الله الرحمن الرحيم');
  console.log(`📚 بدء استخراج الكتاب ${bookId} بشكل كامل...\n`);

  // Get table of contents
  const toc = await extractTableOfContents(bookId);
  console.log(`📖 الكتاب: ${toc.title}\n`);

  // Limit chapters if specified
  const chaptersToScrape = maxChapters ? toc.chapters.slice(0, maxChapters) : toc.chapters;

  const completeBook = {
    id: bookId,
    title: toc.title,
    author: 'آية الله العظمى السيد علي الحسيني السيستاني',
    chapters: []
  };

  // Extract each chapter
  for (let i = 0; i < chaptersToScrape.length; i++) {
    const chapter = chaptersToScrape[i];
    console.log(`\n[${i + 1}/${chaptersToScrape.length}] ${chapter.title}`);

    const chapterContent = await extractChapterContent(bookId, chapter.id);

    if (chapterContent && chapterContent.masail.length > 0) {
      completeBook.chapters.push({
        order: i + 1,
        title: chapter.title,
        sections: chapterContent.masail.map((masala, idx) => ({
          order: idx + 1,
          title: masala.title,
          content: masala.content
        }))
      });
    }

    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save to file
  const outputPath = path.join(__dirname, `book-${bookId}-full.json`);
  fs.writeFileSync(outputPath, JSON.stringify(completeBook, null, 2), 'utf-8');

  // Print summary
  const totalSections = completeBook.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

  console.log('\n' + '='.repeat(60));
  console.log('✅ اكتمل الاستخراج!');
  console.log('='.repeat(60));
  console.log(`📖 الكتاب: ${completeBook.title}`);
  console.log(`📑 عدد الفصول: ${completeBook.chapters.length}`);
  console.log(`📝 عدد المسائل: ${totalSections}`);
  console.log(`💾 حفظ في: ${outputPath}`);
  console.log('='.repeat(60) + '\n');

  return completeBook;
}

// Run if called directly
if (require.main === module) {
  const bookId = process.argv[2] || '13'; // Default to المسائل المنتخبة
  const maxChapters = process.argv[3] ? parseInt(process.argv[3]) : 5; // Default to first 5 chapters

  console.log(`استخدام: node scrape-full-book.js <bookId> <maxChapters>`);
  console.log(`مثال: node scrape-full-book.js 13 10\n`);

  scrapeCompleteBook(bookId, maxChapters)
    .then(() => {
      console.log('🎉 انتهى البرنامج بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ خطأ:', error);
      process.exit(1);
    });
}

module.exports = { scrapeCompleteBook };
