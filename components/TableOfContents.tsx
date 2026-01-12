'use client';

import React, { useState, useMemo } from 'react';
import { Book } from '@/lib/types';
import { FiChevronLeft, FiChevronRight, FiBook, FiChevronDown } from 'react-icons/fi';

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['الهيات']));

  // Group chapters by main sections
  const groupedChapters = useMemo(() => {
    const groups: Record<string, typeof book.chapters> = {};
    let currentGroup = 'عام';

    book.chapters.forEach(chapter => {
      // Detect main section headers (short titles, typically section names)
      const isGroupHeader =
        chapter.title.includes('الهيات') ||
        chapter.title.includes('الفهرس') ||
        chapter.title.includes('القهروس') ||
        chapter.title.length < 25;

      if (isGroupHeader) {
        currentGroup = chapter.title;
        groups[currentGroup] = [];
      } else {
        if (!groups[currentGroup]) {
          groups[currentGroup] = [];
        }
        groups[currentGroup].push(chapter);
      }
    });

    return groups;
  }, [book.chapters]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 bg-[#1a5f3f] dark:bg-[#0d1419] text-white p-2 rounded-lg shadow-lg hover:bg-[#154d33] dark:hover:bg-[#1a2a35] transition-colors lg:hidden"
        title="قائمة المحتويات"
      >
        <FiBook className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed lg:relative top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white arabic-text flex items-center gap-2">
              <FiBook className="w-4 h-4" />
              الفهرست
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Book Title */}
          <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 arabic-text line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 arabic-text mt-1">
              {typeof book.category === 'string' ? book.category : book.category.arabicName}
            </p>
          </div>

          {/* Grouped TOC */}
          <nav className="space-y-1">
            {Object.entries(groupedChapters).map(([groupName, chapters]) => (
              <div key={groupName} className="toc-group">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-900 dark:text-white arabic-text flex-1 text-right">
                    {groupName}
                  </span>
                  <FiChevronDown
                    className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform ${
                      expandedGroups.has(groupName) ? '' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Group Items */}
                {expandedGroups.has(groupName) && (
                  <div className="mr-2 mt-0.5 space-y-0.5">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => onSectionSelect(chapter.id, chapter.sections[0]?.id)}
                        className={`w-full text-right px-2 py-1 rounded transition-colors arabic-text text-xs ${
                          currentChapterId === chapter.id
                            ? 'bg-[#1a5f3f] dark:bg-[#0d1419] text-white font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
