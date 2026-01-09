import { Book, Bookmark, BookSeries, Category, Highlight } from './types';

const BOOKS_KEY = 'islamic-library-books';
const BOOKMARKS_KEY = 'islamic-library-bookmarks';
const BOOK_SERIES_KEY = 'islamic-library-book-series';
const CATEGORIES_KEY = 'islamic-library-categories';
const HIGHLIGHTS_KEY = 'islamic-library-highlights';

// Sample books data
const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'منهاج الصالحين ج1',
    coverImage: '/images/minhaj1.png',
    category: 'فتوائية',
    order: 1,
    chapters: [
      {
        id: 'ch1',
        title: 'المقدمة',
        sections: [
          {
            id: 'sec1',
            title: 'التقليد',
            content: 'مسألة 1: يجب على المكلف في عباداته وغيرها أن يكون مجتهداً أو مقلداً أو محتاطاً.\n\nمسألة 2: التقليد هو الالتزام بالعمل طبقاً لفتوى المجتهد الجامع للشرائط، وقد يطلق على العمل المذكور.',
          },
          {
            id: 'sec1-2',
            title: 'فصل المحرمات في الشريعة المقدسة',
            content: 'مسألة 3: المحرمات في الشريعة المقدسة كثيرة، وأهمها: الكذب، والغيبة، والنميمة.\n\nمسألة 4: يحرم الكذب في جميع الأحوال إلا في موارد خاصة.',
          },
        ],
      },
      {
        id: 'ch2',
        title: 'كتاب الطهارة',
        sections: [
          {
            id: 'sec2',
            title: 'المبحث الأول: أحكام الخلوة',
            content: 'مسألة 10: يجب في حال التخلي ستر العورة عن الناظر المميز ولو كان طفلاً مميزاً.\n\nمسألة 11: يجب على الإنسان في حال التخلي أن يستتر من الناظر بستار أو حائل أو بُعد.',
          },
          {
            id: 'sec2-2',
            title: 'المبحث الثاني: الوضوء',
            content: 'مسألة 20: الوضوء واجب لكل صلاة واجبة أو مستحبة.\n\nمسألة 21: يجب في الوضوء غسل الوجه من منبت شعر الرأس إلى طرف الذقن طولاً.',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'منهاج الصالحين ج2',
    coverImage: '/images/minhaj2.png',
    category: 'فتوائية',
    order: 2,
    chapters: [
      {
        id: 'ch3',
        title: 'كتاب الصلاة',
        sections: [
          {
            id: 'sec3',
            title: 'شروط الصلاة',
            content: 'مسألة 160: إذا احتمل حصول فترة في أثناء الوقت يجوز المبادرة إلى الصلاة في أول الوقت.\n\nمسألة 161: يشترط في صحة الصلاة الطهارة من الحدث والخبث.',
          },
        ],
      },
    ],
  },
];

// Sample categories
const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Jurisprudence',
    arabicName: 'فتوائية',
    description: 'كتب الفقه والفتاوى الشرعية',
    icon: 'book',
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Theology',
    arabicName: 'عقائدية',
    description: 'كتب العقيدة والتوحيد',
    icon: 'star',
    order: 2,
  },
  {
    id: 'cat-3',
    name: 'Ethics',
    arabicName: 'أخلاقية',
    description: 'كتب الأخلاق والآداب الإسلامية',
    icon: 'heart',
    order: 3,
  },
  {
    id: 'cat-4',
    name: 'Hadith',
    arabicName: 'حديثية',
    description: 'كتب الحديث والسنة النبوية',
    icon: 'message',
    order: 4,
  },
  {
    id: 'cat-5',
    name: 'Tafsir',
    arabicName: 'تفسيرية',
    description: 'كتب تفسير القرآن الكريم',
    icon: 'bookmark',
    order: 5,
  },
];

// Sample book series with volumes
const SAMPLE_BOOK_SERIES: BookSeries[] = [
  {
    id: 'series-1',
    title: 'منهاج الصالحين',
    author: 'السيد علي السيستاني',
    description: 'رسالة عملية شاملة في الأحكام الشرعية',
    category: 'فتوائية',
    coverImage: '/images/minhaj-series.png',
    order: 1,
    totalVolumes: 3,
    volumes: [
      {
        id: 'vol-1',
        number: 1,
        title: 'العبادات',
        coverImage: '/images/minhaj1.png',
        pageCount: 450,
        parts: [
          {
            id: 'part-1',
            number: 1,
            title: 'أحكام التقليد والطهارة',
            chapters: [
              {
                id: 'ch1',
                title: 'المقدمة',
                sections: [
                  {
                    id: 'sec1',
                    title: 'التقليد',
                    content: 'مسألة 1: يجب على المكلف في عباداته وغيرها أن يكون مجتهداً أو مقلداً أو محتاطاً.\n\nمسألة 2: التقليد هو الالتزام بالعمل طبقاً لفتوى المجتهد الجامع للشرائط، وقد يطلق على العمل المذكور.',
                    pageCount: 15,
                  },
                  {
                    id: 'sec1-2',
                    title: 'فصل المحرمات في الشريعة المقدسة',
                    content: 'مسألة 3: المحرمات في الشريعة المقدسة كثيرة، وأهمها: الكذب، والغيبة، والنميمة.\n\nمسألة 4: يحرم الكذب في جميع الأحوال إلا في موارد خاصة.',
                    pageCount: 12,
                  },
                ],
              },
              {
                id: 'ch2',
                title: 'كتاب الطهارة',
                sections: [
                  {
                    id: 'sec2',
                    title: 'المبحث الأول: أحكام الخلوة',
                    content: 'مسألة 10: يجب في حال التخلي ستر العورة عن الناظر المميز ولو كان طفلاً مميزاً.\n\nمسألة 11: يجب على الإنسان في حال التخلي أن يستتر من الناظر بستار أو حائل أو بُعد.',
                    pageCount: 20,
                  },
                  {
                    id: 'sec2-2',
                    title: 'المبحث الثاني: الوضوء',
                    content: 'مسألة 20: الوضوء واجب لكل صلاة واجبة أو مستحبة.\n\nمسألة 21: يجب في الوضوء غسل الوجه من منبت شعر الرأس إلى طرف الذقن طولاً.',
                    pageCount: 25,
                  },
                ],
              },
            ],
          },
          {
            id: 'part-2',
            number: 2,
            title: 'أحكام الصلاة والصيام',
            chapters: [
              {
                id: 'ch3',
                title: 'كتاب الصلاة',
                sections: [
                  {
                    id: 'sec3',
                    title: 'شروط الصلاة',
                    content: 'مسألة 160: إذا احتمل حصول فترة في أثناء الوقت يجوز المبادرة إلى الصلاة في أول الوقت.\n\nمسألة 161: يشترط في صحة الصلاة الطهارة من الحدث والخبث.',
                    pageCount: 30,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'vol-2',
        number: 2,
        title: 'المعاملات',
        coverImage: '/images/minhaj2.png',
        pageCount: 500,
        parts: [
          {
            id: 'part-3',
            number: 1,
            title: 'أحكام البيع والشراء',
            chapters: [
              {
                id: 'ch4',
                title: 'كتاب البيع',
                sections: [
                  {
                    id: 'sec4',
                    title: 'شروط البيع',
                    content: 'مسألة 300: يشترط في البيع أمور منها: البلوغ والعقل والاختيار.\n\nمسألة 301: يشترط في المتعاقدين القصد إلى إنشاء البيع.',
                    pageCount: 35,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'vol-3',
        number: 3,
        title: 'النكاح والطلاق',
        coverImage: '/images/minhaj3.png',
        pageCount: 400,
        parts: [
          {
            id: 'part-4',
            number: 1,
            title: 'أحكام النكاح',
            chapters: [
              {
                id: 'ch5',
                title: 'كتاب النكاح',
                sections: [
                  {
                    id: 'sec5',
                    title: 'شروط النكاح',
                    content: 'مسألة 500: النكاح عقد يحتاج إلى إيجاب وقبول.\n\nمسألة 501: يشترط في المتعاقدين البلوغ والعقل.',
                    pageCount: 28,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Initialize books with sample data if empty
function initializeBooks(): void {
  if (typeof window === 'undefined') return;

  const existingBooks = localStorage.getItem(BOOKS_KEY);
  if (!existingBooks) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(SAMPLE_BOOKS));
  }
}

// Books CRUD operations
export function getAllBooksLocal(): Book[] {
  if (typeof window === 'undefined') return SAMPLE_BOOKS;

  initializeBooks();
  const booksJson = localStorage.getItem(BOOKS_KEY);
  if (!booksJson) return SAMPLE_BOOKS;

  try {
    return JSON.parse(booksJson);
  } catch {
    return SAMPLE_BOOKS;
  }
}

export function getBookByIdLocal(id: string): Book | null {
  const books = getAllBooksLocal();
  return books.find(book => book.id === id) || null;
}

export function addBookLocal(book: Book): void {
  if (typeof window === 'undefined') return;

  const books = getAllBooksLocal();
  books.push(book);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function updateBookLocal(id: string, updatedBook: Book): void {
  if (typeof window === 'undefined') return;

  const books = getAllBooksLocal();
  const index = books.findIndex(book => book.id === id);

  if (index !== -1) {
    books[index] = updatedBook;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
}

export function deleteBookLocal(id: string): void {
  if (typeof window === 'undefined') return;

  const books = getAllBooksLocal();
  const filteredBooks = books.filter(book => book.id !== id);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(filteredBooks));
}

// Search books
export function searchBooksLocal(searchTerm: string): Book[] {
  const books = getAllBooksLocal();
  const lowercaseSearch = searchTerm.toLowerCase();

  return books.filter(book => {
    // Search in title
    if (book.title.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in category
    if (book.category.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in chapters
    for (const chapter of book.chapters) {
      if (chapter.title.toLowerCase().includes(lowercaseSearch)) return true;

      // Search in sections
      for (const section of chapter.sections) {
        if (section.title.toLowerCase().includes(lowercaseSearch)) return true;
        if (section.content.toLowerCase().includes(lowercaseSearch)) return true;
      }
    }

    return false;
  });
}

// Bookmarks operations
export function getBookmarksLocal(): Bookmark[] {
  if (typeof window === 'undefined') return [];

  const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
  if (!bookmarksJson) return [];

  try {
    return JSON.parse(bookmarksJson);
  } catch {
    return [];
  }
}

export function addBookmarkLocal(bookmark: Bookmark): void {
  if (typeof window === 'undefined') return;

  const bookmarks = getBookmarksLocal();
  bookmarks.push(bookmark);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function deleteBookmarkLocal(id: string): void {
  if (typeof window === 'undefined') return;

  const bookmarks = getBookmarksLocal();
  const filteredBookmarks = bookmarks.filter(b => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
}

// Categories operations
function initializeCategories(): void {
  if (typeof window === 'undefined') return;

  const existingCategories = localStorage.getItem(CATEGORIES_KEY);
  if (!existingCategories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(SAMPLE_CATEGORIES));
  }
}

export function getAllCategoriesLocal(): Category[] {
  if (typeof window === 'undefined') return SAMPLE_CATEGORIES;

  initializeCategories();
  const categoriesJson = localStorage.getItem(CATEGORIES_KEY);
  if (!categoriesJson) return SAMPLE_CATEGORIES;

  try {
    return JSON.parse(categoriesJson);
  } catch {
    return SAMPLE_CATEGORIES;
  }
}

export function getCategoryByIdLocal(id: string): Category | null {
  const categories = getAllCategoriesLocal();
  return categories.find(cat => cat.id === id) || null;
}

export function addCategoryLocal(category: Category): void {
  if (typeof window === 'undefined') return;

  const categories = getAllCategoriesLocal();
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function updateCategoryLocal(id: string, updatedCategory: Category): void {
  if (typeof window === 'undefined') return;

  const categories = getAllCategoriesLocal();
  const index = categories.findIndex(cat => cat.id === id);

  if (index !== -1) {
    categories[index] = updatedCategory;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
}

export function deleteCategoryLocal(id: string): void {
  if (typeof window === 'undefined') return;

  const categories = getAllCategoriesLocal();
  const filteredCategories = categories.filter(cat => cat.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
}

// Book Series operations
function initializeBookSeries(): void {
  if (typeof window === 'undefined') return;

  const existingSeries = localStorage.getItem(BOOK_SERIES_KEY);
  if (!existingSeries) {
    localStorage.setItem(BOOK_SERIES_KEY, JSON.stringify(SAMPLE_BOOK_SERIES));
  }
}

export function getAllBookSeriesLocal(): BookSeries[] {
  if (typeof window === 'undefined') return SAMPLE_BOOK_SERIES;

  initializeBookSeries();
  const seriesJson = localStorage.getItem(BOOK_SERIES_KEY);
  if (!seriesJson) return SAMPLE_BOOK_SERIES;

  try {
    return JSON.parse(seriesJson);
  } catch {
    return SAMPLE_BOOK_SERIES;
  }
}

export function getBookSeriesByIdLocal(id: string): BookSeries | null {
  const series = getAllBookSeriesLocal();
  return series.find(s => s.id === id) || null;
}

export function addBookSeriesLocal(bookSeries: BookSeries): void {
  if (typeof window === 'undefined') return;

  const series = getAllBookSeriesLocal();
  series.push(bookSeries);
  localStorage.setItem(BOOK_SERIES_KEY, JSON.stringify(series));
}

export function updateBookSeriesLocal(id: string, updatedSeries: BookSeries): void {
  if (typeof window === 'undefined') return;

  const series = getAllBookSeriesLocal();
  const index = series.findIndex(s => s.id === id);

  if (index !== -1) {
    series[index] = updatedSeries;
    localStorage.setItem(BOOK_SERIES_KEY, JSON.stringify(series));
  }
}

export function deleteBookSeriesLocal(id: string): void {
  if (typeof window === 'undefined') return;

  const series = getAllBookSeriesLocal();
  const filteredSeries = series.filter(s => s.id !== id);
  localStorage.setItem(BOOK_SERIES_KEY, JSON.stringify(filteredSeries));
}

// Search in book series
export function searchBookSeriesLocal(searchTerm: string): BookSeries[] {
  const series = getAllBookSeriesLocal();
  const lowercaseSearch = searchTerm.toLowerCase();

  return series.filter(bookSeries => {
    // Search in title
    if (bookSeries.title.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in author
    if (bookSeries.author.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in category
    if (bookSeries.category.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in description
    if (bookSeries.description?.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in volumes
    for (const volume of bookSeries.volumes) {
      if (volume.title.toLowerCase().includes(lowercaseSearch)) return true;

      // Search in parts
      for (const part of volume.parts) {
        if (part.title.toLowerCase().includes(lowercaseSearch)) return true;

        // Search in chapters
        for (const chapter of part.chapters) {
          if (chapter.title.toLowerCase().includes(lowercaseSearch)) return true;

          // Search in sections
          for (const section of chapter.sections) {
            if (section.title.toLowerCase().includes(lowercaseSearch)) return true;
            if (section.content.toLowerCase().includes(lowercaseSearch)) return true;
          }
        }
      }
    }

    return false;
  });
}

// Highlights operations
export function getHighlightsLocal(): Highlight[] {
  if (typeof window === 'undefined') return [];

  const highlightsJson = localStorage.getItem(HIGHLIGHTS_KEY);
  if (!highlightsJson) return [];

  try {
    return JSON.parse(highlightsJson);
  } catch {
    return [];
  }
}

export function getHighlightsByBookIdLocal(bookId: string): Highlight[] {
  const highlights = getHighlightsLocal();
  return highlights.filter(h => h.bookId === bookId);
}

export function addHighlightLocal(highlight: Highlight): void {
  if (typeof window === 'undefined') return;

  const highlights = getHighlightsLocal();
  highlights.push(highlight);
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

export function deleteHighlightLocal(id: string): void {
  if (typeof window === 'undefined') return;

  const highlights = getHighlightsLocal();
  const filteredHighlights = highlights.filter(h => h.id !== id);
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(filteredHighlights));
}

export function updateHighlightLocal(id: string, updatedHighlight: Highlight): void {
  if (typeof window === 'undefined') return;

  const highlights = getHighlightsLocal();
  const index = highlights.findIndex(h => h.id === id);

  if (index !== -1) {
    highlights[index] = updatedHighlight;
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  }
}
