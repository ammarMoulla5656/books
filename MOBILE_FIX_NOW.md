# 🔧 إصلاح فوري - تطبيق الموبايل

## المشكلة
التثبيت بطيء جداً ويستغرق وقتاً طويلاً.

## ✅ الحل الفوري

### الطريقة 1: انتظر npm install حتى ينتهي
إذا كان npm install لا يزال يعمل، انتظر حتى ينتهي (5-10 دقائق).

ثم:
```bash
cd algiers-mobile
npm start
```

### الطريقة 2: استخدم yarn بدلاً من npm (أسرع!)

```bash
# 1. تثبيت yarn (إذا لم يكن مثبت)
npm install -g yarn

# 2. في مجلد algiers-mobile
cd algiers-mobile

# 3. احذف npm files
rm -rf node_modules package-lock.json

# 4. استخدم yarn
yarn install

# 5. شغّل
yarn start
```

### الطريقة 3: تثبيت يدوي سريع

```bash
cd algiers-mobile

# أوقف npm install إذا كان يعمل (Ctrl+C)

# ثبّت الحزم الأساسية فقط
npm install expo@54.0.0 expo-router@5.0.0 react@18.3.1 react-native@0.76.5

# شغّل
npx expo start
```

---

## 🎯 بعد الانتهاء

عندما ترى:
```
Starting Metro Bundler
› Metro waiting on...
› Scan the QR code above...
```

**QR code سيظهر!** ✅

---

## ⚠️ قبل المسح

1. شغّل Backend:
```bash
cd algiers
npm run dev
```

2. احصل على IP جهازك:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# مثال: 192.168.1.100
```

3. حدّث `algiers-mobile/services/api.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.100:3000'
```

---

## 🚀 التشغيل النهائي

```bash
# Terminal 1: Backend
cd algiers && npm run dev

# Terminal 2: Mobile App
cd algiers-mobile && npm start

# امسح QR code
```

---

**النصيحة الذهبية**: استخدم `yarn` بدلاً من `npm` - أسرع بكثير! 🚀
