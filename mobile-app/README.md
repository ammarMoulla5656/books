# 📱 المكتبة الإسلامية - تطبيق الموبايل | Islamic Library Mobile App

<div align="center">

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**تطبيق موبايل شامل لقراءة وإدارة الكتب الإسلامية**

**A comprehensive mobile app for reading and managing Islamic books**

</div>

---

## 📋 جدول المحتويات | Table of Contents

- [نظرة عامة](#-نظرة-عامة--overview)
- [الحالة الحالية](#-الحالة-الحالية--current-status)
- [المميزات](#-المميزات--features)
- [التقنيات المستخدمة](#️-التقنيات-المستخدمة--tech-stack)
- [البدء السريع](#-البدء-السريع--quick-start)
- [الوثائق](#-الوثائق--documentation)
- [خطة التطوير](#-خطة-التطوير--development-plan)
- [المساهمة](#-المساهمة--contributing)

---

## 🌟 نظرة عامة | Overview

### العربية

تطبيق المكتبة الإسلامية للموبايل هو امتداد لمنصة الويب، مبني بتقنية React Native و Expo SDK. يوفر التطبيق تجربة قراءة سلسة ومتقدمة للكتب الإسلامية مع دعم كامل للعمل بدون اتصال بالإنترنت، المزامنة التلقائية، والإشعارات الذكية.

### English

The Islamic Library Mobile App is an extension of the web platform, built with React Native and Expo SDK. The app provides a seamless and advanced reading experience for Islamic books with full offline support, automatic synchronization, and smart notifications.

---

## 📍 الحالة الحالية | Current Status

### Phase 0: الإعداد والتجهيز | Setup & Preparation

```
████████░░ 80% مكتمل | Complete
```

#### ✅ ما تم إنجازه | Completed

- [x] تصميم الخطة الشاملة (2,554 سطر)
- [x] تصميم قاعدة البيانات (6 جداول جديدة)
- [x] تصميم API (30+ نقطة نهاية)
- [x] اختيار التقنيات والمكتبات
- [x] تنظيم هيكل المشروع
- [x] إعداد ملف تعليمات Claude

#### ⏳ التالي | Next Steps

- [ ] إنشاء مشروع Expo جديد
- [ ] تثبيت المكتبات الأساسية
- [ ] إعداد TypeScript Configuration
- [ ] إعداد ESLint و Prettier
- [ ] إعداد Git Repository

---

## ✨ المميزات | Features

### المميزات الأساسية | Core Features (MVP)

#### 🔐 المصادقة | Authentication
- تسجيل الدخول والتسجيل
- JWT Authentication (Access + Refresh Tokens)
- Biometric Authentication (Face ID / Touch ID)
- إدارة الجلسات

#### 📚 تصفح الكتب | Browse Books
- قائمة الكتب مع البحث
- الفلترة حسب الفئات
- تفاصيل الكتاب الكاملة
- صور الغلاف عالية الجودة

#### 📖 القراءة | Reading
- قارئ نصوص متقدم
- التنقل بين الصفحات بسلاسة
- ضبط حجم الخط واللون
- الوضع الليلي

#### 🔖 المكتبة الشخصية | Personal Library
- العلامات المرجعية
- التظليلات (Highlights)
- متابعة التقدم
- السجل القرائي

### المميزات المتقدمة | Advanced Features

#### 📡 القراءة بدون اتصال | Offline Reading
- تحميل الكتب للقراءة بدون إنترنت
- المزامنة التلقائية عند الاتصال
- إدارة التخزين المحلي

#### 🔔 الإشعارات | Notifications
- إشعارات الكتب الجديدة
- تذكيرات القراءة
- إشعارات التحديثات

#### ⚡ الأداء | Performance
- تحميل سريع
- Lazy Loading للصور
- Caching ذكي
- Smooth Animations

---

## 🛠️ التقنيات المستخدمة | Tech Stack

### Frontend Framework
```json
{
  "framework": "React Native",
  "builder": "Expo SDK ~50.x",
  "language": "TypeScript 5.x"
}
```

### Navigation & State
```json
{
  "navigation": "React Navigation 6.x",
  "state_management": "Zustand 4.x",
  "data_fetching": "React Query (TanStack Query) 5.x"
}
```

### UI & Styling
```json
{
  "components": "React Native Paper 5.x",
  "icons": "React Native Vector Icons 10.x",
  "animations": "React Native Reanimated 3.x"
}
```

### Storage & Database
```json
{
  "local_database": "WatermelonDB 0.27.x",
  "async_storage": "AsyncStorage",
  "secure_storage": "Expo Secure Store"
}
```

### Backend Integration
```json
{
  "api": "REST API (Axios 1.6.x)",
  "auth": "JWT Authentication",
  "database": "PostgreSQL (مشتركة مع الويب)",
  "notifications": "Expo Notifications 0.27.x"
}
```

---

## 🚀 البدء السريع | Quick Start

### المتطلبات الأساسية | Prerequisites

```bash
# Node.js 18 أو أحدث
node --version

# npm أو yarn
npm --version

# Expo CLI (اختياري)
npm install -g expo-cli

# iOS Simulator (Mac فقط)
# Android Studio (لـ Android Emulator)
```

### التثبيت | Installation

```bash
# 1. استنساخ المشروع
cd mobile-app

# 2. تثبيت الحزم (عند إنشاء المشروع)
npm install

# 3. تشغيل التطبيق
npx expo start
```

### اختيارات التشغيل | Run Options

```bash
# تشغيل على iOS Simulator
npx expo start --ios

# تشغيل على Android Emulator
npx expo start --android

# تشغيل على الويب (للتطوير)
npx expo start --web

# تشغيل على جهاز حقيقي
# امسح QR code من تطبيق Expo Go
npx expo start
```

---

## 📚 الوثائق | Documentation

### الوثائق الرئيسية | Main Documentation

#### 📖 الخطة الشاملة
**الملف**: [`plans/خطة_تطبيق_الموبايل_المتكاملة.md`](plans/خطة_تطبيق_الموبايل_المتكاملة.md)

**المحتويات**:
- 🗄️ تصميم قاعدة البيانات الكامل
- 🔌 تصميم 30+ API Endpoint
- 🏗️ معمارية التطبيق
- 🎨 دليل التصميم UI/UX
- 🔐 نظام الأمان الكامل
- 📱 تفاصيل جميع الميزات
- ⏱️ الجدول الزمني (5-6 أشهر)
- 💰 تقدير الميزانية
- 📝 أمثلة الكود

#### 🤖 تعليمات Claude
**الملف**: [`.claude-instructions.md`](.claude-instructions.md)

**المحتويات**:
- تعليمات العمل التلقائي
- المعايير والأولويات
- خطة التنفيذ التفصيلية
- ملاحظات مهمة
- روابط مفيدة

### موقع الويب | Web Application

**الموقع**: [`../`](../)
- منصة Next.js 16.1.1 كاملة
- قاعدة البيانات المشتركة
- API يمكن استخدامه للموبايل

---

## 📈 خطة التطوير | Development Plan

### الجدول الزمني | Timeline

```
📅 المدة الكلية: 5-6 أشهر | Total Duration: 5-6 months
💰 الميزانية: $25,000 - $50,000
```

### المراحل | Phases

#### Phase 1: المصادقة والتصفح (4-6 أسابيع)
```
⏱️ المدة: 4-6 أسابيع
📊 الوزن: 25%
```
- نظام المصادقة الكامل
- التصفح الأساسي للكتب
- البحث والفلترة

#### Phase 2: القارئ والمكتبة (4-5 أسابيع)
```
⏱️ المدة: 4-5 أسابيع
📊 الوزن: 25%
```
- القارئ المتقدم
- العلامات والتظليل
- المكتبة الشخصية

#### Phase 3: Offline والمزامنة (3-4 أسابيع)
```
⏱️ المدة: 3-4 أسابيع
📊 الوزن: 20%
```
- تحميل الكتب
- نظام المزامنة
- إدارة التخزين

#### Phase 4: الإشعارات والمتقدمة (2-3 أسابيع)
```
⏱️ المدة: 2-3 أسابيع
📊 الوزن: 15%
```
- Push Notifications
- الميزات المتقدمة

#### Phase 5: الاختبار والتحسين (2-3 أسابيع)
```
⏱️ المدة: 2-3 أسابيع
📊 الوزن: 10%
```
- Unit + Integration Tests
- Performance Optimization

#### Phase 6: النشر (1-2 أسبوع)
```
⏱️ المدة: 1-2 أسبوع
📊 الوزن: 5%
```
- App Store + Google Play
- الإطلاق

---

## 📁 هيكل المشروع | Project Structure

```
mobile-app/
├── 📂 .claude-instructions.md    # تعليمات Claude
├── 📂 README.md                  # هذا الملف
│
├── 📂 plans/                     # الخطط والوثائق
│   └── خطة_تطبيق_الموبايل_المتكاملة.md
│
├── 📂 docs/                      # وثائق إضافية
│   ├── setup.md
│   ├── api.md
│   └── deployment.md
│
├── 📂 src/                       # (سيتم إنشاؤه)
│   ├── 📂 screens/              # الشاشات
│   ├── 📂 components/           # المكونات
│   ├── 📂 navigation/           # التنقل
│   ├── 📂 services/             # API Services
│   ├── 📂 store/                # Zustand Stores
│   ├── 📂 hooks/                # Custom Hooks
│   ├── 📂 utils/                # Utilities
│   ├── 📂 types/                # TypeScript Types
│   ├── 📂 constants/            # الثوابت
│   └── 📂 assets/               # الصور والخطوط
│
├── 📂 __tests__/                # الاختبارات
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── 📄 app.json                  # Expo Config
├── 📄 tsconfig.json             # TypeScript Config
├── 📄 package.json              # Dependencies
└── 📄 .gitignore                # Git Ignore
```

---

## 🔐 الأمان | Security

### الميزات الأمنية | Security Features

- ✅ **JWT Authentication**: Access + Refresh Tokens
- ✅ **Secure Storage**: Expo Secure Store للبيانات الحساسة
- ✅ **Biometric Auth**: Face ID / Touch ID
- ✅ **API Security**: HTTPS + Token Validation
- ✅ **Input Validation**: Joi للتحقق من المدخلات
- ✅ **Session Management**: إدارة الجلسات النشطة

---

## 🧪 الاختبار | Testing

### استراتيجية الاختبار | Testing Strategy

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests (Detox)
```bash
npm run test:e2e:ios
npm run test:e2e:android
```

---

## 🚀 النشر | Deployment

### iOS (App Store)

```bash
# 1. Build for iOS
eas build --platform ios

# 2. Submit to App Store
eas submit --platform ios
```

### Android (Google Play)

```bash
# 1. Build for Android
eas build --platform android

# 2. Submit to Google Play
eas submit --platform android
```

---

## 🤝 المساهمة | Contributing

نرحب بمساهماتكم! | We welcome your contributions!

### كيف تساهم؟ | How to Contribute?

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---

## 📞 الدعم | Support

### روابط مفيدة | Useful Links

- 📖 [React Native Docs](https://reactnative.dev/docs/getting-started)
- 🎯 [Expo Docs](https://docs.expo.dev/)
- 🧭 [React Navigation](https://reactnavigation.org/)
- 🐻 [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- 🔍 [React Query](https://tanstack.com/query/latest)
- 🗄️ [WatermelonDB](https://watermelondb.dev/docs)

---

## 📝 الترخيص | License

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

This project is open source and available for free use.

---

<div align="center">

**صُنع بـ ❤️ للمكتبة الإسلامية**

**Made with ❤️ for Islamic Library**

---

⭐ إذا أعجبك المشروع، لا تنسَ إعطاءه نجمة!

⭐ If you like this project, don't forget to give it a star!

---

**الحالة**: 🔄 قيد التطوير | In Development

**آخر تحديث**: 2026-01-09

</div>
