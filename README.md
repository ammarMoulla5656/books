# 📚 المكتبة الإسلامية | Islamic Library

> **منصة رقمية شاملة لقراءة وإدارة الكتب الإسلامية**
>
> **A comprehensive digital platform for reading and managing Islamic books**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

---

## 📋 جدول المحتويات | Table of Contents

- [نظرة عامة | Overview](#نظرة-عامة--overview)
- [تطبيق الموبايل | Mobile App](#-تطبيق-الموبايل--mobile-app)
- [المميزات | Features](#المميزات--features)
- [التقنيات المستخدمة | Tech Stack](#️-التقنيات-المستخدمة--tech-stack)
- [التثبيت والإعداد | Installation](#-التثبيت-والإعداد--installation)
- [الاستخدام | Usage](#-الاستخدام--usage)
- [اختبار الأداء | Performance Testing](#-اختبار-الأداء--performance-testing)
- [هيكل المشروع | Project Structure](#-هيكل-المشروع--project-structure)
- [لوحة التحكم | Admin Panel](#️-لوحة-التحكم--admin-panel)
- [الوثائق | Documentation](#-الوثائق--documentation)

---

## 🌟 نظرة عامة | Overview

### العربية

المكتبة الإسلامية هي منصة ويب حديثة مبنية بتقنيات Next.js 16 و React 19، مصممة لتوفير تجربة قراءة سلسة وممتعة للكتب الإسلامية. تتميز المنصة بواجهة مستخدم عربية جميلة، نظام إدارة محتوى متقدم، وأدوات تحليل الأداء.

### English

Islamic Library is a modern web platform built with Next.js 16 and React 19, designed to provide a seamless and enjoyable reading experience for Islamic books. The platform features a beautiful Arabic interface, advanced content management system, and performance analytics tools.

---

## 📱 تطبيق الموبايل | Mobile App

### 🚀 قريباً: تطبيق iOS & Android

نحن نعمل على تطوير تطبيق موبايل متكامل بتقنية **React Native + Expo** يشارك نفس قاعدة البيانات مع المنصة الويب!

**الميزات القادمة**:
- 📖 قراءة بدون اتصال بالإنترنت
- 🔔 إشعارات ذكية
- 🔐 مصادقة بيومترية (Face ID / Touch ID)
- 🔄 مزامنة تلقائية بين الأجهزة
- ⚡ أداء فائق السرعة

**الحالة الحالية**: 🔄 Phase 0 - الإعداد (80% مكتمل)

📂 **للمزيد من التفاصيل**: اقرأ [`mobile-app/README.md`](mobile-app/README.md)
📖 **الخطة الكاملة**: اقرأ [`mobile-app/plans/خطة_تطبيق_الموبايل_المتكاملة.md`](mobile-app/plans/خطة_تطبيق_الموبايل_المتكاملة.md)

---

## ✨ المميزات | Features

### للقراء | For Readers

- 📖 **قراءة سلسة**: واجهة قراءة مريحة مع دعم كامل للعربية
- 🔖 **العلامات المرجعية**: حفظ الصفحات المفضلة والعودة إليها بسهولة
- ✨ **التظليل**: إمكانية تظليل النصوص المهمة
- 🔍 **البحث المتقدم**: بحث سريع في جميع الكتب والفئات
- 📱 **تصميم متجاوب**: يعمل بشكل مثالي على جميع الأجهزة
- 🌙 **الوضع الليلي**: راحة للعينين أثناء القراءة الليلية

### للمسؤولين | For Admins

- 🛡️ **لوحة تحكم محمية**: نظام مصادقة آمن
- 📚 **إدارة الكتب**: إضافة، تعديل، وحذف الكتب بسهولة
- 📂 **إدارة الفئات**: تنظيم الكتب في فئات مختلفة
- 📊 **تحليلات متقدمة**: متابعة الزوار والإحصائيات
- 🔄 **استيراد تلقائي**: استيراد كتب من مواقع خارجية

---

## 🛠️ التقنيات المستخدمة | Tech Stack

### Frontend
- **Next.js 16.1.1** - React Framework with Turbopack
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma 7.2.0** - ORM
- **PostgreSQL** - Database
- **bcryptjs** - Password Hashing

### Tools & Testing
- **Python** - Load Testing Scripts
- **ESLint** - Code Quality
- **Git** - Version Control

---

## 🚀 التثبيت والإعداد | Installation

### المتطلبات | Prerequisites

- Node.js 18+ و npm
- PostgreSQL 12+
- Python 3.8+ (لاختبار الأداء)

### 1. استنساخ المشروع | Clone the Repository

```bash
git clone <repository-url>
cd algiers
```

### 2. تثبيت الحزم | Install Dependencies

```bash
npm install
```

### 3. إعداد قاعدة البيانات | Database Setup

#### أ. إنشاء قاعدة بيانات PostgreSQL

```sql
CREATE DATABASE islamic_library;
```

#### ب. إعداد ملف البيئة | Environment Variables

أنشئ ملف `.env` في جذر المشروع:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/islamic_library"
```

**مثال**:
```env
DATABASE_URL="postgresql://postgres:iioopp00@localhost:4000/islamic_library"
```

#### ج. تطبيق المخططات | Apply Schema

```bash
npx prisma db push
```

#### د. ملء البيانات الأولية | Seed Database

```bash
npx prisma db seed
```

هذا سيضيف:
- ✅ حساب المسؤول الافتراضي
- ✅ الفئات الأساسية
- ✅ كتاب تجريبي

**بيانات الدخول الافتراضية:**
- البريد: `admin@islamic-library.com`
- كلمة المرور: `Admin@123456`

---

## 💻 الاستخدام | Usage

### وضع التطوير | Development Mode

```bash
npm run dev
```

سيعمل الموقع على: [http://localhost:3000](http://localhost:3000)

### وضع الإنتاج | Production Mode

```bash
# 1. بناء المشروع
npm run build

# 2. تشغيل الإنتاج
npm start
```

### فتح لوحة التحكم | Access Admin Panel

افتح: [http://localhost:3000/secret-admin-panel-xyz](http://localhost:3000/secret-admin-panel-xyz)

---

## 📊 اختبار الأداء | Performance Testing

تم تضمين أدوات اختبار الحمل المتقدمة لمعرفة قدرة الموقع على التحمل.

### تثبيت المتطلبات | Install Requirements

```bash
pip install requests
```

### الاختبارات المتاحة | Available Tests

#### 1. الاختبار السريع | Quick Test

```bash
python tests/quick_test.py 100
```

يختبر الموقع مع 100 مستخدم متزامن (يمكن تغيير الرقم).

#### 2. الاختبار العادي | Standard Test

```bash
python tests/load_test.py
```

اختبار شامل مع تفاصيل كاملة عن الأداء.

#### 3. اختبار الضغط الشديد | Stress Test

```bash
python tests/stress_test.py 1000
```

اختبار أقصى حمل ممكن - بدون قيود!

### قراءة النتائج | Understanding Results

- **نسبة النجاح**: يجب أن تكون > 95%
- **وقت الاستجابة**: يجب أن يكون < 1 ثانية
- **معدل الطلبات**: كلما زاد كان أفضل

📘 **للمزيد من التفاصيل**: اقرأ [`docs/اختبار_الضغط_الشديد.md`](docs/اختبار_الضغط_الشديد.md)

---

## 📁 هيكل المشروع | Project Structure

```
algiers/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                     # API Routes
│   │   ├── 📂 books/              # Books API
│   │   ├── 📂 categories/         # Categories API
│   │   ├── 📂 bookmarks/          # Bookmarks API
│   │   ├── 📂 admin/              # Admin API
│   │   └── 📂 analytics/          # Analytics API
│   │
│   ├── 📂 secret-admin-panel-xyz/ # Admin Panel
│   │   ├── 📂 books/              # Books Management
│   │   ├── 📂 categories/         # Categories Management
│   │   ├── 📂 analytics/          # Analytics Dashboard
│   │   └── 📂 settings/           # Settings
│   │
│   ├── 📂 books/[id]/             # Book Reader Page
│   ├── 📄 page.tsx                # Homepage
│   ├── 📄 layout.tsx              # Root Layout
│   └── 📄 globals.css             # Global Styles
│
├── 📂 components/                  # React Components
│   ├── 📄 BookCard.tsx            # Book Display Card
│   ├── 📄 CategoryFilter.tsx      # Category Filter
│   ├── 📄 SearchBar.tsx           # Search Component
│   └── ...
│
├── 📂 lib/                         # Utilities & Helpers
│   ├── 📄 db.ts                   # Database Client
│   ├── 📄 auth.ts                 # Authentication
│   └── 📄 localStorage.ts         # Local Storage Helper
│
├── 📂 prisma/                      # Database
│   ├── 📄 schema.prisma           # Database Schema
│   └── 📄 seed.ts                 # Seed Script
│
├── 📂 tests/                       # Performance Tests
│   ├── 📄 quick_test.py           # Quick Load Test
│   ├── 📄 load_test.py            # Standard Load Test
│   └── 📄 stress_test.py          # Stress Test
│
├── 📂 docs/                        # Documentation (Arabic)
│   ├── 📄 شرح_المشروع_الكامل.md  # Complete Project Guide
│   ├── 📄 ابدأ_هنا.md             # Getting Started
│   ├── 📄 إعداد_PostgreSQL.md    # PostgreSQL Setup
│   ├── 📄 كيف_تختبر_الحمل.md     # Load Testing Guide
│   └── ...
│
├── 📂 public/                      # Static Assets
│   └── 📂 images/                 # Images
│
├── 📄 .env                         # Environment Variables
├── 📄 package.json                # Dependencies
├── 📄 tsconfig.json               # TypeScript Config
├── 📄 tailwind.config.js          # Tailwind Config
├── 📄 next.config.ts              # Next.js Config
├── 📄 middleware.ts               # Next.js Middleware
└── 📄 README.md                   # This File

```

---

## 🛡️ لوحة التحكم | Admin Panel

### الوصول | Access

**الرابط**: `/secret-admin-panel-xyz`

**بيانات الدخول الافتراضية:**
- Email: `admin@islamic-library.com`
- Password: `Admin@123456`

### الميزات | Features

#### 📊 لوحة المعلومات | Dashboard
- إجمالي الكتب والفئات
- عدد الزوار الفريدين
- إحصائيات اليوم والأسبوع
- الكتب الأكثر قراءة

#### 📚 إدارة الكتب | Books Management
- ✅ إضافة كتاب جديد
- ✏️ تعديل بيانات الكتاب
- 🗑️ حذف الكتاب
- 📥 استيراد من مواقع خارجية
- 🔄 استيراد كتب السيد السيستاني

#### 📂 إدارة الفئات | Categories Management
- ➕ إضافة فئة جديدة
- ✏️ تعديل الفئة
- 🗑️ حذف الفئة
- 📊 عدد الكتب لكل فئة

#### 📈 التحليلات | Analytics
- 👥 الزوار اليوميين
- 📖 الصفحات المشاهدة
- 📚 الكتب المقروءة
- 📊 رسوم بيانية تفاعلية

---

## 📖 الوثائق | Documentation

### الوثائق العربية | Arabic Documentation

جميع الوثائق متوفرة في مجلد [`docs/`](docs/):

- 📘 [**شرح المشروع الكامل**](docs/شرح_المشروع_الكامل.md) - فهم شامل للمشروع
- 🚀 [**ابدأ هنا**](docs/ابدأ_هنا.md) - دليل البداية السريع
- 🗄️ [**إعداد PostgreSQL**](docs/إعداد_PostgreSQL.md) - إعداد قاعدة البيانات
- ⚡ [**اختبار الضغط الشديد**](docs/اختبار_الضغط_الشديد.md) - دليل اختبار الأداء
- 🔧 [**حل المشاكل**](docs/حل_المشاكل.md) - حل المشاكل الشائعة
- ✅ [**كل شيء يعمل**](docs/✅_كل_شيء_يعمل.md) - تأكيد التثبيت الناجح

### المساعدة السريعة | Quick Help

```bash
# مشكلة في الاتصال بقاعدة البيانات؟
راجع: docs/حل_مشكلة_الاتصال.md

# تريد اختبار الأداء؟
راجع: docs/كيف_تختبر_الحمل.md

# تريد فهم المشروع بالكامل؟
راجع: docs/شرح_المشروع_الكامل.md
```

---

## 🔐 الأمان | Security

- ✅ مصادقة آمنة بـ bcrypt
- ✅ حماية API Routes
- ✅ Middleware للتحقق من الصلاحيات
- ✅ رابط لوحة تحكم مخفي
- ✅ حماية من SQL Injection (Prisma)
- ✅ التحقق من الإدخالات

**⚠️ مهم**: غيّر كلمة المرور الافتراضية بعد التثبيت!

---

## 🚀 النشر | Deployment

### Vercel (موصى به | Recommended)

```bash
# 1. ثبت Vercel CLI
npm i -g vercel

# 2. انشر المشروع
vercel
```

### Docker

```bash
# قريباً | Coming Soon
```

### VPS / Cloud Server

```bash
# 1. انسخ المشروع إلى السيرفر
git clone <your-repo>

# 2. ثبت الحزم
npm install

# 3. اضبط متغيرات البيئة
nano .env

# 4. ابنِ المشروع
npm run build

# 5. شغّل بـ PM2
npm install -g pm2
pm2 start npm --name "islamic-library" -- start
```

---

## 🤝 المساهمة | Contributing

نرحب بمساهماتكم!

### كيف تساهم؟ | How to Contribute?

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---

## 📝 الترخيص | License

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

This project is open source and available for free use.

---

## 📧 التواصل | Contact

لأي استفسارات أو مشاكل، يرجى فتح Issue في المستودع.

For any questions or issues, please open an Issue in the repository.

---

## 🌟 شكر خاص | Special Thanks

شكراً لكل من ساهم في تطوير هذا المشروع!

Thanks to everyone who contributed to this project!

---

<div align="center">

**صُنع بـ ❤️ للمكتبة الإسلامية**

**Made with ❤️ for Islamic Library**

---

⭐ إذا أعجبك المشروع، لا تنسَ إعطاءه نجمة!

⭐ If you like this project, don't forget to give it a star!

</div>
