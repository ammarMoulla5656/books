/**
 * Script to scrape Islamic books from sistani.org
 * استخراج الكتب الـ 13 من موقع المرجع السيستاني
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Base URL
const BASE_URL = 'https://www.sistani.org';

// قائمة الكتب الـ 13
const BOOKS = [
  { id: '23720', title: 'منهاج الصالحين ـ الجزء الأول', order: 1 },
  { id: '15', title: 'منهاج الصالحين ـ الجزء الثاني', order: 2 },
  { id: '16', title: 'منهاج الصالحين ـ الجزء الثالث', order: 3 },
  { id: '22', title: 'التعليقة على العروة الوثقى ـ الجزء الأول', order: 4 },
  { id: '23', title: 'التعليقة على العروة الوثقى ـ الجزء الثاني', order: 5 },
  { id: '13', title: 'المسائل المنتخبة', order: 6 },
  { id: '14', title: 'مناسك الحج وملحقاتها', order: 7 },
  { id: '24', title: 'الوجيز في أحكام العبادات', order: 8 },
  { id: '19', title: 'الفتاوى الميسّـرة', order: 9 },
  { id: '17', title: 'الفقه للمغتربين', order: 10 },
  { id: '18', title: 'الميسّر في الحج والعمرة', order: 11 },
  { id: '26278', title: 'الصيام جُنة من النار', order: 12 },
];

// Helper function to fetch URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper function to extract text between tags
function extractText(html, tag, className = null) {
  const regex = className
    ? new RegExp(`<${tag}[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\/${tag}>`, 'gi')
    : new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'gi');

  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1].replace(/<[^>]*>/g, '').trim());
  }
  return matches;
}

// Extract links from HTML
function extractLinks(html) {
  const regex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ url: match[1], text: match[2].trim() });
  }
  return links;
}

// Clean HTML to plain text
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Scrape a single book
async function scrapeBook(book) {
  console.log(`\n📚 جاري استخراج: ${book.title}...`);

  try {
    const bookUrl = `${BASE_URL}/arabic/book/${book.id}/`;
    const html = await fetchUrl(bookUrl);

    // Extract chapters (table of contents)
    const chapterLinks = extractLinks(html).filter(link =>
      link.url.includes(`/arabic/book/${book.id}/`) &&
      link.url !== bookUrl &&
      !link.url.includes('#') &&
      link.text.length > 0
    );

    console.log(`   وجدت ${chapterLinks.length} فصل/قسم`);

    const chapters = [];
    let chapterOrder = 0;

    // Group chapters (limit to first 50 for initial testing)
    const uniqueChapters = [];
    const seenUrls = new Set();

    for (const link of chapterLinks) {
      if (!seenUrls.has(link.url) && link.text.length > 3) {
        seenUrls.add(link.url);
        uniqueChapters.push(link);
        if (uniqueChapters.length >= 50) break; // Limit for testing
      }
    }

    // Scrape each chapter
    for (const chapterLink of uniqueChapters.slice(0, 10)) { // First 10 chapters for testing
      chapterOrder++;
      console.log(`   - الفصل ${chapterOrder}: ${chapterLink.text}`);

      try {
        const chapterUrl = chapterLink.url.startsWith('http')
          ? chapterLink.url
          : `${BASE_URL}${chapterLink.url}`;

        const chapterHtml = await fetchUrl(chapterUrl);

        // Extract content
        const contentMatch = chapterHtml.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        const content = contentMatch ? cleanHtml(contentMatch[1]) : '';

        // Split content into sections (مسائل)
        const sections = [];

        // Try to find numbered sections (مسألة 1، مسألة 2, etc.)
        const sectionRegex = /(?:مسألة|المسألة)\s*(\d+)[:\s]*([^]*?)(?=(?:مسألة|المسألة)\s*\d+|$)/gi;
        let sectionMatch;
        let sectionOrder = 0;

        while ((sectionMatch = sectionRegex.exec(content)) !== null) {
          sectionOrder++;
          sections.push({
            title: `مسألة ${sectionMatch[1]}`,
            content: sectionMatch[2].trim().substring(0, 5000), // Limit content length
            order: sectionOrder
          });
        }

        // If no sections found, create one section with all content
        if (sections.length === 0 && content.length > 0) {
          sections.push({
            title: chapterLink.text,
            content: content.substring(0, 5000),
            order: 1
          });
        }

        chapters.push({
          title: chapterLink.text,
          order: chapterOrder,
          sections: sections
        });

        // Add delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`   ✗ خطأ في استخراج الفصل: ${err.message}`);
      }
    }

    return {
      title: book.title,
      author: 'آية الله العظمى السيد علي الحسيني السيستاني',
      order: book.order,
      categoryId: null, // Will be set during import
      coverImage: null,
      chapters: chapters
    };

  } catch (error) {
    console.error(`✗ خطأ في استخراج الكتاب: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  console.log('🕌 بسم الله الرحمن الرحيم');
  console.log('📖 بدء استخراج الكتب من موقع المرجع السيستاني\n');

  const allBooks = [];

  // Scrape first 3 books for testing
  for (const book of BOOKS.slice(0, 3)) {
    const bookData = await scrapeBook(book);
    if (bookData) {
      allBooks.push(bookData);
      console.log(`✓ تم استخراج: ${book.title}`);
    }

    // Add delay between books
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, 'sistani-books.json');
  fs.writeFileSync(outputPath, JSON.stringify(allBooks, null, 2), 'utf-8');

  console.log(`\n✅ تم حفظ البيانات في: ${outputPath}`);
  console.log(`📊 إجمالي الكتب: ${allBooks.length}`);

  // Print summary
  allBooks.forEach(book => {
    const totalSections = book.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);
    console.log(`   - ${book.title}: ${book.chapters.length} فصل، ${totalSections} مسألة`);
  });

  console.log('\n🎉 انتهى الاستخراج بنجاح!');
}

// Run
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeBook, BOOKS };
