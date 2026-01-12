'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Book } from '@/lib/types';
import { FiBook, FiMenu, FiX, FiChevronDown, FiSettings, FiChevronUp } from 'react-icons/fi';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['الإلهيات']));
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);

  useVisitorTracking(`/books/${params.id}`, 'page_view');

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

        if (data?.chapters?.length) {
          setCurrentChapterId(data.chapters[0].id);
        }
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

  const scrollToChapter = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      const offset = 80;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsTocOpen(false);
  };

  // Group chapters hierarchically
  const groupedChapters = book?.chapters.reduce((groups: Record<string, typeof book.chapters>, chapter) => {
    const isGroupHeader =
      chapter.title.includes('الإلهيات') ||
      chapter.title.includes('الفهرس') ||
      chapter.title.includes('القهروس') ||
      chapter.title.length < 25;

    if (isGroupHeader) {
      groups[chapter.title] = [];
    } else {
      const lastGroupKey = Object.keys(groups).pop() || 'عام';
      if (!groups[lastGroupKey]) groups[lastGroupKey] = [];
      groups[lastGroupKey].push(chapter);
    }

    return groups;
  }, {} as Record<string, typeof book.chapters>) || {};

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f0] to-[#e8e8e0]">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f0] to-[#e8e8e0]">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Right: Menu Button & Book Title */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="فتح الفهرست"
              >
                {isTocOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FiBook className="w-5 h-5 text-[#0d7377] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 font-arabic truncate">
                    {book.title}
                  </h1>
                  <p className="text-xs text-gray-600 font-arabic truncate">{book.author}</p>
                </div>
              </div>
            </div>

            {/* Left: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                aria-label="الإعدادات"
              >
                <FiSettings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute left-4 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 z-50">
            <h3 className="text-sm font-bold mb-3 font-arabic">حجم الخط</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                أ-
              </button>
              <span className="text-sm flex-1 text-center font-arabic">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                أ+
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Table of Contents Sidebar */}
      <aside
        className={`fixed top-16 right-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isTocOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#0d7377]">
            <h2 className="text-xl font-bold text-[#0d7377] font-arabic flex items-center gap-2">
              <FiBook className="w-5 h-5" />
              الفهرست
            </h2>
          </div>

          {/* Book Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-br from-[#e0f4f4] to-[#d4edda] rounded-xl">
            <h3 className="text-sm font-bold text-gray-900 font-arabic mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs text-gray-700 font-arabic">{book.author}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <span>{book.chapters.length} فصل</span>
              <span>•</span>
              <span>{book.pageCount || 0} صفحة</span>
            </div>
          </div>

          {/* Grouped TOC */}
          <nav className="space-y-1">
            {Object.entries(groupedChapters).map(([groupName, chapters]) => (
              <div key={groupName} className="mb-3">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm font-bold text-gray-900 font-arabic text-right flex-1">
                    {groupName}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      expandedGroups.has(groupName) ? '' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Group Items */}
                {expandedGroups.has(groupName) && (
                  <div className="mr-4 mt-1 space-y-0.5 border-r-2 border-gray-200">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => scrollToChapter(chapter.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition-all font-arabic text-sm mr-2 ${
                          currentChapterId === chapter.id
                            ? 'bg-[#0d7377] text-white font-medium shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="line-clamp-2">{chapter.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isTocOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 top-16"
          onClick={() => setIsTocOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Content Container */}
          <div className="space-y-6">
            {book.chapters.map((chapter, chapterIndex) => (
              <article
                key={chapter.id}
                id={`chapter-${chapter.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Chapter Header */}
                <header className="bg-gradient-to-r from-[#0d7377] to-[#14a3a8] px-6 py-4">
                  <h2 className="text-xl font-bold text-white font-arabic">
                    {chapter.title}
                  </h2>
                </header>

                {/* Chapter Content */}
                <div className="p-8">
                  {chapter.sections.map((section, sectionIndex) => (
                    <div key={section.id}>
                      {/* Section Content */}
                      <div
                        className="prose prose-lg max-w-none font-arabic text-gray-900 leading-relaxed text-justify"
                        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                      >
                        {section.content.split('\n\n').map((paragraph, idx) => {
                          // Check if it's a footnote separator
                          if (paragraph.trim().startsWith('────')) {
                            return (
                              <div key={idx} className="my-8">
                                <hr className="border-t-2 border-gray-300" />
                              </div>
                            );
                          }

                          return (
                            <p key={idx} className="mb-4 whitespace-pre-wrap">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>

                      {/* Page Separator */}
                      {sectionIndex < chapter.sections.length - 1 && (
                        <div className="my-10 flex items-center justify-center gap-4">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#0d7377] to-transparent" />
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#e0f4f4] to-[#d4edda] shadow-sm">
                            <span className="text-sm font-medium text-[#0d7377]">صفحة</span>
                            <span className="text-base font-bold text-[#0d7377]">{section.order}</span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#0d7377] to-transparent" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}

            {/* End of Book */}
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white rounded-2xl shadow-lg">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-lg font-bold text-gray-900 font-arabic mb-1">تمت نهاية الكتاب</p>
                <p className="text-sm text-gray-600 font-arabic">{book.title}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 left-8 p-4 bg-[#0d7377] text-white rounded-full shadow-xl hover:bg-[#095557] transition-colors z-30"
        aria-label="العودة للأعلى"
      >
        <FiChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
}
