# 🚀 دليل الإعداد السريع / Quick Setup Guide

## الخطوة 1: إعداد قاعدة البيانات

### خيار 1: استخدام Supabase (موصى به - سهل ومجاني)

1. **إنشاء حساب**:
   - اذهب إلى https://supabase.com
   - قم بإنشاء حساب مجاني
   - اضغط "New Project"

2. **إعداد Project**:
   - اختر اسم المشروع: `islamic-library`
   - اختر Database Password (احفظها)
   - اختر Region: أقرب منطقة لك
   - اضغط "Create new project"

3. **الحصول على DATABASE_URL**:
   - اذهب إلى Project Settings → Database
   - انسخ "Connection string" (URI mode)
   - سيكون بهذا الشكل:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **تحديث .env**:
   ```env
   DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"
   ```

### خيار 2: استخدام Docker (محلي)

```bash
# تشغيل PostgreSQL في Docker
docker run --name islamic-library-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=islamic_library \
  -p 5432:5432 \
  -d postgres:15

# تحديث .env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/islamic_library"
```

---

## الخطوة 2: تطبيق Schema

```bash
# تثبيت Prisma CLI إذا لم يكن مثبتاً
npm install

# تطبيق migrations
npx prisma migrate dev --name init

# توليد Prisma Client
npx prisma generate

# فتح Prisma Studio للتحقق (اختياري)
npx prisma studio
```

---

## الخطوة 3: إنشاء Admin الأول

```bash
# طريقة 1: استخدام Script
npx ts-node scripts/create-admin.ts admin@example.com Admin@123456 "Admin Name"

# طريقة 2: استخدام Prisma Studio
npx prisma studio
# ثم أضف admin يدوياً في جدول admins
# تأكد من hash كلمة المرور باستخدام bcrypt
```

---

## الخطوة 4: تحديث .env

```env
# Database
DATABASE_URL="your-database-url-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"

# Admin Panel Path
NEXT_PUBLIC_ADMIN_SECRET_PATH="secret-admin-panel-xyz"

# Session
SESSION_SECRET="another-random-secret"
```

**توليد Secret Keys**:
```bash
# في terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## الخطوة 5: تشغيل المشروع

```bash
# تشغيل development server
npm run dev

# فتح المتصفح
# الموقع: http://localhost:3000
# Admin Panel: http://localhost:3000/secret-admin-panel-xyz
```

---

## 🔐 بيانات الدخول الافتراضية

إذا استخدمت script create-admin بدون parameters:
- **البريد الإلكتروني**: admin@islamic-library.com
- **كلمة المرور**: Admin@123456

⚠️ **مهم**: غير هذه البيانات فوراً بعد أول تسجيل دخول!

---

## 📊 التحقق من الإعداد

### 1. تحقق من قاعدة البيانات:
```bash
npx prisma studio
```
يجب أن ترى جميع الجداول (admins, categories, books, etc.)

### 2. تحقق من Admin:
- افتح http://localhost:3000/secret-admin-panel-xyz
- سجل دخول بالبيانات
- يجب أن تصل إلى Dashboard

### 3. تحقق من الموقع:
- افتح http://localhost:3000
- يجب أن يعمل بشكل طبيعي

---

## 🛠️ استكشاف الأخطاء

### خطأ: "Can't reach database server"
- **الحل**: تأكد من:
  - قاعدة البيانات تعمل
  - DATABASE_URL صحيح في .env
  - Firewall لا يمنع الاتصال

### خطأ: "prisma command not found"
```bash
npm install
```

### خطأ: "Migration failed"
```bash
# حذف migrations القديمة
rm -rf prisma/migrations

# إعادة المحاولة
npx prisma migrate dev --name init
```

### خطأ: "Admin already exists"
- Admin موجود بالفعل، استخدم البيانات الموجودة
- أو احذف Admin من Prisma Studio وأعد الإنشاء

---

## 📱 الخطوات التالية

بعد إكمال الإعداد:

1. ✅ سجل دخول إلى Admin Panel
2. ✅ أضف التصنيفات
3. ✅ أضف الكتب
4. ✅ اختبر جميع المميزات

---

## 🆘 المساعدة

إذا واجهت أي مشكلة:
1. راجع هذا الملف
2. راجع `DATABASE_IMPLEMENTATION_PLAN.md`
3. تأكد من أن جميع environment variables صحيحة
4. تحقق من logs في terminal

---

## 📚 ملفات مهمة

- `prisma/schema.prisma` - Schema قاعدة البيانات
- `.env` - Environment variables
- `lib/prisma.ts` - Prisma client
- `lib/auth.ts` - Authentication utilities
- `lib/session.ts` - Session management
- `scripts/create-admin.ts` - Script إنشاء admin

---

**تم التطوير بـ ❤️ للمجتمع الإسلامي**
