# 📚 المكتبة الإسلامية | Islamic Library Mobile App

<div align="center">

[![React Native](https://img.shields.io/badge/React%20Native-0.76.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Progress](https://img.shields.io/badge/Progress-100%25-success.svg)]()

**تطبيق موبايل متكامل لقراءة الكتب الإسلامية**

[الميزات](#-الميزات) • [التثبيت](#-التثبيت) • [الاستخدام](#-الاستخدام) • [التوثيق](#-التوثيق)

</div>

---

## 📖 نظرة عامة

المكتبة الإسلامية هو تطبيق موبايل متكامل مبني بـ **React Native + Expo** يوفر تجربة قراءة سلسة للكتب الإسلامية مع ميزات متقدمة.

**الحالة:** 100% مكتمل ✅ • **الملفات:** 100+ • **الأسطر:** ~18,500+

---

## ✨ الميزات

### 🔐 Authentication
- ✅ تسجيل الدخول بالبريد الإلكتروني
- ✅ إنشاء حساب جديد مع validation
- ✅ استعادة كلمة المرور (Two-step flow)
- ✅ إعادة تعيين كلمة المرور مع Token
- ✅ الوصول كضيف

### 📚 إدارة الكتب
- ✅ تصفح المكتبة (5 كتب mock + 6 تصنيفات)
- ✅ البحث Real-time في العنوان/المؤلف/التصنيف
- ✅ التصفية حسب التصنيف
- ✅ نظام المفضلة (⭐)
- ✅ تتبع تقدم القراءة (0-100%)
- ✅ Download Manager مكتمل 📥
- ✅ Reviews & Ratings نظام التقييمات ⭐
- ✅ Statistics شاشة الإحصائيات 📊

### 📖 تجربة القراءة
- ✅ قارئ كتب مخصص مع warm background
- ✅ التحكم في حجم الخط (14-28pt)
- ✅ التنقل بين الصفحات (Previous/Next)
- ✅ شريط التقدم التلقائي
- ✅ Settings modal
- ✅ Reading timer (تتبع وقت القراءة)
- ✅ Bookmarks system (UI مكتملة) 🔖
- ✅ Highlights system (UI مكتملة) 🎨
- ✅ Notes system (UI مكتملة) 📝
- ✅ FABs (Floating Action Buttons)
- ✅ عرض ملاحظات الصفحة الحالية

### 👤 الملف الشخصي والإعدادات
- ✅ معلومات المستخدم
- ✅ إحصائيات القراءة
- ✅ الوضع الليلي (Dark Mode)
- ✅ التحكم في حجم الخط
- ✅ إدارة الإشعارات
- ✅ وضع عدم الاتصال
- ✅ مسح الذاكرة المؤقتة

---

## 🛠️ التقنيات

```typescript
Frontend:     React Native 0.76.5 + Expo SDK 54 + TypeScript 5.7.2
State:        Zustand 5.x (Auth, Theme, Books) + AsyncStorage
Navigation:   React Navigation 7.x (Stack + Bottom Tabs)
API:          Axios + TanStack Query (React Query)
UI:           StyleSheet API + Ionicons + Safe Area Context
```

---

## 📦 التثبيت

### المتطلبات
```
Node.js 18+
npm أو yarn
Expo CLI
iOS Simulator أو Android Emulator
```

### الخطوات

```bash
# 1. تثبيت Dependencies
npm install

# 2. تشغيل التطبيق
npm start

# 3. تشغيل على المنصة المطلوبة
npm run ios      # iOS
npm run android  # Android
npm run web      # Web (preview)
```

---

## 🎯 الاستخدام

### تسجيل الدخول
```typescript
import { useAuthStore } from '@/stores';

const { login } = useAuthStore();
await login('user@example.com', 'password');
```

### إدارة الكتب
```typescript
import { useBookStore } from '@/stores';

const { books, toggleFavorite, updateProgress } = useBookStore();

// Toggle favorite
toggleFavorite(bookId);

// Update progress
updateProgress(bookId, 75); // 75%
```

### Bookmarks & Highlights
```typescript
const { addBookmark, addHighlight, addNote } = useBookStore();

// Add bookmark
addBookmark({ bookId, page: 42, title: 'مقدمة الكتاب' });

// Add highlight
addHighlight({ bookId, page: 42, text: 'النص المظلل', color: '#FFEB3B' });

// Add note
addNote({ bookId, page: 42, content: 'ملاحظة مهمة...' });
```

---

## 🗂️ هيكل المشروع

```
mobile-app/islamic-library-mobile/
├── src/
│   ├── api/                  # API Client
│   ├── components/           # 8 UI Components
│   │   ├── common/          # Button, Input, Card, etc.
│   │   ├── BookCard.tsx
│   │   └── CategoryCard.tsx
│   ├── constants/           # Colors, Config, Spacing
│   ├── navigation/          # 3 Navigators + Types
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/             # 13 Screens
│   │   ├── auth/           # 4 Auth Screens
│   │   └── main/           # 9 Main Screens
│   ├── stores/             # 3 Zustand Stores
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── bookStore.ts   # NEW ✨
│   ├── types/              # TypeScript Types
│   └── utils/              # Validators
├── App.tsx
└── app.json
```

---

## 📚 التوثيق

| الملف | الوصف | الأسطر |
|------|-------|--------|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | ملخص شامل للمشروع | ~500 |
| [PHASE6_ROADMAP.md](PHASE6_ROADMAP.md) | خارطة المرحلة 6 | ~600 |
| [READER_FEATURES_GUIDE.md](READER_FEATURES_GUIDE.md) | دليل ميزات القارئ | ~650 |
| [NAVIGATION_GUIDE.md](NAVIGATION_GUIDE.md) | دليل نظام التنقل | ~800 |
| [AUTH_SCREENS_GUIDE.md](AUTH_SCREENS_GUIDE.md) | دليل شاشات Auth | ~800 |
| [COMPONENTS_GUIDE.md](COMPONENTS_GUIDE.md) | دليل المكونات | ~600 |
| [PHASE1-5_COMPLETE.md](.) | ملخصات المراحل | ~2000 |

**إجمالي التوثيق:** ~8,650+ سطر

---

## 📱 الشاشات (14 شاشة)

### Auth Screens (4)
1. **LoginScreen** - تسجيل دخول مع validation
2. **RegisterScreen** - إنشاء حساب مع password strength
3. **ForgotPasswordScreen** - Two-step flow
4. **ResetPasswordScreen** - إعادة تعيين مع token validation

### Main Tab Screens (4)
5. **HomeScreen** - الرئيسية مع stats و features
6. **LibraryScreen** - المكتبة مع 6 categories و filtering
7. **FavoritesScreen** - المفضلة (3 كتب)
8. **ProfileScreen** - الملف الشخصي مع settings

### Detail Screens (6)
9. **BookDetailsScreen** - تفاصيل + downloads + reviews
10. **BookReaderScreen** - القارئ مع Bookmarks/Highlights/Notes
11. **SearchScreen** - البحث Real-time
12. **CategoryScreen** - كتب تصنيف مع sorting
13. **SettingsScreen** - إعدادات متقدمة
14. **StatisticsScreen** - إحصائيات القراءة 📊 ✨ NEW

---

## 🎨 المكونات (14 components)

### Common (6)
- **Button** - 3 variants (primary, outline, ghost)
- **Input** - مع validation و icons
- **Card & CardBody** - Container styling
- **LoadingSpinner** - Size variants
- **ErrorMessage** - Inline display
- **EmptyState** - NoBooks, NoFavorites

### Book (2)
- **BookCard** - عرض كتاب مع progress
- **CategoryCard** - عرض تصنيف

### Reader (3)
- **BookmarksModal** - مودال العلامات المرجعية
- **HighlightColorPicker** - مودال اختيار لون التظليل
- **NoteModal** - مودال إضافة وتحرير الملاحظات

### Advanced (3) ✨ NEW
- **DownloadProgressCard** - عرض تقدم التحميل
- **ReviewModal** - مودال إضافة وتعديل التقييمات
- **ReviewsList** - قائمة عرض التقييمات

---

## 🔒 الأمان

- ✅ Password validation (Strong passwords)
- ✅ Secure text entry
- ✅ Input sanitization
- ✅ Token validation
- ✅ Generic error messages
- ✅ Environment variables

---

## 🚀 البناء

### Development
```bash
npm start
```

### Production (EAS)
```bash
# Setup
npm install -g eas-cli
eas login
eas build:configure

# Build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit
eas submit --platform all
```

---

## 🧪 الاختبار

```bash
npm test              # جميع الاختبارات
npm test -- --coverage # مع Coverage
npm run lint          # ESLint
```

---

## 📊 الإحصائيات

```
Total Files:        100+
Total Lines:        ~18,500+
Documentation:      ~9,200+
Components:         14
Screens:            14
Services:           1
Navigators:         3
Stores:             3
Progress:           100% ✅🎉
```

---

## 🗺️ Roadmap

### ✅ Phase 1-5 (مكتملة)
- [x] Project Setup
- [x] UI Components
- [x] Auth Screens
- [x] Navigation System
- [x] Main Screens

### ✅ Phase 6 (مكتملة)
- [x] BookStore (Zustand)
- [x] Bookmarks/Highlights/Notes (backend)
- [x] UI للـ Bookmarks/Highlights/Notes
- [x] FABs (Floating Action Buttons)
- [x] Reading Time Tracking

### ✅ Phase 7 (مكتملة) 🎉
- [x] Download Manager ✨
- [x] Reviews System ✨
- [x] Statistics Screen ✨
- [x] Progress Tracking
- [x] Real-time Updates

### 🔮 Future Enhancements
- [ ] Real Text Selection API
- [ ] Cloud Sync
- [ ] Audio Books
- [ ] Social Features
- [ ] AI Recommendations

---

## 🤝 المساهمة

نرحب بالمساهمات!

```bash
# 1. Fork المشروع
# 2. إنشاء branch
git checkout -b feature/AmazingFeature

# 3. Commit
git commit -m 'Add AmazingFeature'

# 4. Push
git push origin feature/AmazingFeature

# 5. فتح Pull Request
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👥 الفريق

- **Developer** - [@your-username](https://github.com/your-username)

---

## 📞 التواصل

- **Website:** islamiclibrary.app
- **Email:** info@islamiclibrary.app

---

<div align="center">

**مصنوع بـ ❤️ لخدمة المسلمين في كل مكان**

**🇩🇿 Made in Algeria**

![Lines](https://img.shields.io/badge/Lines-18,500+-blue)
![Screens](https://img.shields.io/badge/Screens-14-green)
![Progress](https://img.shields.io/badge/Progress-100%25-success)
![Complete](https://img.shields.io/badge/Status-Complete-brightgreen)

</div>
