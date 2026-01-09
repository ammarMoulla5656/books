'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/lib/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="islamic-card group cursor-pointer overflow-hidden">
        <div className="relative h-64 w-full bg-gradient-to-br from-[#f5f1e8] to-[#e5dcc8] dark:from-[#1a2028] dark:to-[#141b22]">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-[#d4af37] text-6xl">📚</span>
              <span className="text-[#1a5f3f] dark:text-[#d4af37] text-sm font-semibold">لا توجد صورة</span>
            </div>
          )}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5 bg-gradient-to-b from-transparent to-[#f5f1e8]/30 dark:to-[#1a2028]/50">
          <h3 className="text-lg font-bold mb-3 text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text group-hover:text-[#d4af37] dark:group-hover:text-[#d4af37] transition-colors line-clamp-2">
            {book.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#2d7a54] dark:text-[#d4af37] arabic-text font-medium">
              {typeof book.category === 'string' ? book.category : book.category.arabicName}
            </p>
            <span className="text-xs px-3 py-1 rounded-full bg-[#1a5f3f]/10 dark:bg-[#d4af37]/20 text-[#1a5f3f] dark:text-[#d4af37] font-semibold">
              {book.chapters?.length || 0} فصل
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
