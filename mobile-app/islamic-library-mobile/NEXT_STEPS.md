# 🚀 الخطوات التالية للتطوير

## ✅ ما تم إنجازه حتى الآن
تم بناء الهيكل الأساسي الكامل للتطبيق! 🎉

---

## 📱 كيفية تشغيل التطبيق

### 1. الطريقة السريعة (Expo Go)

```bash
# الدخول لمجلد المشروع
cd islamic-library-mobile

# تشغيل التطبيق
npm start
```

ثم:
- اضغط `a` لفتح على Android Emulator
- اضغط `i` لفتح على iOS Simulator (Mac فقط)
- امسح QR Code بتطبيق Expo Go على هاتفك

### 2. الطريقة المتقدمة (Development Build)

```bash
# بناء Development Build
eas build --profile development --platform android

# تثبيت البيلد على جهازك
eas build:run -p android
```

---

## 📋 خطة العمل للأسبوع القادم

### اليوم 1-2: المكونات الأساسية

#### 1. إنشاء Button Component
```bash
# مسار الملف: src/components/ui/Button.tsx
```

**الميزات المطلوبة:**
- Variants: primary, secondary, outline, ghost
- Sizes: sm, md, lg
- Loading state
- Disabled state
- Icon support

#### 2. إنشاء Input Component
```bash
# مسار الملف: src/components/ui/Input.tsx
```

**الميزات المطلوبة:**
- TextInput wrapper
- Label & Error message
- Password visibility toggle
- Icon support (left/right)
- RTL support

#### 3. إنشاء Loading Component
```bash
# مسار الملف: src/components/ui/Loading.tsx
```

**الأنواع:**
- Spinner
- Skeleton
- Full screen loading

### اليوم 3-4: Navigation

#### 1. إعداد React Navigation
```bash
# ملفات مطلوبة:
# - src/navigation/RootNavigator.tsx
# - src/navigation/AuthNavigator.tsx
# - src/navigation/MainNavigator.tsx
# - src/navigation/types.ts
```

**Structure:**
```typescript
RootNavigator
├── AuthNavigator (Stack)
│   ├── Welcome
│   ├── Login
│   └── Register
└── MainNavigator (Tabs)
    ├── Home (Stack)
    ├── Library (Stack)
    ├── Search (Stack)
    └── Profile (Stack)
```

### اليوم 5-7: شاشات Auth

#### 1. Welcome/Onboarding Screen
```bash
# مسار: src/screens/onboarding/WelcomeScreen.tsx
```

**الميزات:**
- صور توضيحية
- Swiper للشاشات المتعددة
- زر البدء

#### 2. Login Screen
```bash
# مسار: src/screens/auth/LoginScreen.tsx
```

**الحقول:**
- Email input
- Password input
- Remember me checkbox
- Forgot password link
- Login button
- Register link

#### 3. Register Screen
```bash
# مسار: src/screens/auth/RegisterScreen.tsx
```

**الحقول:**
- Name input
- Email input
- Phone number input (optional)
- Password input
- Confirm password input
- Terms checkbox
- Register button

---

## 🎨 تصميم UI/UX

### الألوان المستخدمة
```javascript
Primary: #1a472a    // الأخضر الإسلامي
Secondary: #2d5f3f
Accent: #d4af37     // الذهبي
```

### الخطوط
- استخدم خط عربي جميل (مثل: Tajawal, Cairo, Amiri)
- قم بتحميل الخطوط من Google Fonts
- أضفها في `src/assets/fonts/`

---

## 🔧 مهام تقنية مهمة

### 1. إعداد Device Info
```typescript
// في authStore.ts، استبدل:
const deviceInfo = {
  deviceToken: 'temp-token', // ❌
  deviceType: 'android',
  ...
}

// بـ:
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const deviceToken = await Notifications.getExpoPushTokenAsync();
const deviceInfo = {
  deviceToken: deviceToken.data,
  deviceType: Device.osName,
  deviceModel: Device.modelName,
  osVersion: Device.osVersion,
  appVersion: Constants.expoConfig.version,
}
```

### 2. تحديث API_URL
```bash
# في ملف .env
API_URL=http://your-server-url/api/v1
```

### 3. إضافة الصور والأيقونات
```bash
# أضف هذه الملفات:
src/assets/icon.png         # 1024x1024
src/assets/splash.png        # 1242x2436
src/assets/adaptive-icon.png # 1024x1024
src/assets/favicon.png       # 48x48
```

---

## 🧪 الاختبار

### اختبار الـ API
```typescript
// في التطبيق، جرب:
import { authAPI } from '@/api';

// اختبار Login
await authAPI.login('test@example.com', 'password');

// اختبار Register
await authAPI.register({
  email: 'new@example.com',
  password: 'SecurePass123!',
  name: 'أحمد محمد',
  deviceInfo: {...}
});
```

### اختبار الـ Store
```typescript
// في أي Component:
import { useAuthStore } from '@/stores';

const { user, login, isAuthenticated } = useAuthStore();
```

---

## 📚 موارد مفيدة

### التوثيق
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Zustand](https://docs.pmnd.rs/zustand)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

### مكونات UI جاهزة
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Native Elements](https://react-native-elements.github.io/react-native-elements/)
- [NativeBase](https://nativebase.io/)

### أيقونات
- [Expo Icons](https://icons.expo.fyi/)
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/)

---

## 🐛 حل المشاكل الشائعة

### المشكلة: لا يعمل التطبيق
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules
npm install

# مسح الـ cache
npx expo start -c
```

### المشكلة: أخطاء في TypeScript
```bash
# تشغيل Type Check
npm run type-check
```

### المشكلة: أخطاء في Module Resolution
- تأكد من أن `babel-plugin-module-resolver` مثبت
- تأكد من تطابق paths في `tsconfig.json` و `babel.config.js`

---

## 💡 نصائح مهمة

1. **استخدم TypeScript دائماً** - لا تستخدم `any` إلا عند الضرورة القصوى

2. **اختبر على أجهزة حقيقية** - Emulators جيدة لكن الأجهزة الحقيقية أفضل

3. **استخدم React Query للـ API Calls** - سيسهل عليك الـ Caching والـ Refetching

4. **اهتم بالأداء** - استخدم `memo`, `useCallback`, `useMemo` بحكمة

5. **اكتب كود نظيف** - استخدم ESLint وPrettier

---

## 📞 هل تحتاج مساعدة؟

إذا واجهت أي مشكلة:
1. تحقق من الـ Console للأخطاء
2. ابحث في التوثيق
3. اسألني! أنا هنا للمساعدة 😊

---

**بالتوفيق في رحلة التطوير! 🚀**
