/* ===================================
   البيانات التجريبية - المكتبة الإسلامية
   =================================== */

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface Author {
  id: string;
  name: string;
  fullName: string;
  era: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
  type: string;
  chaptersCount: number;
  pagesCount: number;
  isFeatured: boolean;
  chapters: Chapter[];
}

// التصنيفات
export const categories: Category[] = [
  {
    id: 'fiqh',
    name: 'الفقه',
    icon: '⚖️',
    description: 'أحكام الشريعة الإسلامية وفروعها',
    count: 45
  },
  {
    id: 'aqeedah',
    name: 'العقائد',
    icon: '🕌',
    description: 'أصول الدين والإيمان',
    count: 32
  },
  {
    id: 'usul',
    name: 'أصول الفقه',
    icon: '📜',
    description: 'قواعد استنباط الأحكام الشرعية',
    count: 28
  },
  {
    id: 'tafsir',
    name: 'التفسير',
    icon: '📖',
    description: 'تفسير القرآن الكريم وعلومه',
    count: 38
  },
  {
    id: 'hadith',
    name: 'الحديث',
    icon: '📚',
    description: 'أحاديث أهل البيت عليهم السلام',
    count: 52
  },
  {
    id: 'history',
    name: 'التاريخ',
    icon: '🏛️',
    description: 'تاريخ الإسلام وسيرة المعصومين',
    count: 41
  },
  {
    id: 'ethics',
    name: 'الأخلاق',
    icon: '💎',
    description: 'الأخلاق والآداب الإسلامية',
    count: 35
  },
  {
    id: 'dua',
    name: 'الأدعية',
    icon: '🤲',
    description: 'أدعية أهل البيت والزيارات',
    count: 29
  }
];

// المؤلفون
export const authors: Author[] = [
  {
    id: 'kulayni',
    name: 'الشيخ الكليني',
    fullName: 'محمد بن يعقوب الكليني',
    era: '329 هـ'
  },
  {
    id: 'saduq',
    name: 'الشيخ الصدوق',
    fullName: 'محمد بن علي بن بابويه القمي',
    era: '381 هـ'
  },
  {
    id: 'tusi',
    name: 'الشيخ الطوسي',
    fullName: 'محمد بن الحسن الطوسي',
    era: '460 هـ'
  },
  {
    id: 'mufid',
    name: 'الشيخ المفيد',
    fullName: 'محمد بن محمد بن النعمان',
    era: '413 هـ'
  },
  {
    id: 'majlisi',
    name: 'العلامة المجلسي',
    fullName: 'محمد باقر المجلسي',
    era: '1111 هـ'
  },
  {
    id: 'tabatabaei',
    name: 'العلامة الطباطبائي',
    fullName: 'محمد حسين الطباطبائي',
    era: '1402 هـ'
  }
];

// الكتب المميزة (sample data)
export const featuredBooks: Book[] = [
  {
    id: 'kafi',
    title: 'الكافي',
    author: 'kulayni',
    category: 'hadith',
    cover: 'https://via.placeholder.com/300x400/0d7377/ffffff?text=الكافي',
    description: 'من أهم كتب الحديث عند الشيعة الإمامية، جمعه الشيخ الكليني على مدى عشرين عاماً',
    type: 'structured',
    chaptersCount: 34,
    pagesCount: 4500,
    isFeatured: true,
    chapters: []
  },
  {
    id: 'mizan',
    title: 'الميزان في تفسير القرآن',
    author: 'tabatabaei',
    category: 'tafsir',
    cover: 'https://via.placeholder.com/300x400/14a3a8/ffffff?text=الميزان',
    description: 'تفسير علمي وفلسفي شامل للقرآن الكريم بأسلوب معاصر',
    type: 'structured',
    chaptersCount: 20,
    pagesCount: 8000,
    isFeatured: true,
    chapters: []
  },
  {
    id: 'bihar',
    title: 'بحار الأنوار',
    author: 'majlisi',
    category: 'hadith',
    cover: 'https://via.placeholder.com/300x400/c9a227/ffffff?text=بحار+الأنوار',
    description: 'موسوعة حديثية جامعة في 110 مجلدات',
    type: 'structured',
    chaptersCount: 110,
    pagesCount: 25000,
    isFeatured: true,
    chapters: []
  },
  {
    id: 'sahifa',
    title: 'الصحيفة السجادية',
    author: 'saduq',
    category: 'dua',
    cover: 'https://via.placeholder.com/300x400/1e5631/ffffff?text=الصحيفة+السجادية',
    description: 'أدعية الإمام زين العابدين عليه السلام - إنجيل آل محمد',
    type: 'structured',
    chaptersCount: 54,
    pagesCount: 300,
    isFeatured: true,
    chapters: []
  }
];

// دوال مساعدة
export function getAuthorName(authorId: string): string {
  const author = authors.find(a => a.id === authorId);
  return author ? author.name : 'غير معروف';
}

export function getCategoryName(categoryId: string): string {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : 'غير معروف';
}
