# 🕌 المكتبة الإسلامية | Islamic Library

<div align="center">

![Status](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

**مكتبة إسلامية شاملة مع لوحة تحكم إدارية كاملة**

[التشغيل السريع](#-quick-start) • [المميزات](#-features) • [الوثائق](#-documentation) • [API](#-api)

</div>

---

## 🌟 نظرة عامة

مشروع متكامل لمكتبة إسلامية تحتوي على:
- ✅ لوحة تحكم إدارية كاملة
- ✅ قاعدة بيانات PostgreSQL
- ✅ نظام إدارة المحتوى
- ✅ تصميم إسلامي فاخر
- ✅ دعم العربية RTL
- ✅ الوضع الليلي والنهاري

---

## ⚡ Quick Start

### 1. التثبيت
```bash
npm install
```

### 2. تشغيل قاعدة البيانات
```bash
npx prisma dev
```

### 3. تشغيل التطبيق
```bash
npm run dev
```

### 4. الوصول
```
🌐 الموقع: http://localhost:3000
🔐 الإدارة: http://localhost:3000/secret-admin-panel-xyz
📧 البريد: admin@islamic-library.com
🔑 كلمة المرور: Admin@123456
```

---

## ✨ Features

### 🔐 نظام الإدارة
- تسجيل دخول آمن
- حماية المسارات
- إدارة الجلسات
- صلاحيات المدير

### 📚 إدارة الكتب
- إضافة كتب مع فصول وأقسام
- تعديل الكتب الموجودة
- حذف الكتب
- البحث والتصفية
- صور الأغلفة عبر URL

### 🏷️ إدارة التصنيفات
- إضافة/تعديل/حذف التصنيفات
- أيقونات مخصصة (9 خيارات)
- ترتيب التصنيفات
- عدد الكتب لكل تصنيف

### ⚙️ الإعدادات
- اسم ووصف الموقع
- خلفيات النهار والليل
- معاينة الصور
- حفظ في قاعدة البيانات

### 📊 التحليلات
- إحصائيات الزوار
- الكتب الأكثر شعبية
- رسوم بيانية يومية
- تصدير البيانات CSV

### 🔖 مميزات المستخدم
- علامات مرجعية خاصة
- تظليل النصوص بألوان
- إعدادات القراءة
- جلسات منفصلة لكل مستخدم

---

## 🗂️ Project Structure

```
algiers/
├── app/
│   ├── secret-admin-panel-xyz/     # لوحة التحكم
│   │   ├── dashboard/              # Dashboard
│   │   ├── books/                  # إدارة الكتب
│   │   ├── categories/             # إدارة التصنيفات
│   │   ├── settings/               # الإعدادات
│   │   └── analytics/              # الإحصائيات
│   ├── api/                        # API Routes
│   │   ├── admin/                  # Auth APIs
│   │   ├── books/                  # Books APIs
│   │   ├── categories/             # Categories APIs
│   │   ├── bookmarks/              # Bookmarks APIs
│   │   ├── highlights/             # Highlights APIs
│   │   └── analytics/              # Analytics API
│   └── books/[id]/                 # عرض الكتاب
├── lib/
│   ├── prisma.ts                   # Database client
│   ├── auth.ts                     # Authentication
│   └── session.ts                  # Session management
└── prisma/
    ├── schema.prisma               # 17 نموذج بيانات
    └── migrations/                 # Database migrations
```

---

## 🗄️ Database Models

```
✅ Admin           - حسابات المديرين
✅ Category        - تصنيفات الكتب
✅ Book            - الكتب
✅ Chapter         - الفصول
✅ Section         - الأقسام
✅ BookSeries      - سلاسل الكتب
✅ Volume          - الأجزاء
✅ Part            - الأقسام الفرعية
✅ UserSession     - جلسات المستخدمين
✅ Bookmark        - العلامات المرجعية
✅ Highlight       - التظليلات
✅ ReadingSettings - إعدادات القراءة
✅ ThemeBackground - خلفيات الثيمات
✅ Suggestion      - الاقتراحات
✅ VisitorLog      - سجل الزوار
✅ DailyStats      - الإحصائيات اليومية
✅ SystemSettings  - إعدادات النظام
```

---

## 🔌 API

### Books
```
GET    /api/books              - قائمة الكتب
POST   /api/books              - إضافة كتاب
GET    /api/books/[id]         - تفاصيل الكتاب
PUT    /api/books/[id]         - تعديل كتاب
DELETE /api/books/[id]         - حذف كتاب
```

### Categories
```
GET    /api/categories         - قائمة التصنيفات
POST   /api/categories         - إضافة تصنيف
PUT    /api/categories/[id]    - تعديل تصنيف
DELETE /api/categories/[id]    - حذف تصنيف
```

### Bookmarks & Highlights
```
GET    /api/bookmarks          - علامات المستخدم
POST   /api/bookmarks          - إضافة علامة
DELETE /api/bookmarks/[id]     - حذف علامة

GET    /api/highlights         - تظليلات المستخدم
POST   /api/highlights         - إضافة تظليل
PUT    /api/highlights/[id]    - تعديل لون
DELETE /api/highlights/[id]    - حذف تظليل
```

[View Full API Documentation →](./COMPLETE_FEATURES_SUMMARY.md#-api-routes)

---

## 🎨 Design

### Colors
```css
Gold:        #d4af37
Dark Green:  #1a5f3f
Light Green: #2d7a54
Cream:       #f5f1e8
Dark:        #0f1419
```

### Features
- ✅ Islamic-themed design
- ✅ Dark/Light mode
- ✅ RTL support
- ✅ Responsive layout
- ✅ Arabic typography

---

## 📚 Documentation

- [**COMPLETE_FEATURES_SUMMARY.md**](./COMPLETE_FEATURES_SUMMARY.md) - قائمة كاملة بجميع المميزات
- [**DATABASE_INTEGRATION_STATUS.md**](./DATABASE_INTEGRATION_STATUS.md) - حالة قاعدة البيانات
- [**README_FINAL.md**](./README_FINAL.md) - دليل كامل بالعربية والإنجليزية
- [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) - دليل الإعداد

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Auth:** Custom with bcrypt
- **Icons:** React Icons

---

## 📊 Stats

```
✅ Database Integration:    100%
✅ Admin Panel:              100%
✅ Books Management:         100%
✅ Categories:               100%
✅ Settings:                 100%
✅ Analytics:                100%
✅ Bookmarks:                100%
✅ Highlights:               100%

Overall:                     100%
```

---

## 🚀 Production Deployment

### 1. Database
Choose a hosting service:
- Supabase (Recommended)
- Railway
- Neon
- Vercel Postgres

### 2. Update .env
```bash
DATABASE_URL="postgresql://..."
```

### 3. Deploy
```bash
npx prisma migrate deploy
vercel deploy
```

---

## 📝 How to Use

### للمدير (Admin)
1. تسجيل الدخول على `/secret-admin-panel-xyz`
2. إدارة الكتب من Dashboard
3. إضافة/تعديل التصنيفات
4. تغيير الإعدادات
5. مراجعة الإحصائيات

### للزوار (Visitors)
1. تصفح الكتب من الصفحة الرئيسية
2. القراءة والبحث
3. إضافة علامات مرجعية
4. تظليل النصوص المهمة

---

## 🔒 Security

- ✅ Middleware protection
- ✅ Session-based auth
- ✅ httpOnly cookies
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ User isolation

---

## 🤝 Contributing

This is a complete project. Feel free to:
- Fork and customize
- Add features
- Report issues
- Submit PRs

---

## 📄 License

Open source for Islamic educational purposes.

---

## 🙏 Credits

Built with ❤️ for the Islamic community
تم التطوير بـ ❤️ للمجتمع الإسلامي

---

<div align="center">

**🕌 بسم الله الرحمن الرحيم**

**"اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"**

---

*Version 2.0.0 - Complete Edition*

</div>
