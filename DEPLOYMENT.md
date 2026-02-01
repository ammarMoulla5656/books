# 🚀 دليل النشر - المكتبة الإسلامية

## طرق النشر

### 1. النشر على Vercel (موصى به)

#### أ. النشر السريع
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ammarMoulla5656/books)

#### ب. النشر عبر CLI

1. **تثبيت Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **تسجيل الدخول**
   ```bash
   vercel login
   ```

3. **النشر**
   ```bash
   vercel --prod
   ```

#### ج. إعداد متغيرات البيئة في Vercel

افتح **Project Settings** → **Environment Variables** وأضف:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
SESSION_SECRET=your-session-secret
```

---

### 2. النشر على Netlify

#### أ. ملف `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### ب. متغيرات البيئة

أضف نفس المتغيرات في **Site settings** → **Environment variables**.

---

### 3. النشر على Railway

#### أ. إنشاء مشروع جديد

1. اذهب إلى [Railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. اختر المستودع

#### ب. إضافة PostgreSQL

1. **Add Service** → **Database** → **PostgreSQL**
2. نسخ `DATABASE_URL` تلقائياً

#### ج. إعداد المتغيرات

أضف المتغيرات المتبقية في **Variables**.

---

### 4. النشر على DigitalOcean App Platform

#### أ. إنشاء App

1. اذهب إلى [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. **Create App** → **GitHub**
3. اختر المستودع

#### ب. إعداد Database

1. **Add Resource** → **Managed Database** → **PostgreSQL**
2. ربط DATABASE_URL

---

## إعداد GitHub Actions

### إعداد Secrets

اذهب إلى **Repository Settings** → **Secrets and variables** → **Actions** وأضف:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
DATABASE_URL=your-database-url
NEXTAUTH_URL=your-nextauth-url
NEXTAUTH_SECRET=your-secret
```

### الحصول على Vercel Tokens

1. اذهب إلى [Vercel Settings](https://vercel.com/account/tokens)
2. **Create Token**
3. انسخ القيمة إلى `VERCEL_TOKEN`

للحصول على `ORG_ID` و `PROJECT_ID`:
```bash
vercel project ls
```

---

## إعداد قاعدة البيانات

### Neon (مجاني)

1. اذهب إلى [Neon.tech](https://neon.tech)
2. إنشاء مشروع جديد
3. انسخ `DATABASE_URL`
4. تطبيق migrations:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma migrate deploy
   DATABASE_URL="your-neon-url" npx prisma db seed
   ```

### Supabase (مجاني)

1. اذهب إلى [Supabase](https://supabase.com)
2. **New Project**
3. انسخ `DATABASE_URL` من **Settings** → **Database**
4. تطبيق migrations (نفس الطريقة أعلاه)

---

## التحقق من النشر

بعد النشر، تحقق من:

✅ الصفحة الرئيسية تعمل
✅ قارئ الكتب يعمل
✅ لوحة الإدارة تعمل
✅ API endpoints تعمل
✅ قاعدة البيانات متصلة

---

## استكشاف الأخطاء

### خطأ: "Failed to connect to database"

**الحل**:
```bash
# تحقق من DATABASE_URL
echo $DATABASE_URL

# اختبار الاتصال
psql $DATABASE_URL -c "SELECT 1"
```

### خطأ: "Build failed"

**الحل**:
```bash
# نظف cache
rm -rf .next node_modules
npm install
npm run build
```

### خطأ: "Prisma Client not found"

**الحل**:
```bash
npx prisma generate
npm run build
```

---

## الأداء والتحسين

### 1. تفعيل Edge Runtime

في `app/api/*/route.ts`:
```typescript
export const runtime = 'edge';
```

### 2. تفعيل ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600; // كل ساعة
```

### 3. تحسين الصور

استخدم `next/image`:
```jsx
import Image from 'next/image';

<Image
  src="/cover.jpg"
  width={300}
  height={400}
  alt="Book Cover"
/>
```

---

## المراقبة

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## الدعم

إذا واجهت مشاكل:

1. افحص [الوثائق](docs/)
2. افتح [Issue](https://github.com/ammarMoulla5656/books/issues)
3. راجع [Discussions](https://github.com/ammarMoulla5656/books/discussions)

---

**جاهز للنشر! 🚀**
