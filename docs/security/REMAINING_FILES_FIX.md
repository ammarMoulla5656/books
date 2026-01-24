# 🔧 تطبيق المصادقة على الملفات المتبقية

## التعليمات لكل ملف

سأوفر لك التعديلات الدقيقة لكل ملف. **انسخ والصق** هذه التغييرات:

---

## الملف 1: `/app/api/admin/documents/[id]/status/route.ts`

### التعديل المطلوب:

**1. أضف في الأعلى (بعد الـ imports الموجودة)**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في بداية دالة GET** (أول سطر بعد `export async function GET`):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/status', request);
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## الملف 2: `/app/api/admin/documents/[id]/toc/route.ts`

### التعديل المطلوب:

**1. أضف Import**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في GET**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/toc (GET)', request);
    return authCheck.error;
  }

  // ... باقي الكود
}
```

**3. في PUT**:
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/toc (PUT)', request);
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## الملف 3: `/app/api/admin/documents/[id]/confirm/route.ts`

### التعديل المطلوب:

**1. أضف Import**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في POST**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/confirm', request);
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## الملف 4: `/app/api/admin/scrape-book/[bookId]/route.ts`

### التعديل المطلوب:

**1. أضف Import**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في POST**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/scrape-book/[bookId]', request, 'Attempted to scrape book without auth');
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## الملف 5: `/app/api/admin/scrape-book-enhanced/[bookId]/route.ts`

### التعديل المطلوب:

**1. أضف Import**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في POST**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/scrape-book-enhanced/[bookId]', request, 'Attempted enhanced scraping without auth');
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## الملف 6: `/app/api/admin/books/abx/route.ts`

### التعديل المطلوب:

**1. أضف Import**:
```typescript
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
```

**2. في POST**:
```typescript
export async function POST(request: NextRequest) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/books/abx', request, 'Attempted ABX upload without auth');
    return authCheck.error;
  }

  // ... باقي الكود
}
```

---

## قائمة التحقق

بعد تطبيق جميع التعديلات:

- [ ] ✅ الملف 1: `documents/[id]/status/route.ts`
- [ ] ✅ الملف 2: `documents/[id]/toc/route.ts`
- [ ] ✅ الملف 3: `documents/[id]/confirm/route.ts`
- [ ] ✅ الملف 4: `scrape-book/[bookId]/route.ts`
- [ ] ✅ الملف 5: `scrape-book-enhanced/[bookId]/route.ts`
- [ ] ✅ الملف 6: `books/abx/route.ts`

---

## الاختبار السريع

```bash
# اختبار بدون مصادقة (يجب أن يفشل)
curl -X POST http://localhost:3000/api/admin/scrape-book/123
curl -X GET http://localhost:3000/api/admin/documents/123/status

# النتيجة المتوقعة:
# {"error":"Unauthorized. Admin authentication required.","code":"UNAUTHORIZED","timestamp":"..."}
```

---

**إجمالي**: 6 ملفات × ~10 دقائق = ساعة واحدة
