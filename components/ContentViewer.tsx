'use client';

import { Book, Chapter } from '@/lib/types';
import { useStore } from '@/lib/store';
import { FiBookmark, FiChevronUp } from 'react-icons/fi';
import { addBookmarkLocal } from '@/lib/localStorage';
import { useState, useRef, useEffect } from 'react';

interface ContentViewerProps {
  book: Book;
  scrollToChapterId?: string | null;
}

export default function ContentViewer({ book, scrollToChapterId }: ContentViewerProps) {
  const { readingSettings, addBookmark: addBookmarkToStore } = useStore();
  const [selectedText, setSelectedText] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Extract all pages from all chapters
  const allPages = book.chapters.flatMap(chapter =>
    chapter.sections.map(section => ({
      chapter,
      section,
      pageNumber: extractPageNumber(section.title) || section.order,
    }))
  ).sort((a, b) => a.pageNumber - b.pageNumber);

  // Scroll to chapter when selected from TOC
  useEffect(() => {
    if (scrollToChapterId && chapterRefs.current.has(scrollToChapterId)) {
      const element = chapterRefs.current.get(scrollToChapterId);
      if (element && contentRef.current) {
        const containerRect = contentRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = contentRef.current.scrollTop + elementRect.top - containerRect.top - 20;

        contentRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [scrollToChapterId]);

  // Track scroll position and update current page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = contentRef.current?.scrollTop || 0;
      const windowHeight = contentRef.current?.clientHeight || 0;

      // Show scroll to top button after scrolling down
      setShowScrollTop(scrollPosition > 500);

      // Find which page is currently in view
      for (const [pageNum, element] of pageRefs.current.entries()) {
        const rect = element.getBoundingClientRect();
        const containerRect = contentRef.current?.getBoundingClientRect();

        if (containerRect && rect.top <= containerRect.top + 200 && rect.bottom >= containerRect.top + 200) {
          setCurrentPageNumber(pageNum);
          break;
        }
      }
    };

    const container = contentRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [allPages]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleAddBookmark = async () => {
    if (!selectedText.trim()) return;

    const id = `bookmark-${Date.now()}`;
    const bookmark = {
      id,
      bookId: book.id,
      chapterId: '',
      sectionId: '',
      text: selectedText,
      createdAt: new Date(),
    };

    try {
      addBookmarkLocal(bookmark);
      addBookmarkToStore(bookmark);
      alert('تمت إضافة العلامة المرجعية بنجاح');
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      alert('حدث خطأ أثناء إضافة العلامة المرجعية');
    }
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPage = (pageNumber: number) => {
    const element = pageRefs.current.get(pageNumber);
    if (element && contentRef.current) {
      const containerRect = contentRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = contentRef.current.scrollTop + elementRect.top - containerRect.top - 20;

      contentRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  };

  // Extract page number from section title
  function extractPageNumber(title: string): number | null {
    const match = title.match(/صفحة\s+(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // Process content with proper formatting for poetry and footnotes
  const processContent = (content: string) => {
    const separatorPattern = /\n(─+)\n/;
    const parts = content.split(separatorPattern);

    if (parts.length >= 3) {
      const mainContent = parts[0];
      const footnotesContent = parts[2];

      return (
        <>
          <div className="mb-8 leading-relaxed whitespace-pre-wrap">
            {mainContent}
          </div>

          <div className="my-6">
            <hr className="border-t-2 border-gray-400 dark:border-gray-600" />
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {footnotesContent}
          </div>
        </>
      );
    }

    return (
      <div className="leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  return (
    <div ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth bg-gray-50 dark:bg-gray-900">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-6 z-40 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-4 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          title="العودة للأعلى"
        >
          <FiChevronUp className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Chapters Container */}
        <div className="space-y-8">
          {book.chapters.map((chapter, chapterIndex) => (
            <div
              key={chapter.id}
              ref={(el) => {
                if (el) chapterRefs.current.set(chapter.id, el);
              }}
              className="chapter-container"
            >
              {/* Chapter Card */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Chapter Header - Smaller */}
                <div className="bg-[#1a5f3f] dark:bg-[#0d1419] text-white px-4 py-2">
                  <h2 className="text-base font-semibold arabic-text">
                    {chapter.title}
                  </h2>
                </div>

                {/* Chapter Content */}
                <div className="p-6">
                  {chapter.sections.map((section, sectionIndex) => (
                    <div key={section.id}>
                      <div
                        className="max-w-none arabic-text text-gray-900 dark:text-gray-100 text-justify leading-relaxed"
                        style={{
                          fontSize: `${readingSettings.fontSize}px`,
                          lineHeight: readingSettings.lineSpacing,
                        }}
                        onMouseUp={handleTextSelection}
                      >
                        {processContent(section.content)}
                      </div>

                      {/* Page Separator with Page Number */}
                      {sectionIndex < chapter.sections.length - 1 && (
                        <div className="my-8 flex items-center justify-center gap-3">
                          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">✦</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {section.order}
                            </span>
                          </div>
                          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Separator */}
              {chapterIndex < book.chapters.length - 1 && (
                <div className="h-8"></div>
              )}
            </div>
          ))}
        </div>

        {/* End of Book Marker */}
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 arabic-text">
          <div className="text-2xl mb-2">✦</div>
          <div className="text-sm font-semibold">نهاية الكتاب</div>
          <div className="text-xs mt-1">{book.title}</div>
        </div>
      </div>

      {/* Bookmark Button (shows when text is selected) */}
      {selectedText && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleAddBookmark}
            className="bg-[#1a5f3f] dark:bg-[#2d7a52] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#154d33] dark:hover:bg-[#236643] transition-colors flex items-center gap-2 arabic-text"
          >
            <FiBookmark className="w-5 h-5" />
            إضافة علامة مرجعية
          </button>
        </div>
      )}
    </div>
  );
}
