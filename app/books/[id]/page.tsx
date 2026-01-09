'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Book, Chapter, Section } from '@/lib/types';
import TableOfContents from '@/components/TableOfContents';
import ContentViewer from '@/components/ContentViewer';
import ReadingControls from '@/components/ReadingControls';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(true);

  // Track book page visit
  useVisitorTracking(`/books/${params.id}`, 'page_view');

  useEffect(() => {
    loadBook();
  }, [params.id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      // استخدام API بدلاً من localStorage
      const response = await fetch(`/api/books/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setBook(data);

        // Set first section as default
        if (data?.chapters?.length && data.chapters[0].sections?.length) {
          setCurrentChapterId(data.chapters[0].id);
          setCurrentSectionId(data.chapters[0].sections[0].id);
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

  const handleSectionSelect = (chapterId: string, sectionId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentSectionId(sectionId);
  };

  const navigateToSection = (direction: 'prev' | 'next') => {
    if (!book || !currentChapterId || !currentSectionId) return;

    const chapters = book.chapters;
    const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapterId);
    const currentChapter = chapters[currentChapterIndex];
    const currentSectionIndex = currentChapter.sections.findIndex(s => s.id === currentSectionId);

    if (direction === 'next') {
      if (currentSectionIndex < currentChapter.sections.length - 1) {
        // Next section in same chapter
        setCurrentSectionId(currentChapter.sections[currentSectionIndex + 1].id);
      } else if (currentChapterIndex < chapters.length - 1) {
        // First section of next chapter
        const nextChapter = chapters[currentChapterIndex + 1];
        setCurrentChapterId(nextChapter.id);
        setCurrentSectionId(nextChapter.sections[0].id);
      }
    } else {
      if (currentSectionIndex > 0) {
        // Previous section in same chapter
        setCurrentSectionId(currentChapter.sections[currentSectionIndex - 1].id);
      } else if (currentChapterIndex > 0) {
        // Last section of previous chapter
        const prevChapter = chapters[currentChapterIndex - 1];
        setCurrentChapterId(prevChapter.id);
        setCurrentSectionId(prevChapter.sections[prevChapter.sections.length - 1].id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 arabic-text">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 arabic-text">
            الكتاب غير موجود
          </p>
        </div>
      </div>
    );
  }

  const currentSection = book.chapters
    .find(ch => ch.id === currentChapterId)
    ?.sections.find(s => s.id === currentSectionId);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Table of Contents Sidebar */}
      <TableOfContents
        book={book}
        currentChapterId={currentChapterId}
        currentSectionId={currentSectionId}
        isOpen={isTocOpen}
        onToggle={() => setIsTocOpen(!isTocOpen)}
        onSectionSelect={handleSectionSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Reading Controls */}
        <ReadingControls />

        {/* Content Viewer */}
        <ContentViewer
          book={book}
          section={currentSection}
          onNavigate={navigateToSection}
        />
      </div>
    </div>
  );
}
