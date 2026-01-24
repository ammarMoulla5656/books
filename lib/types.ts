export interface Section {
  id: string;
  title: string;
  content: string;
  order?: number;
  pageCount?: number; // عدد الصفحات في هذا القسم
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Part {
  id: string;
  number: number; // رقم الجزء (١، ٢، ٣)
  title: string;
  chapters: Chapter[];
}

export interface Volume {
  id: string;
  number: number; // رقم المجلد
  title: string;
  coverImage: string;
  parts: Part[];
  pageCount?: number; // إجمالي الصفحات
}

export interface BookSeries {
  id: string;
  title: string; // مثل: منهاج الصالحين
  author: string;
  description?: string;
  category: string;
  coverImage: string; // صورة السلسلة
  volumes: Volume[];
  order: number;
  totalVolumes: number; // إجمالي عدد المجلدات
  createdAt?: Date;
  updatedAt?: Date;
}

// للتوافق مع الكود القديم
export interface Book {
  id: string;
  title: string;
  coverImage: string;
  category: string | Category; // يمكن أن يكون string أو كائن Category من API
  categoryId?: string; // معرف التصنيف
  order: number;
  chapters: Chapter[];
  volumeNumber?: number; // رقم المجلد إذا كان جزء من سلسلة
  seriesId?: string; // معرف السلسلة
  author?: string;
  pageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bookmark {
  id: string;
  bookId: string;
  volumeId?: string;
  partId?: string;
  chapterId: string;
  sectionId: string;
  text: string;
  pageNumber?: number;
  createdAt: Date;
}

export interface Highlight {
  id: string;
  bookId: string;
  sectionId: string;
  text: string;
  color: string; // yellow, green, blue, etc.
  startOffset: number;
  endOffset: number;
  createdAt: Date;
}

export interface ReadingSettings {
  fontSize: number;
  lineSpacing: number;
  darkMode: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  description?: string;
  icon?: string;
  order: number;
}
