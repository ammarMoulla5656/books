'use client';

import { Book } from '@/lib/types';
import { FiChevronLeft, FiChevronRight, FiBook } from 'react-icons/fi';
import { useState } from 'react';

interface TableOfContentsProps {
  book: Book;
  currentChapterId: string | null;
  currentSectionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSectionSelect: (chapterId: string, sectionId: string) => void;
}

export default function TableOfContents({
  book,
  currentChapterId,
  currentSectionId,
  isOpen,
  onToggle,
  onSectionSelect,
}: TableOfContentsProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set([currentChapterId || ''])
  );

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors lg:hidden"
        title="قائمة المحتويات"
      >
        <FiBook className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed lg:relative top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white arabic-text flex items-center gap-2">
              <FiBook />
              المحتويات
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Book Title */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 arabic-text">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 arabic-text mt-1">
              {typeof book.category === 'string' ? book.category : book.category.arabicName}
            </p>
          </div>

          {/* Chapters */}
          <nav>
            {book.chapters.map((chapter) => (
              <div key={chapter.id} className="mb-2">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-right"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 arabic-text flex-1">
                    {chapter.title}
                  </span>
                  <FiChevronLeft
                    className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                      expandedChapters.has(chapter.id) ? '-rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Sections */}
                {expandedChapters.has(chapter.id) && (
                  <div className="mr-4 mt-1 space-y-1">
                    {chapter.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => onSectionSelect(chapter.id, section.id)}
                        className={`w-full text-right p-2 rounded-lg transition-colors arabic-text ${
                          currentSectionId === section.id
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
