# 🚀 بدء سريع - تشغيل محلي

## الخطوات (3 دقائق فقط!)

### 1️⃣ تثبيت
```bash
npm install
```

### 2️⃣ قاعدة البيانات
```bash
npx prisma generate
npx prisma migrate deploy
```

### 3️⃣ تشغيل
```bash
npm run dev
```

### 4️⃣ إضافة البيانات
افتح terminal جديد وشغّل:
```bash
curl -X POST http://localhost:3000/api/admin/seed
```

---

## ✅ جاهز!

- 🌐 الموقع: http://localhost:3000
- 🔐 Admin: http://localhost:3000/secret-admin-panel-xyz
  - البريد: `admin@islamic-library.com`
  - كلمة المرور: `Admin@123456`

---

## 🐛 إذا واجهت مشكلة

### خطأ في Prisma Client
```bash
npx prisma generate
npm run dev
```

### خطأ في قاعدة البيانات
```bash
rm -rf prisma/dev.db
npx prisma migrate deploy
```

---

## 📚 للمزيد

اقرأ `LOCAL_SETUP_GUIDE.md` للتفاصيل الكاملة
