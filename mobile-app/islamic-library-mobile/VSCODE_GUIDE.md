# 🎨 دليل VSCode - تشغيل التطبيق

## ✅ تم إعداد VSCode بالكامل!

---

## 🚀 3 طرق للتشغيل من VSCode

### الطريقة 1: Tasks (الموصى بها) ⭐

#### الخطوات:
1. اضغط **`Ctrl + Shift + P`**
2. اكتب: **`Tasks: Run Task`**
3. اختر: **🚀 Start Expo**

#### أو استخدم الاختصار:
- اضغط **`Ctrl + Shift + B`** (Build Task)
- سيشتغل Expo مباشرة!

#### Tasks المتوفرة:
- 🚀 **Start Expo** - تشغيل عادي
- 📱 **Start on Android** - فتح على Android
- 🍎 **Start on iOS** - فتح على iOS
- 🌐 **Start on Web** - فتح في المتصفح
- 🧹 **Clear Cache & Start** - مسح Cache والتشغيل

---

### الطريقة 2: Terminal المدمج

#### الخطوات:
1. اضغط **`` Ctrl + ` ``** (فتح Terminal)
2. اكتب:
```bash
npm start
```
3. انتظر حتى يظهر QR Code

---

### الطريقة 3: NPM Scripts من Sidebar

#### الخطوات:
1. افتح **Explorer** (Ctrl + Shift + E)
2. ابحث عن قسم **"NPM SCRIPTS"** في الـ Sidebar
3. اضغط على ▶️ بجانب **"start"**

---

## 🔧 إعدادات VSCode المُعدّة تلقائياً

تم إضافة الإعدادات التالية في [`.vscode/`](.vscode/):

### 1. Tasks (tasks.json)
- تشغيل Expo بضغطة زر
- Tasks جاهزة للـ Android/iOS/Web
- Clear Cache عند الحاجة

### 2. Launch Config (launch.json)
- Debug في Expo Go
- Breakpoints جاهزة

### 3. Editor Settings (settings.json)
- Format on Save
- ESLint Auto Fix
- TypeScript IntelliSense
- Emmet Support

### 4. Recommended Extensions (extensions.json)
- ESLint
- Prettier
- Expo Tools
- TypeScript

---

## 🎯 الاختصارات المفيدة في VSCode

| الاختصار | الوظيفة |
|----------|---------|
| `Ctrl + Shift + B` | تشغيل Build Task (Expo) |
| `Ctrl + Shift + P` | Command Palette |
| `` Ctrl + ` `` | فتح/إغلاق Terminal |
| `Ctrl + Shift + E` | فتح Explorer |
| `Ctrl + P` | البحث عن ملف |
| `Ctrl + Shift + F` | البحث في المشروع |
| `F5` | Start Debugging |

---

## 📱 بعد التشغيل

### في Terminal ستظهر:
```
Starting Metro Bundler...
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go
```

### خيارات التشغيل:
```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 🔍 استخدام Debugger

### الطريقة 1: Chrome DevTools
1. شغّل التطبيق: `npm start`
2. اضغط `j` في Terminal
3. ستفتح Chrome DevTools
4. استخدم Console, Network, etc.

### الطريقة 2: VSCode Debugger
1. اضغط `F5`
2. أو اذهب لـ Debug Panel (Ctrl + Shift + D)
3. اختر "🐛 Debug in Expo Go"
4. ضع Breakpoints في الكود
5. اضغط Play ▶️

---

## 🧹 مسح Cache

### من VSCode:
1. `Ctrl + Shift + P`
2. اكتب: `Tasks: Run Task`
3. اختر: **🧹 Clear Cache & Start**

### من Terminal:
```bash
npm start -- -c
```

---

## 🐛 حل مشاكل VSCode

### المشكلة: TypeScript Errors
**الحل:**
1. `Ctrl + Shift + P`
2. اكتب: `TypeScript: Restart TS Server`

### المشكلة: Import غير معروف
**الحل:**
1. تأكد من `tsconfig.json` صحيح
2. أعد تشغيل VSCode
3. `Ctrl + Shift + P` → `Developer: Reload Window`

### المشكلة: ESLint لا يعمل
**الحل:**
1. ثبّت Extension: **ESLint**
2. أعد تشغيل VSCode
3. `Ctrl + Shift + P` → `ESLint: Restart ESLint Server`

---

## 🎨 تحسينات إضافية

### تثبيت Extensions الموصى بها:
عند فتح المشروع، ستظهر رسالة:
> "This workspace has extension recommendations"

**اضغط "Install All"**

### Extensions المهمة:
- ✅ **ESLint** - Code Quality
- ✅ **Prettier** - Code Formatting
- ✅ **Expo Tools** - Expo Support
- ✅ **TypeScript** - IntelliSense

---

## ⚡ نصائح للإنتاجية

1. **استخدم Zen Mode** - `Ctrl + K, Z`
   - تركيز كامل بدون Sidebar

2. **Multi-Cursor Editing** - `Alt + Click`
   - تعديل عدة أسطر مرة واحدة

3. **Command Palette** - `Ctrl + Shift + P`
   - الوصول لكل شيء بسرعة

4. **Quick Open** - `Ctrl + P`
   - فتح أي ملف بكتابة اسمه

5. **Go to Definition** - `F12`
   - الانتقال لتعريف أي Function/Type

6. **Find All References** - `Shift + F12`
   - البحث عن استخدامات Function

---

## 📚 موارد إضافية

### VSCode Docs
- [Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [React Native Tools](https://code.visualstudio.com/docs/nodejs/reactnative-tutorial)

### Expo in VSCode
- [Expo Tools Extension](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools)

---

## ✅ جاهز!

**الآن يمكنك التطوير بكفاءة عالية داخل VSCode! 🚀**

---

_للرجوع للدليل الرئيسي: [README.md](./README.md)_
