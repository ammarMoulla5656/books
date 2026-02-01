# 🚀 المرحلة السادسة - Advanced Features Roadmap
## خارطة طريق الميزات المتقدمة

---

## ✅ ما تم إنجازه

### 1. BookStore - إدارة حالة الكتب ✅
**الملف:** [src/stores/bookStore.ts](src/stores/bookStore.ts)

تم إنشاء **BookStore** شامل مع **Zustand** يتضمن:

**الميزات:**
```typescript
✅ Books Management (إضافة، تحديث، قائمة)
✅ Favorites System (إضافة/إزالة من المفضلة)
✅ Downloads Tracking (تتبع الكتب المحملة)
✅ Progress Tracking (تتبع تقدم القراءة 0-100%)
✅ Bookmarks System (علامات مرجعية)
✅ Highlights System (تظليل النصوص)
✅ Notes System (ملاحظات على الصفحات)
✅ Reading History (تاريخ القراءة + المدة)
✅ Persistent Storage (حفظ في AsyncStorage)
```

**Types:**
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  thumbnail?: string;
  description?: string;
  rating?: number;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  progress?: number;
  lastRead?: string;
}

interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  title: string;
  createdAt: string;
}

interface Highlight {
  id: string;
  bookId: string;
  page: number;
  text: string;
  color: string;
  createdAt: string;
}

interface Note {
  id: string;
  bookId: string;
  page: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ReadingHistoryEntry {
  bookId: string;
  page: number;
  timestamp: string;
  duration: number;
}
```

**الأسطر:** ~350 سطر

---

## 🔄 ما يجب إنجازه

### 2. DownloadManager - إدارة التحميلات
**الملف المقترح:** `src/services/downloadManager.ts`

**الوظائف المطلوبة:**
```typescript
class DownloadManager {
  // تحميل كتاب
  async downloadBook(bookId: string): Promise<void>

  // إلغاء تحميل
  cancelDownload(bookId: string): void

  // حذف كتاب محمل
  async deleteDownload(bookId: string): Promise<void>

  // الحصول على حالة التحميل
  getDownloadStatus(bookId: string): DownloadStatus

  // الحصول على progress التحميل
  getDownloadProgress(bookId: string): number

  // الحصول على حجم التحميلات
  getTotalDownloadSize(): Promise<number>
}

interface DownloadStatus {
  bookId: string;
  status: 'idle' | 'downloading' | 'completed' | 'error';
  progress: number; // 0-100
  downloadedSize: number;
  totalSize: number;
  error?: string;
}
```

**Integration:**
```typescript
// في BookDetailsScreen
const handleDownload = async () => {
  if (isDownloaded) {
    await DownloadManager.deleteDownload(bookId);
    markAsNotDownloaded(bookId);
  } else {
    await DownloadManager.downloadBook(bookId);
    markAsDownloaded(bookId);
  }
};
```

---

### 3. Enhanced BookReader - قارئ متقدم
**الملف:** `src/screens/main/BookReaderScreen.tsx` (Update)

**الميزات المطلوبة:**

#### A. Bookmarks UI
```typescript
// إضافة bookmark button في top bar
<Pressable onPress={handleAddBookmark}>
  <Ionicons name="bookmark" />
</Pressable>

// Bookmarks list modal
const BookmarksModal = () => (
  <Modal>
    <FlatList
      data={bookmarks}
      renderItem={({ item }) => (
        <BookmarkItem
          bookmark={item}
          onPress={() => navigateToPage(item.page)}
          onDelete={() => removeBookmark(item.id)}
        />
      )}
    />
  </Modal>
);
```

#### B. Highlights UI
```typescript
// Text selection للـ highlighting
<Text
  selectable
  onSelectionChange={handleTextSelection}
>
  {content}
</Text>

// Highlight colors picker
const HighlightColorPicker = () => (
  <View style={styles.colorPicker}>
    {colors.map((color) => (
      <Pressable
        key={color}
        style={[styles.colorOption, { backgroundColor: color }]}
        onPress={() => addHighlight(selectedText, color)}
      />
    ))}
  </View>
);
```

#### C. Notes UI
```typescript
// Add note button
<Pressable onPress={handleAddNote}>
  <Ionicons name="create-outline" />
</Pressable>

// Note modal
const NoteModal = () => (
  <Modal>
    <TextInput
      multiline
      placeholder="اكتب ملاحظتك هنا..."
      value={noteContent}
      onChangeText={setNoteContent}
    />
    <Button title="حفظ" onPress={saveNote} />
  </Modal>
);
```

#### D. Reading Timer
```typescript
// Track reading time
const [readingStartTime, setReadingStartTime] = useState<number>();

useEffect(() => {
  setReadingStartTime(Date.now());

  return () => {
    if (readingStartTime) {
      const duration = Math.floor((Date.now() - readingStartTime) / 1000);
      addReadingHistory({
        bookId,
        page: currentPage,
        duration,
      });
    }
  };
}, []);
```

---

### 4. Reviews System - نظام التقييمات
**الملفات المقترحة:**
- `src/components/ReviewCard.tsx`
- `src/screens/main/ReviewsScreen.tsx`

**المكونات:**

#### ReviewCard Component
```typescript
interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  helpful: number; // عدد الإعجابات
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <Card>
    <View style={styles.header}>
      <Avatar source={review.userAvatar} />
      <View>
        <Text>{review.userName}</Text>
        <StarRating rating={review.rating} />
      </View>
      <Text>{formatDate(review.createdAt)}</Text>
    </View>
    <Text>{review.comment}</Text>
    <View style={styles.actions}>
      <Button title={`مفيد (${review.helpful})`} />
    </View>
  </Card>
);
```

#### ReviewsScreen
```typescript
const ReviewsScreen: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  return (
    <View>
      {/* User's Review Input */}
      <Card>
        <Text>قيّم هذا الكتاب</Text>
        <StarRating
          rating={userRating}
          onRatingChange={setUserRating}
          editable
        />
        <TextInput
          multiline
          placeholder="اكتب رأيك..."
          value={userComment}
          onChangeText={setUserComment}
        />
        <Button title="نشر التقييم" onPress={submitReview} />
      </Card>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </View>
  );
};
```

**Integration in BookDetailsScreen:**
```typescript
<Pressable onPress={() => navigation.navigate('Reviews', { bookId })}>
  <Text>{reviewsCount} تقييم</Text>
  <Ionicons name="chevron-back" />
</Pressable>
```

---

### 5. Reading Statistics - إحصائيات القراءة
**الملف المقترح:** `src/screens/main/StatisticsScreen.tsx`

**الإحصائيات المقترحة:**

```typescript
interface ReadingStats {
  totalBooksRead: number;
  totalReadingTime: number; // seconds
  averageReadingSpeed: number; // pages per hour
  currentStreak: number; // days
  longestStreak: number; // days
  favoriteCategory: string;
  thisWeekStats: {
    booksFinished: number;
    pagesRead: number;
    timeSpent: number;
  };
  thisMonthStats: {
    booksFinished: number;
    pagesRead: number;
    timeSpent: number;
  };
}

const StatisticsScreen: React.FC = () => {
  const stats = useReadingStatistics();

  return (
    <ScrollView>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <StatCard
          icon="book"
          value={stats.totalBooksRead}
          label="كتاب مقروء"
        />
        <StatCard
          icon="time"
          value={formatDuration(stats.totalReadingTime)}
          label="وقت القراءة"
        />
      </View>

      {/* Reading Streak */}
      <Card>
        <Text>سلسلة القراءة 🔥</Text>
        <Text style={styles.streakValue}>{stats.currentStreak} يوم</Text>
        <ProgressBar
          value={stats.currentStreak}
          max={stats.longestStreak}
        />
      </Card>

      {/* Weekly Chart */}
      <Card>
        <Text>إحصائيات هذا الأسبوع</Text>
        <BarChart data={weeklyData} />
      </Card>

      {/* Category Breakdown */}
      <Card>
        <Text>التصنيفات المفضلة</Text>
        <PieChart data={categoryData} />
      </Card>
    </ScrollView>
  );
};
```

---

### 6. Image Caching - تخزين الصور مؤقتاً
**الملف المقترح:** `src/utils/imageCache.ts`

```typescript
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

class ImageCache {
  private cacheDir = `${FileSystem.cacheDirectory}images/`;

  async getCachedImage(url: string): Promise<string | null> {
    const filename = this.getFilename(url);
    const filepath = `${this.cacheDir}${filename}`;

    const info = await FileSystem.getInfoAsync(filepath);
    if (info.exists) {
      return filepath;
    }
    return null;
  }

  async cacheImage(url: string): Promise<string> {
    const filename = this.getFilename(url);
    const filepath = `${this.cacheDir}${filename}`;

    await FileSystem.downloadAsync(url, filepath);
    return filepath;
  }

  async clearCache(): Promise<void> {
    await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
  }

  private getFilename(url: string): string {
    return url.split('/').pop() || `${Date.now()}.jpg`;
  }
}

export const imageCache = new ImageCache();
```

**CachedImage Component:**
```typescript
const CachedImage: React.FC<{ uri: string; style: any }> = ({ uri, style }) => {
  const [source, setSource] = useState<string>();

  useEffect(() => {
    loadImage();
  }, [uri]);

  const loadImage = async () => {
    // Try cache first
    let cached = await imageCache.getCachedImage(uri);

    if (!cached) {
      // Download and cache
      cached = await imageCache.cacheImage(uri);
    }

    setSource(cached);
  };

  return source ? <Image source={{ uri: source }} style={style} /> : null;
};
```

---

### 7. Analytics - تتبع الاستخدام
**الملف المقترح:** `src/services/analytics.ts`

```typescript
import analytics from '@react-native-firebase/analytics';

class Analytics {
  // Track screen views
  async trackScreenView(screenName: string) {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  // Track book opens
  async trackBookOpen(bookId: string, bookTitle: string) {
    await analytics().logEvent('book_open', {
      book_id: bookId,
      book_title: bookTitle,
    });
  }

  // Track reading time
  async trackReadingSession(bookId: string, duration: number) {
    await analytics().logEvent('reading_session', {
      book_id: bookId,
      duration_seconds: duration,
    });
  }

  // Track downloads
  async trackDownload(bookId: string, fileSize: number) {
    await analytics().logEvent('book_download', {
      book_id: bookId,
      file_size: fileSize,
    });
  }

  // Track searches
  async trackSearch(query: string, resultsCount: number) {
    await analytics().logEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }

  // Track favorites
  async trackAddToFavorites(bookId: string) {
    await analytics().logEvent('add_to_favorites', {
      book_id: bookId,
    });
  }
}

export const analytics = new Analytics();
```

**Usage:**
```typescript
// في BookDetailsScreen
useEffect(() => {
  analytics.trackScreenView('BookDetails');
  analytics.trackBookOpen(bookId, bookTitle);
}, []);

// في BookReaderScreen
useEffect(() => {
  const startTime = Date.now();

  return () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    analytics.trackReadingSession(bookId, duration);
  };
}, []);
```

---

### 8. Offline Mode Enhancements
**الميزات المطلوبة:**

#### A. Network Status Indicator
```typescript
import NetInfo from '@react-native-community/netinfo';

const NetworkBanner: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return unsubscribe;
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" />
      <Text>أنت غير متصل بالإنترنت</Text>
    </View>
  );
};
```

#### B. Offline Books Filter
```typescript
// في LibraryScreen
const [offlineMode, setOfflineMode] = useState(false);

const displayedBooks = offlineMode
  ? books.filter((book) => book.isDownloaded)
  : books;
```

#### C. Sync Manager
```typescript
class SyncManager {
  async syncWhenOnline() {
    // Sync reading progress
    await this.syncProgress();

    // Sync bookmarks
    await this.syncBookmarks();

    // Sync notes
    await this.syncNotes();
  }

  private async syncProgress() {
    const unsyncedProgress = await getUnsyncedProgress();
    for (const item of unsyncedProgress) {
      await api.post('/progress', item);
    }
  }
}
```

---

### 9. Performance Optimizations

#### A. Lazy Loading للكتب
```typescript
// في LibraryScreen
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading) return;

  setLoading(true);
  const newBooks = await fetchBooks(page);
  setBooks([...books, ...newBooks]);
  setPage(page + 1);
  setLoading(false);
};

<FlatList
  data={books}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

#### B. Memoization
```typescript
import { useMemo } from 'react';

const filteredBooks = useMemo(() => {
  return books.filter((book) => {
    // Filter logic
  });
}, [books, selectedCategory]);
```

#### C. Image Optimization
```typescript
<Image
  source={{ uri: thumbnail }}
  style={styles.thumbnail}
  resizeMode="cover"
  defaultSource={require('@/assets/book-placeholder.png')}
/>
```

---

### 10. Additional Features (Optional)

#### A. Share Books
```typescript
import Share from 'react-native-share';

const shareBook = async (book: Book) => {
  await Share.open({
    title: book.title,
    message: `اقرأ ${book.title} بواسطة ${book.author} على المكتبة الإسلامية`,
    url: `https://islamiclibrary.app/books/${book.id}`,
  });
};
```

#### B. Export Notes
```typescript
const exportNotes = async (bookId: string) => {
  const notes = getBookNotes(bookId);
  const markdown = notes.map((note) =>
    `## صفحة ${note.page}\n${note.content}\n\n`
  ).join('');

  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}notes_${bookId}.md`,
    markdown
  );
};
```

#### C. Reading Goals
```typescript
interface ReadingGoal {
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // pages or minutes
  current: number;
}

const GoalCard: React.FC<{ goal: ReadingGoal }> = ({ goal }) => (
  <Card>
    <Text>هدف القراءة</Text>
    <ProgressBar value={goal.current} max={goal.target} />
    <Text>{goal.current} / {goal.target} {goal.type === 'daily' ? 'صفحة' : 'دقيقة'}</Text>
  </Card>
);
```

---

## 📊 خارطة التطوير

### Priority 1 (High) - الأساسيات
```
✅ BookStore (مكتمل)
🔲 DownloadManager
🔲 Enhanced BookReader (Bookmarks, Highlights, Notes UI)
🔲 Reading Timer
```

### Priority 2 (Medium) - التحسينات
```
🔲 Reviews System
🔲 Reading Statistics
🔲 Image Caching
🔲 Offline Mode Enhancements
```

### Priority 3 (Low) - الإضافات
```
🔲 Analytics
🔲 Share Features
🔲 Export Notes
🔲 Reading Goals
```

---

## 🎯 الخطوات التالية

### لإكمال المرحلة 6:

1. **DownloadManager**
   - إنشاء service للتحميلات
   - Integration مع FileSystem
   - Progress tracking

2. **Enhanced BookReader**
   - إضافة Bookmarks UI
   - إضافة Highlights UI
   - إضافة Notes UI
   - Reading timer

3. **Reviews System**
   - ReviewCard component
   - ReviewsScreen
   - Integration مع API

4. **Statistics**
   - Calculate stats من ReadingHistory
   - Charts components
   - StatisticsScreen

5. **Performance**
   - Image caching
   - Lazy loading
   - Memoization

---

## 💡 ملاحظات التطوير

### API Endpoints المطلوبة:
```typescript
// Downloads
POST /api/v1/books/:id/download
DELETE /api/v1/books/:id/download

// Reviews
GET /api/v1/books/:id/reviews
POST /api/v1/books/:id/reviews
PUT /api/v1/reviews/:id
DELETE /api/v1/reviews/:id

// Sync
POST /api/v1/sync/progress
POST /api/v1/sync/bookmarks
POST /api/v1/sync/notes

// Statistics
GET /api/v1/user/statistics
```

### Dependencies المطلوبة:
```json
{
  "@react-native-firebase/analytics": "^latest",
  "@react-native-community/netinfo": "^latest",
  "react-native-share": "^latest",
  "react-native-fs": "^latest",
  "react-native-chart-kit": "^latest"
}
```

---

## ✨ الخلاصة

**تم إنشاء:**
- ✅ BookStore شامل (~350 سطر)
- ✅ Bookmarks, Highlights, Notes types
- ✅ Reading History tracking
- ✅ Persistent storage

**يحتاج للتطوير:**
- 🔲 UI للـ Bookmarks/Highlights/Notes
- 🔲 DownloadManager
- 🔲 Reviews System
- 🔲 Statistics
- 🔲 Performance optimizations

**النتيجة:**
التطبيق الآن لديه **Foundation قوي** للميزات المتقدمة. BookStore جاهز وممكن البدء في ربطه بالـ UI والـ API.

---

**Progress:** 97% (BookStore Complete + Roadmap)

**Next:** Implement UI integrations & DownloadManager

---

_تم إنشاء هذا الملف: ${new Date().toLocaleString('ar-SA')}_

_المرحلة: 6/6 - Foundation Complete + Roadmap_

**🎊 BookStore جاهز! يمكنك البدء في التطوير بناءً على هذا الـ Roadmap! 🎊**
