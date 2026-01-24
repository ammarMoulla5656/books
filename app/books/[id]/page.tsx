'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Book } from '@/lib/types';
import { FiBook, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

// ⚙️ إعدادات الفهرست - يمكن تعديلها
const TOC_CONFIG = {
  sidebarWidth: 280,         // عرض الفهرست الكامل (px)
  buttonWidth: 260,         // عرض كل زر (px)
  rowHeight: 50,             // ارتفاع كل صف (px)
  maxLines: 2,               // عدد الأسطر المسموحة
  maxTitleWidth: 200,        // عرض النص الأقصى (px)
  fontSize: 13,              // حجم الخط (px)

  // الألوان
  bgColor: 'transparent',    // لون الخلفية (شفاف = نفس لون الخلفية)
  textColor: '#2d3748',      // لون النص
  borderColor: '#e2e8f0',    // لون الحدود

  // الألوان عند التحديد (Active)
  activeBgColor: '#e6f7f7',  // لون الخلفية عند التحديد
  activeTextColor: '#0d7377', // لون النص عند التحديد
  activeBorderColor: '#0d7377', // لون البوردر عند التحديد

  // Hover
  hoverBgColor: '#f7fafc',   // لون الخلفية عند المرور
};

// ⚙️ إعدادات تنسيق المحتوى - مشابه لـ ABLibrary
const CONTENT_CONFIG = {
  maxWidth: 850,             // عرض المحتوى الأقصى (px)
  paddingX: 80,              // المسافة من اليمين واليسار (px)
  paddingY: 60,              // المسافة من الأعلى والأسفل (px)
  fontSize: 17,              // حجم الخط الافتراضي (px)
  lineHeight: 2.2,           // ارتفاع السطر
  paragraphSpacing: 1.5,     // المسافة بين الفقرات (em)
  titleSize: 22,             // حجم خط العنوان (px)
  titleSpacing: 30,          // المسافة تحت العنوان (px)
};

// العبارات الإسلامية التي يجب تلوينها باللون الأخضر
// ملاحظة: الترتيب مهم - الأطول أولاً لتجنب التطابق الجزئي
const FOOTNOTE_MARKER = '__ABX_FOOTNOTES__';

const ISLAMIC_PHRASES = [
  // الصلوات الطويلة أولاً
  'صلى اللّه عليه وآله وسلّم',
  'صلى الله عليه وآله وسلم',
  'صلى اللّه عليه وآله',
  'صلى الله عليه وآله',
  'صلى الله عليه وسلم',
  'عليهم أفضل الصلاة والسلام',
  'عليه أفضل الصلاة والسلام',
  'صلوات الله عليهم أجمعين',
  'صلوات الله عليهم',
  'صلوات الله عليه',
  'صلوات الله عليها',

  // السلام
  'عليهم السّلام',
  'عليهم السلام',
  'عليه السّلام',
  'عليه السلام',
  'عليها السلام',
  'سلام الله عليهم',
  'سلام الله عليه',
  'سلام الله عليها',

  // الأدعية
  'عجل الله تعالى فرجه الشريف',
  'عجل الله فرجه الشريف',
  'عجل الله فرجه',
  'أرواحنا فداه',
  'أرواحنا له الفداء',
  'فداه أرواحنا',

  // الألقاب
  'قدس سره الشريف',
  'قدّس سره الشريف',
  'قدس سره',
  'قدّس سره',
  'دام ظله الشريف',
  'دام ظله الوارف',
  'دام ظلّه',
  'دام ظله',
  'أدام الله ظله',
  'حفظه الله',
  'أيده الله',

  // الترضي والترحم
  'رضوان الله عليه',
  'رضوان الله عليها',
  'رضوان الله عليهم',
  'رضي الله عنه',
  'رضي الله عنها',
  'رضي الله عنهم',
  'رحمه الله تعالى',
  'رحمة الله عليه',
  'رحمه الله',

  // التسميات الشريفة
  'اللهم صل على محمد وآل محمد',
  'اللهم صلّ على محمد وآل محمد',
  'اللهم صل على محمد',
  'بسم الله الرحمن الرحيم',
];

/**
 * تلوين العبارات الإسلامية باللون الأخضر
 */
function highlightIslamicPhrases(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Create regex pattern from all Islamic phrases
  const pattern = ISLAMIC_PHRASES
    .map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'g');

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted Islamic phrase
    parts.push(
      <span key={match.index} className="text-emerald-600 font-semibold">
        {match[0]}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function getPageNumber(page: any, index: number): number {
  if (typeof page?.order === 'number') {
    return page.order;
  }

  const match = typeof page?.title === 'string'
    ? page.title.match(/\u0635\u0641\u062d\u0629\s*(\d+)/)
    : null;

  return match ? parseInt(match[1]) : index + 1;
}

function splitContentWithFootnotes(content: string): { main: string; footnotes: string[] } {
  const marker = `\n\n${FOOTNOTE_MARKER}\n`;
  const parts = content.split(marker);
  const main = parts[0] || '';
  const footnotes = (parts[1] || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return { main, footnotes };
}

function renderParagraphText(paragraph: string): React.ReactNode {
  const lines = paragraph.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {highlightIslamicPhrases(line)}
      {lineIndex < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedPageIndices, setLoadedPageIndices] = useState<Set<number>>(new Set([0, 1, 2]));
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useVisitorTracking(`/books/${params.id}`, 'page_view');

  // Get all pages from all chapters
  const allPages = book?.chapters.flatMap(chapter =>
    chapter.sections.map(section => ({
      ...section,
      chapterTitle: chapter.title,
      chapterId: chapter.id,
    }))
  ) || [];

  // Get main TOC entries (العناوين الرئيسية فقط)
  const rawTocEntries = book?.chapters
    .filter(chapter => {
      const isMainSection =
        chapter.title.includes('الإلهيات') ||
        chapter.title.includes('النبوات') ||
        chapter.title.includes('الإمامة') ||
        chapter.title.includes('المعاد') ||
        chapter.title.includes('العدل') ||
        chapter.title.includes('المقدمة') ||
        chapter.title.includes('الفهرس') ||
        chapter.title.length < 30;
      return isMainSection;
    })
    .map(chapter => {
      const firstPageIndex = allPages.findIndex(p => p.chapterId === chapter.id);
      return {
        title: chapter.title,
        chapterId: chapter.id,
        pageNumber: firstPageIndex >= 0 ? getPageNumber(allPages[firstPageIndex], firstPageIndex) : 1,
        pageIndex: firstPageIndex,
      };
    }) || [];

  const tocEntries = rawTocEntries.length > 0
    ? rawTocEntries
    : (book?.chapters.map(chapter => {
        const firstPageIndex = allPages.findIndex(p => p.chapterId === chapter.id);
        return {
          title: chapter.title,
          chapterId: chapter.id,
          pageNumber: firstPageIndex >= 0 ? getPageNumber(allPages[firstPageIndex], firstPageIndex) : 1,
          pageIndex: firstPageIndex,
        };
      }) || []);

  useEffect(() => {
    loadBook();
  }, [params.id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setBook(data);
      } else {
        setBook(null);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!contentRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0');
            setCurrentPageIndex(pageIndex);

            // Load next pages
            setLoadedPageIndices(prev => {
              const newSet = new Set(prev);
              for (let i = Math.max(0, pageIndex - 2); i < Math.min(allPages.length, pageIndex + 5); i++) {
                newSet.add(i);
              }
              return newSet;
            });
          }
        });
      },
      {
        root: contentRef.current,
        threshold: 0.5,
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [allPages.length]);

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < allPages.length) {
      setCurrentPageIndex(pageIndex);
      setLoadedPageIndices(prev => {
        const newSet = new Set(prev);
        for (let i = Math.max(0, pageIndex - 2); i < Math.min(allPages.length, pageIndex + 5); i++) {
          newSet.add(i);
        }
        return newSet;
      });

      const element = document.getElementById(`page-${pageIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToChapter = (chapterId: string, pageIndex: number) => {
    goToPage(pageIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#0d7377] border-t-transparent"></div>
          <p className="mt-6 text-xl text-gray-700 font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiBook className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <p className="text-2xl text-gray-600 font-arabic">الكتاب غير موجود</p>
        </div>
      </div>
    );
  }

  const currentPage = allPages[currentPageIndex];
  const currentPageNumber = currentPage ? getPageNumber(currentPage, currentPageIndex) : currentPageIndex + 1;

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f0]">
      {/* Header with Search */}
      <header className="bg-white border-b border-gray-300 shadow-sm flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FiBook className="w-5 h-5 text-[#0d7377] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 font-arabic truncate">
                  {book.title}
                </h1>
                <p className="text-xs text-gray-600 font-arabic truncate">{book.author}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في الكتاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-[#0d7377] focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents - Right Side */}
        <aside
          className="bg-white border-l border-gray-300 flex flex-col flex-shrink-0"
          style={{ width: `${TOC_CONFIG.sidebarWidth}px` }}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#0d7377] font-arabic">الفهرست</h2>
          </div>

          {/* TOC Table with Scroll */}
          <nav className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="border-collapse">
              <tbody>
                {tocEntries.map((entry) => {
                  const isActive = currentPage?.chapterId === entry.chapterId;

                  return (
                    <tr key={entry.chapterId}>
                      <td className="p-0">
                        <button
                          onClick={() => goToChapter(entry.chapterId, entry.pageIndex)}
                          className="transition-all font-arabic"
                          style={{
                            width: `${TOC_CONFIG.buttonWidth}px`,
                            height: `${TOC_CONFIG.rowHeight}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '0 16px',
                            fontSize: `${TOC_CONFIG.fontSize}px`,

                            // الألوان
                            backgroundColor: isActive ? TOC_CONFIG.activeBgColor : TOC_CONFIG.bgColor,
                            color: isActive ? TOC_CONFIG.activeTextColor : TOC_CONFIG.textColor,

                            // الحدود
                            borderBottom: `1px solid ${TOC_CONFIG.borderColor}`,
                            borderLeft: isActive ? `4px solid ${TOC_CONFIG.activeBorderColor}` : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = TOC_CONFIG.hoverBgColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = TOC_CONFIG.bgColor;
                            }
                          }}
                        >
                          <span
                            className="flex-1 text-right leading-tight overflow-hidden"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: TOC_CONFIG.maxLines,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              maxWidth: `${TOC_CONFIG.maxTitleWidth}px`,
                              fontWeight: isActive ? 'bold' : 'normal',
                            }}
                          >
                            {entry.title}
                          </span>
                          <span
                            className="flex-shrink-0 font-bold"
                            style={{
                              fontSize: `${TOC_CONFIG.fontSize - 2}px`,
                              color: '#9ca3af',
                            }}
                          >
                            {entry.pageNumber}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </nav>
        </aside>

        {/* Content Area - Left Side with Infinite Scroll */}
        <main className="flex-1 overflow-y-auto bg-[#fafaf8]" ref={contentRef}>
          <div className="mx-auto" style={{ maxWidth: `${CONTENT_CONFIG.maxWidth}px` }}>
            {allPages.map((page, index) => {
              // Only render loaded pages
              if (!loadedPageIndices.has(index)) {
                return (
                  <div
                    key={page.id}
                    id={`page-${index}`}
                    data-page-index={index}
                    className="min-h-screen"
                  />
                );
              }

              const isFirstPageOfChapter = index === 0 || allPages[index - 1]?.chapterId !== page.chapterId;
              const { main, footnotes } = splitContentWithFootnotes(page.content);
              const paragraphs = main.split('\n\n').map(p => p.trim()).filter(Boolean);

              return (
                <div
                  key={page.id}
                  id={`page-${index}`}
                  data-page-index={index}
                  className="mb-8"
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                >
                  <div
                    className="bg-white shadow-sm border border-gray-200 min-h-[700px]"
                    style={{
                      paddingRight: `${CONTENT_CONFIG.paddingX}px`,
                      paddingLeft: `${CONTENT_CONFIG.paddingX}px`,
                      paddingTop: `${CONTENT_CONFIG.paddingY}px`,
                      paddingBottom: `${CONTENT_CONFIG.paddingY}px`,
                    }}
                  >
                    {/* Chapter Title - Only on first page */}
                    {isFirstPageOfChapter && (
                      <div
                        className="pb-2 border-b border-gray-300"
                        style={{ marginBottom: `${CONTENT_CONFIG.titleSpacing}px` }}
                      >
                        <h2
                          className="font-bold text-gray-900 font-arabic text-center"
                          style={{ fontSize: `${CONTENT_CONFIG.titleSize}px` }}
                        >
                          {page.chapterTitle}
                        </h2>
                      </div>
                    )}

                    {/* Page Number - Top Right Corner */}
                    <div className="flex justify-end mb-8">
                      <span
                        className="text-gray-500 font-arabic"
                        style={{ fontSize: `${CONTENT_CONFIG.fontSize - 3}px` }}
                      >
                        {getPageNumber(page, index)}
                      </span>
                    </div>

                    {/* Page Content */}
                    <div
                      className="font-arabic text-gray-900 text-justify"
                      dir="rtl"
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: CONTENT_CONFIG.lineHeight,
                      }}
                    >
                      {paragraphs.map((paragraph, idx) => {
                        // Check if it's a footnote separator
                        if (paragraph.trim().startsWith('────')) {
                          return (
                            <div key={idx} style={{ marginTop: '2em', marginBottom: '1.5em' }}>
                              <hr className="border-t border-gray-300" />
                            </div>
                          );
                        }

                        const isQuestion = /^\s*(\u0633\u0624\u0627\u0644|\u0627\u0644\u0633\u0624\u0627\u0644)\s*\d*\s*[:：]?\s*/.test(paragraph);
                        const isAnswer = /^\s*\u0627\u0644\u062c\u0648\u0627\u0628\s*[:：]?\s*/.test(paragraph);
                        if (isQuestion || isAnswer) {
                          return (
                            <p
                              key={idx}
                              className="font-bold text-right"
                              style={{
                                marginBottom: `${CONTENT_CONFIG.paragraphSpacing}em`,
                                fontSize: `${fontSize + 1}px`,
                              }}
                            >
                              {renderParagraphText(paragraph)}
                            </p>
                          );
                        }

                        // Check if it's a section title (shorter text, usually centered)
                        const isTitle = paragraph.trim().length < 50 &&
                          (paragraph.includes('سؤال') || paragraph.includes('الجواب') ||
                           paragraph.includes('المسألة') || paragraph.includes('الفصل'));

                        if (isTitle) {
                          return (
                            <p
                              key={idx}
                              className="font-bold text-center"
                              style={{
                                marginBottom: `${CONTENT_CONFIG.paragraphSpacing}em`,
                                fontSize: `${fontSize + 1}px`,
                              }}
                            >
                              {renderParagraphText(paragraph)}
                            </p>
                          );
                        }

                        // Regular paragraph
                        return (
                          <p
                            key={idx}
                            className="whitespace-pre-wrap"
                            style={{
                              marginBottom: `${CONTENT_CONFIG.paragraphSpacing}em`,
                              textIndent: '1.5em',
                            }}
                          >
                            {renderParagraphText(paragraph)}
                          </p>
                        );
                      })}

                      {footnotes.length > 0 && (
                        <div style={{ marginTop: '2em' }}>
                          <hr className="border-t border-gray-300 mb-4" />
                          <div className="space-y-2 text-sm text-gray-700">
                            {footnotes.map((note, noteIndex) => (
                              <p key={noteIndex} className="leading-relaxed">
                                {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End Marker */}
            {loadedPageIndices.size >= allPages.length && (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm font-bold text-gray-700 font-arabic">تمت نهاية الكتاب</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Bar */}
      <footer className="bg-white border-t border-gray-300 shadow-lg flex-shrink-0">
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            {/* Right: Page Counter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-arabic">الصفحة:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                <span className="text-base font-bold text-[#0d7377] font-arabic">
                  {currentPageNumber}
                </span>
                <span className="text-xs text-gray-600 font-arabic">من</span>
                <span className="text-base font-bold text-gray-700 font-arabic">{allPages.length}</span>
              </div>
            </div>

            {/* Center: Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="الصفحة السابقة"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => goToPage(currentPageIndex + 1)}
                disabled={currentPageIndex === allPages.length - 1}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="الصفحة التالية"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Left: Font Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-arabic">الخط:</span>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2.5 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                أ-
              </button>
              <span className="text-sm text-gray-700 font-arabic w-12 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="px-2.5 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                أ+
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
