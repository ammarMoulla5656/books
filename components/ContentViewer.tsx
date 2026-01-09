'use client';

import { Book, Section } from '@/lib/types';
import { useStore } from '@/lib/store';
import { FiChevronLeft, FiChevronRight, FiBookmark } from 'react-icons/fi';
import { addBookmarkLocal } from '@/lib/localStorage';
import { useState } from 'react';

interface ContentViewerProps {
  book: Book;
  section: Section | undefined;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function ContentViewer({ book, section, onNavigate }: ContentViewerProps) {
  const { readingSettings, addBookmark: addBookmarkToStore } = useStore();
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleAddBookmark = async () => {
    if (!section || !selectedText.trim()) return;

    const id = `bookmark-${Date.now()}`;
    const bookmark = {
      id,
      bookId: book.id,
      chapterId: '',
      sectionId: section.id,
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

  // Process content to highlight issue numbers
  const processContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Match patterns like "مسألة 123:" or "فتوى 45:"
      const regex = /(مسألة|فتوى)\s+(\d+):/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${index}-${lastIndex}`}>
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }

        // Add highlighted issue number
        parts.push(
          <span key={`issue-${index}-${match.index}`} className="issue-number">
            {match[0]}
          </span>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(
          <span key={`text-${index}-${lastIndex}`}>
            {line.substring(lastIndex)}
          </span>
        );
      }

      return (
        <p key={index} className="mb-4">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 arabic-text">
          اختر فصلاً من القائمة
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Section Title */}
        <h1
          className="text-3xl font-bold mb-8 text-gray-900 dark:text-white arabic-text"
          style={{ fontSize: `${readingSettings.fontSize + 8}px` }}
        >
          {section.title}
        </h1>

        {/* Content */}
        <div
          className="prose dark:prose-invert max-w-none arabic-text text-gray-800 dark:text-gray-200"
          style={{
            fontSize: `${readingSettings.fontSize}px`,
            lineHeight: readingSettings.lineSpacing,
          }}
          onMouseUp={handleTextSelection}
        >
          {processContent(section.content)}
        </div>

        {/* Bookmark Button (shows when text is selected) */}
        {selectedText && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={handleAddBookmark}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2 arabic-text"
            >
              <FiBookmark className="w-5 h-5" />
              إضافة علامة مرجعية
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('next')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors arabic-text"
          >
            <FiChevronLeft className="w-5 h-5" />
            التالي
          </button>

          <button
            onClick={() => onNavigate('prev')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors arabic-text"
          >
            السابق
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
