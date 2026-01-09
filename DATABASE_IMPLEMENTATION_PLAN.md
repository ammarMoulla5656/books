# 📊 خطة تطوير قاعدة البيانات / Database Implementation Plan

## ✅ المرحلة 1: إعداد قاعدة البيانات (مكتملة)

### تم إنجازه:
- ✅ تثبيت Prisma و NextAuth
- ✅ إنشاء schema شامل بـ 14 model
- ✅ تصميم هيكل قاعدة البيانات الكامل

### Schema Models:
1. **Admin** - للمدراء
2. **Category** - التصنيفات
3. **BookSeries** - سلاسل الكتب متعددة المجلدات
4. **Volume** - المجلدات
5. **Part** - الأجزاء
6. **Book** - الكتب الفردية
7. **Chapter** - الفصول
8. **Section** - الأقسام (المحتوى)
9. **UserSession** - جلسات المستخدمين
10. **Bookmark** - العلامات المرجعية
11. **Highlight** - التظليلات
12. **ReadingSettings** - إعدادات القراءة
13. **ThemeBackground** - خلفيات الثيمات
14. **Suggestion** - صندوق الاقتراحات
15. **VisitorLog** - سجل الزوار
16. **DailyStats** - إحصائيات يومية
17. **SystemSettings** - إعدادات النظام

---

## 🚀 المرحلة 2: الخطوات القادمة

### الخطوة 1: إعداد قاعدة البيانات
```bash
# إنشاء قاعدة بيانات PostgreSQL محلية أو استخدام خدمة سحابية
# خيار 1: استخدام Docker
docker run --name islamic-library-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres

# خيار 2: استخدام Supabase (مجاني)
# https://supabase.com

# خيار 3: استخدام Neon (مجاني)
# https://neon.tech

# تحديث .env
DATABASE_URL="postgresql://user:password@localhost:5432/islamic_library"

# تطبيق Schema
npx prisma migrate dev --name init
npx prisma generate
```

### الخطوة 2: إنشاء API Routes
سنحتاج إلى إنشاء API routes لكل عملية:

#### Authentication APIs:
- `POST /api/auth/admin/login` - تسجيل دخول المدير
- `POST /api/auth/admin/logout` - تسجيل خروج
- `GET /api/auth/admin/session` - التحقق من الجلسة

#### Categories APIs:
- `GET /api/categories` - جلب جميع التصنيفات
- `POST /api/admin/categories` - إضافة تصنيف
- `PUT /api/admin/categories/[id]` - تعديل تصنيف
- `DELETE /api/admin/categories/[id]` - حذف تصنيف

#### Books APIs:
- `GET /api/books` - جلب جميع الكتب
- `GET /api/books/[id]` - جلب كتاب معين
- `POST /api/admin/books` - إضافة كتاب
- `PUT /api/admin/books/[id]` - تعديل كتاب
- `DELETE /api/admin/books/[id]` - حذف كتاب
- `GET /api/books/search?q=query` - بحث

#### Book Series APIs:
- `GET /api/series` - جلب جميع السلاسل
- `GET /api/series/[id]` - جلب سلسلة مع مجلداتها
- `POST /api/admin/series` - إضافة سلسلة
- `PUT /api/admin/series/[id]` - تعديل سلسلة
- `DELETE /api/admin/series/[id]` - حذف سلسلة

#### Volume & Part APIs:
- `POST /api/admin/volumes` - إضافة مجلد
- `POST /api/admin/parts` - إضافة جزء
- `PUT /api/admin/volumes/[id]` - تعديل مجلد
- `PUT /api/admin/parts/[id]` - تعديل جزء

#### Chapter & Section APIs:
- `POST /api/admin/chapters` - إضافة فصل
- `POST /api/admin/sections` - إضافة قسم
- `PUT /api/admin/chapters/[id]` - تعديل فصل
- `PUT /api/admin/sections/[id]` - تعديل قسم

#### User Session APIs:
- `POST /api/session/init` - إنشاء جلسة جديدة
- `GET /api/session/[token]` - جلب بيانات الجلسة

#### Bookmarks APIs:
- `GET /api/bookmarks?session=[token]` - جلب العلامات
- `POST /api/bookmarks` - إضافة علامة
- `DELETE /api/bookmarks/[id]` - حذف علامة

#### Highlights APIs:
- `GET /api/highlights?session=[token]&book=[id]` - جلب التظليلات
- `POST /api/highlights` - إضافة تظليل
- `DELETE /api/highlights/[id]` - حذف تظليل

#### Upload APIs:
- `POST /api/upload/image` - رفع صورة الغلاف
- `POST /api/upload/background` - رفع خلفية الثيم
- `POST /api/upload/validate` - التحقق من أبعاد الصورة

#### Analytics APIs:
- `GET /api/admin/analytics/dashboard` - إحصائيات Dashboard
- `POST /api/analytics/track` - تسجيل زيارة
- `GET /api/admin/analytics/visitors` - تفاصيل الزوار

#### Suggestions APIs:
- `POST /api/suggestions` - إرسال اقتراح
- `GET /api/admin/suggestions` - جلب الاقتراحات
- `PUT /api/admin/suggestions/[id]` - تحديث حالة الاقتراح

### الخطوة 3: إنشاء Prisma Client Wrapper
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### الخطوة 4: إنشاء NextAuth Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Configure NextAuth for admin authentication
```

### الخطوة 5: إنشاء Admin Dashboard
الصفحات المطلوبة:
- `/secret-admin-panel-xyz` - صفحة تسجيل الدخول
- `/secret-admin-panel-xyz/dashboard` - لوحة التحكم الرئيسية
- `/secret-admin-panel-xyz/books` - إدارة الكتب
- `/secret-admin-panel-xyz/books/new` - إضافة كتاب
- `/secret-admin-panel-xyz/books/[id]/edit` - تعديل كتاب
- `/secret-admin-panel-xyz/series` - إدارة السلاسل
- `/secret-admin-panel-xyz/categories` - إدارة التصنيفات
- `/secret-admin-panel-xyz/suggestions` - صندوق الاقتراحات
- `/secret-admin-panel-xyz/analytics` - الإحصائيات المفصلة
- `/secret-admin-panel-xyz/settings` - الإعدادات

### الخطوة 6: إنشاء مكونات رفع الصور
```typescript
// components/admin/ImageUpload.tsx
- تحقق من الأبعاد
- ضغط الصورة
- معاينة
- رفع إلى Storage (Supabase Storage / Cloudinary / S3)
```

### الخطوة 7: إنشاء Session Management
```typescript
// lib/session.ts
- إنشاء session token للمستخدمين
- حفظ في cookie
- ربط Bookmarks & Highlights بالـ session
```

### الخطوة 8: Analytics Tracking
```typescript
// lib/analytics.ts
- تتبع الزوار
- تسجيل الصفحات
- حساب الزوار الحاليين (online now)
- إحصائيات يومية/شهرية/سنوية
```

### الخطوة 9: تطبيق Background Images
```typescript
// components/ThemeBackground.tsx
- جلب w.jpg للوضع النهاري
- جلب d.jpg للوضع الليلي
- تغيير ديناميكي
```

### الخطوة 10: نقل البيانات من localStorage
```typescript
// scripts/migrate-data.ts
- قراءة البيانات من localStorage
- تحويلها إلى Prisma models
- إدخالها في قاعدة البيانات
```

---

## 📋 المتطلبات التقنية

### Environment Variables (.env):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/islamic_library"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin Panel Secret Path
ADMIN_PANEL_SECRET="secret-admin-panel-xyz"

# Upload Storage (اختياري)
CLOUDINARY_URL="cloudinary://..."
# أو
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..."

# Session Secret
SESSION_SECRET="your-session-secret"
```

### Dependencies المطلوبة:
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "prisma": "^5.x",
    "next-auth": "^4.x",
    "bcryptjs": "^2.x",
    "@types/bcryptjs": "^2.x",
    "cloudinary": "^1.x",  // للصور
    "sharp": "^0.32.x",    // لمعالجة الصور
    "uuid": "^9.x"         // لإنشاء session tokens
  }
}
```

---

## 🔐 Security Considerations

### Admin Panel:
1. **Secret URL**: استخدام رابط سري مثل `/secret-admin-panel-xyz`
2. **Authentication**: تسجيل دخول إلزامي
3. **Session Management**: جلسات آمنة مع NextAuth
4. **Rate Limiting**: تحديد عدد محاولات تسجيل الدخول
5. **CSRF Protection**: حماية من CSRF attacks

### User Sessions:
1. **Anonymous Sessions**: لا تسجيل دخول، فقط session token في cookie
2. **Private Data**: كل مستخدم يرى bookmarks/highlights الخاصة به فقط
3. **Session Expiry**: انتهاء صلاحية الجلسة بعد فترة

### File Uploads:
1. **Validation**: التحقق من نوع الملف والحجم والأبعاد
2. **Sanitization**: تنظيف أسماء الملفات
3. **Storage**: استخدام CDN آمن
4. **Image Optimization**: ضغط الصور تلقائياً

---

## 📊 Dashboard Analytics المطلوبة

### الإحصائيات الرئيسية:
1. **عدد المستخدمين أونلاين الآن**
   - حساب الجلسات النشطة في آخر 5 دقائق

2. **عدد الزوار اليوم/الشهر/السنة**
   - من جدول `VisitorLog` مع فلترة حسب التاريخ

3. **عدد الكتب**
   - Count من جدول `Book` + `BookSeries`

4. **المساحة المستخدمة**
   - حساب حجم جميع الصور المرفوعة

5. **الاقتراحات**
   - عدد الاقتراحات (pending, reviewed, implemented)

6. **الإحصائيات التفصيلية**:
   - أكثر الكتب قراءة
   - أكثر الأقسام بحثاً
   - عدد العلامات المرجعية
   - عدد التظليلات

---

## 🎨 UI/UX للـ Admin Panel

### التصميم:
- ✅ استخدام نفس التصميم الإسلامي
- ✅ Dashboard بإحصائيات واضحة
- ✅ جداول لإدارة البيانات
- ✅ نماذج سهلة لإضافة/تعديل
- ✅ معاينات للكتب
- ✅ Drag & Drop لترتيب الفصول
- ✅ Rich Text Editor للمحتوى
- ✅ Image Upload مع Preview

### المكونات المطلوبة:
1. `AdminLayout` - Layout خاص بالAdmin
2. `StatsCard` - بطاقات الإحصائيات
3. `DataTable` - جداول البيانات
4. `BookForm` - نموذج الكتاب
5. `SeriesForm` - نموذج السلسلة
6. `VolumeManager` - إدارة المجلدات
7. `ChapterEditor` - محرر الفصول
8. `ImageUploader` - رافع الصور
9. `SuggestionViewer` - عارض الاقتراحات
10. `AnalyticsChart` - رسوم بيانية

---

## 🔄 Migration Strategy

### خطة نقل البيانات:
1. **تصدير من localStorage**:
   ```typescript
   const books = localStorage.getItem('islamic-library-books')
   const categories = localStorage.getItem('islamic-library-categories')
   const bookmarks = localStorage.getItem('islamic-library-bookmarks')
   ```

2. **تحويل إلى Prisma Format**:
   ```typescript
   const prismaBooks = JSON.parse(books).map(book => ({
     title: book.title,
     categoryId: findCategoryId(book.category),
     // ...
   }))
   ```

3. **إدخال في قاعدة البيانات**:
   ```typescript
   await prisma.book.createMany({ data: prismaBooks })
   ```

4. **التحقق والاختبار**:
   - التأكد من جميع البيانات
   - اختبار العلاقات
   - التحقق من الصور

---

## ⏱️ Timeline المقترح

### أسبوع 1:
- ✅ إعداد قاعدة البيانات
- ⏳ إنشاء API Routes الأساسية
- ⏳ إنشاء Authentication System

### أسبوع 2:
- ⏳ بناء Admin Dashboard
- ⏳ إنشاء Book Management
- ⏳ إضافة Image Upload

### أسبوع 3:
- ⏳ إنشاء Series/Volume Management
- ⏳ Analytics System
- ⏳ Session Management

### أسبوع 4:
- ⏳ Migration من localStorage
- ⏳ Testing & Bug Fixes
- ⏳ Deployment

---

## 🎯 الأولويات

### Priority 1 (Critical):
1. Database Setup & Migration
2. Admin Authentication
3. Book CRUD Operations
4. Image Upload System

### Priority 2 (High):
1. Series/Volume Management
2. Admin Dashboard
3. User Sessions
4. Analytics Tracking

### Priority 3 (Medium):
1. Suggestion Box
2. Theme Backgrounds
3. Advanced Analytics
4. System Settings

### Priority 4 (Low):
1. Enhanced UI/UX
2. Performance Optimization
3. Additional Features

---

## 📝 Notes

1. **Database Choice**: PostgreSQL موصى به لمميزاته المتقدمة
2. **Hosting**: يمكن استخدام Vercel للموقع و Supabase للقاعدة البيانات (مجاني)
3. **Images**: استخدام Cloudinary أو Supabase Storage للصور
4. **Backup**: جدولة backup يومي لقاعدة البيانات
5. **Monitoring**: إضافة error tracking (Sentry)

---

**الحالة الحالية**: ✅ Schema جاهز - جاهز للخطوة التالية!

**التالي**: إعداد قاعدة البيانات وبدء تطوير API Routes
