# 📱 دليل إعداد تطبيق الموبايل

## 🎯 الهدف

تطبيق موبايل (iOS & Android) يشترك مع الموقع في نفس Backend و Database.

---

## 📋 المتطلبات

### 1. للتطوير:
```bash
# Node.js 18+
node --version

# npm أو yarn
npm --version

# Expo CLI (اختياري - للميزات المتقدمة)
npm install -g expo-cli
```

### 2. على الموبايل:
- **Expo Go** من App Store (iOS) أو Play Store (Android)

---

## 🚀 خطوات التثبيت

### 1. انتقل لمجلد التطبيق

```bash
cd algiers-mobile
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد Backend URL

افتح `services/api.ts` وحدّث:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:3000'  // مثل: http://192.168.1.100:3000
  : 'https://your-production-url.com';
```

**مهم**: استخدم عنوان IP الخاص بجهازك (ليس localhost)

#### للحصول على IP:
```bash
# على macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# على Linux
hostname -I

# على Windows
ipconfig
```

### 4. شغّل Backend

في مجلد `algiers` الأساسي:

```bash
cd ../algiers
npm run dev
```

تأكد أن Backend يعمل على: http://localhost:3000

### 5. شغّل التطبيق

في مجلد `algiers-mobile`:

```bash
npm start
```

---

## 📱 تشغيل على الموبايل

### الطريقة 1: Expo Go (الأسهل)

1. افتح تطبيق **Expo Go** على موبايلك
2. امسح الـ QR code من Terminal
3. التطبيق سيفتح مباشرة

### الطريقة 2: Android Emulator

```bash
npm run android
```

### الطريقة 3: iOS Simulator (macOS فقط)

```bash
npm run ios
```

---

## 🏗️ الهيكل

```
algiers-mobile/
├── app/                      # الشاشات (Expo Router)
│   ├── (tabs)/              # شاشات مع Tabs
│   │   ├── index.tsx        # الصفحة الرئيسية
│   │   ├── categories.tsx   # التصنيفات
│   │   └── bookmarks.tsx    # الإشارات المرجعية
│   ├── book/[id].tsx        # تفاصيل الكتاب
│   └── reader/[id].tsx      # شاشة القراءة
├── components/               # المكونات
├── services/                 # API و Storage
│   ├── api.ts               # الاتصال بـ Backend
│   └── storage.ts           # التخزين المحلي
└── app.json                 # إعدادات Expo
```

---

## 🔌 الاتصال بـ Backend

### البيانات المشتركة (من Backend):
```typescript
// التصنيفات والكتب (من قاعدة البيانات)
const categories = await apiService.getCategories();
const books = await apiService.getBooks();
```

### البيانات المحلية (منفصلة):
```typescript
// الإشارات المرجعية (محلية لكل جهاز)
const bookmarks = await storageService.getBookmarks();
await storageService.addBookmark(bookmark);
```

---

## 🎨 التصميم

التطبيق يستخدم:
- **React Native** للواجهة
- **Expo Router** للتنقل
- **AsyncStorage** للتخزين المحلي
- **React Query** لإدارة البيانات

---

## 🐛 حل المشاكل

### مشكلة: لا يمكن الاتصال بـ Backend

**الحل**:
1. تأكد أن Backend يعمل (`npm run dev`)
2. استخدم IP الحقيقي (ليس localhost)
3. تأكد أن الموبايل والكمبيوتر على نفس الشبكة

```typescript
// ❌ خطأ
const API_BASE_URL = 'http://localhost:3000';

// ✅ صحيح
const API_BASE_URL = 'http://192.168.1.100:3000';
```

### مشكلة: QR code لا يعمل

**الحل**:
```bash
# أعد تشغيل
npm start --clear
```

### مشكلة: الإشارات المرجعية لا تحفظ

**الحل**: تأكد من استيراد AsyncStorage:
```bash
npm install @react-native-async-storage/async-storage
```

---

## 📦 البناء للإنتاج

### Android (APK):

```bash
# تثبيت EAS CLI
npm install -g eas-cli

# تسجيل الدخول
eas login

# بناء APK
eas build -p android --profile preview
```

### iOS (App Store):

```bash
# يتطلب حساب Apple Developer
eas build -p ios --profile production
```

---

## 🔄 التحديثات

### تحديث الكود:

```bash
# في algiers-mobile
git pull
npm install
npm start
```

### تحديث Backend:

```bash
# في algiers
git pull
npm install
npx prisma generate
npm run dev
```

---

## 📊 البيانات

### مشتركة (من Backend):
- ✅ الكتب والمحتوى
- ✅ التصنيفات
- ✅ الفصول والأقسام
- ✅ تحديثات Admin

### منفصلة (محلية):
- ❌ الإشارات المرجعية
- ❌ الإعدادات الشخصية
- ❌ سجل القراءة

---

## 🎯 الخلاصة

التطبيق:
- ✅ منفصل عن الويب
- ✅ يستخدم نفس Backend
- ✅ الإشارات محلية
- ✅ يعمل على iOS و Android
- ✅ سهل التطوير والتحديث

---

**جاهز للتطوير!** 🚀

## 📞 الأوامر السريعة

```bash
# التطوير
npm start

# Android
npm run android

# iOS
npm run ios

# مسح Cache
npm start --clear
```
