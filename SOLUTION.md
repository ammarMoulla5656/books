# 🔧 حل مشكلة Prisma 7 مع SQLite

## المشكلة

Prisma 7 يتطلب إما `adapter` أو `accelerateUrl` في constructor، وهذا يجعل التحويل إلى SQLite معقداً.

## الحلول المتاحة

### الحل 1: الرجوع إلى PostgreSQL (موصى به)

PostgreSQL أسرع على الخادم المحلي من الاتصال بخادم بعيد:

```bash
# تثبيت PostgreSQL محلياً
brew install postgresql  # macOS
# أو
sudo apt install postgresql  # Linux

# تشغيل PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# إنشاء قاعدة بيانات
createdb islamic_library

# تحديث .env
DATABASE_URL="postgresql://localhost:5432/islamic_library"

# تحديث schema.prisma
datasource db {
  provider = "postgresql"
}

# تطبيق migrations
npx prisma migrate deploy
```

### الحل 2: الرجوع إلى Prisma 5 (بسيط)

Prisma 5 يدعم SQLite مباشرة بدون adapter:

```bash
npm install prisma@5 @prisma/client@5

# Schema يبقى كما هو (sqlite)
# lib/prisma.ts البسيط يعمل
```

### الحل 3: استخدام Prisma Accelerate (مدفوع)

للسرعة القصوى:

```bash
# سجل على Prisma Accelerate
# احصل على accelerateUrl
# أضف في lib/prisma.ts:

new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL
})
```

### الحل 4: استخدام Prisma Local (قيد التطوير)

Prisma يعمل على حل لـ SQLite محلي في Prisma 7.

---

## التوصية النهائية

**استخدم PostgreSQL محلياً** لأنه:
- ✅ يعمل مع Prisma 7 بدون مشاكل
- ✅ سريع جداً على نفس الجهاز
- ✅ يدعم جميع المميزات
- ✅ سهل النسخ الاحتياطي

**الخطوات السريعة:**

```bash
# 1. تثبيت وتشغيل PostgreSQL
brew install postgresql
brew services start postgresql

# 2. إنشاء قاعدة بيانات
createdb islamic_library

# 3. تحديث .env
DATABASE_URL="postgresql://localhost:5432/islamic_library"

# 4. استخدام lib/prisma.ts القديم (مع pg adapter)
# 5. تشغيل migrations
npx prisma migrate deploy

# 6. تشغيل المشروع
npm run dev
```

---

أو انتظر تحديث Prisma 7 الذي سيدعم SQLite محلياً بشكل أفضل.
