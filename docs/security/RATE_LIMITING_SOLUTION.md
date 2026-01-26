# 🛡️ حل المشكلة 7: Rate Limiting و CORS

## 📋 المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المشكلة الأصلية](#المشكلة-الأصلية)
3. [الحل المُطبّق](#الحل-المُطبّق)
4. [الميزات الأمنية](#الميزات-الأمنية)
5. [التكوين](#التكوين)
6. [الاختبار](#الاختبار)
7. [الملفات المُنشأة](#الملفات-المُنشأة)

---

## 🎯 نظرة عامة

### الحالة
✅ **تم الحل بالكامل** (20 يناير 2026)

### الأولوية
🟡 مهمة

### الوقت المستغرق
~3 ساعات

---

## ❌ المشكلة الأصلية

### المشاكل المكتشفة

1. **لا يوجد Rate Limiting**
   - أي شخص يمكنه إرسال عدد غير محدود من الطلبات
   - إمكانية إغراق السيرفر (DoS Attack)
   - استهلاك موارد غير ضروري

2. **لا توجد سياسة CORS**
   - أي موقع يمكنه استدعاء API
   - عدم حماية من CSRF attacks
   - تسرب بيانات محتمل

3. **لا توجد Security Headers**
   - عدم حماية من Clickjacking
   - عدم حماية من XSS في بعض المتصفحات
   - عدم إجبار HTTPS في production

4. **لا يوجد Attack Detection**
   - عدم اكتشاف محاولات SQL Injection
   - عدم اكتشاف Path Traversal
   - عدم حظر IPs المشبوهة

---

## ✅ الحل المُطبّق

### 1. Rate Limiting

#### الخصائص
- **الحد**: 100 طلب / 15 دقيقة لكل IP
- **الاستجابة**: HTTP 429 (Too Many Requests)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **التنظيف التلقائي**: كل 30 دقيقة

#### كيف يعمل
```typescript
const rateLimit = new Map<string, RateLimitEntry>();

// فحص عدد الطلبات من نفس IP
const entry = rateLimit.get(ip) || { timestamps: [], suspiciousCount: 0 };
entry.timestamps = entry.timestamps.filter(time => now - time < windowMs);

if (entry.timestamps.length >= maxRequests) {
  return new NextResponse('Too many requests', { status: 429 });
}
```

#### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 2026-01-20T15:30:00.000Z
Retry-After: 900
```

---

### 2. CORS Configuration

#### النطاقات المسموحة
```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://islamic-library.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
];
```

#### CORS Headers
```typescript
// للنطاقات المسموحة فقط
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true

// Preflight requests (OPTIONS)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

### 3. Security Headers

#### جميع الـ Headers المُضافة

```typescript
const SECURITY_HEADERS = {
  // منع التضمين في iframe
  'X-Frame-Options': 'DENY',

  // منع تخمين MIME type
  'X-Content-Type-Options': 'nosniff',

  // سياسة الإحالة
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // حماية من XSS (متصفحات قديمة)
  'X-XSS-Protection': '1; mode=block',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // إجبار HTTPS (production فقط)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};
```

---

### 4. Attack Pattern Detection

#### الأنماط المكتشفة

##### SQL Injection
```regex
/(\%27)|(\')|(\-\-)|(\%23)|(#)/i
/\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i
```

مثال محظور:
```
/api/books?id=1' OR '1'='1
```

##### Path Traversal
```regex
/\.\.[\/\\]/
/\.(env|git|ssh|aws|config)/i
```

مثال محظور:
```
/api/books?file=../../etc/passwd
```

##### Command Injection
```regex
/[;&|`$()]/
```

مثال محظور:
```
/api/books?cmd=ls;rm -rf /
```

##### XSS (Cross-Site Scripting)
```regex
/<script[^>]*>.*?<\/script>/gi
/javascript:/gi
/on\w+\s*=/gi
```

مثال محظور:
```
/api/books?name=<script>alert('xss')</script>
```

---

### 5. IP Blocking System

#### آلية الحظر

1. **اكتشاف نشاط مشبوه**
   - محاولة هجوم (SQL Injection، XSS، إلخ)
   - يتم تسجيلها كـ "suspicious activity"

2. **عتبة الحظر**
   - 3 محاولات مشبوهة → حظر تلقائي
   - 5 محاولات تجاوز Rate Limit → حظر

3. **الاستجابة**
   ```typescript
   if (blockedIPs.has(ip)) {
     console.warn(`[SECURITY] Blocked IP attempted access: ${ip}`);
     return new NextResponse('Access denied', { status: 403 });
   }
   ```

---

## ⚙️ التكوين

### متغيرات البيئة (.env)

```env
# Security & Rate Limiting Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_SUSPICIOUS_THRESHOLD=3

# Security Features
NODE_ENV="development"
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true
ENABLE_ATTACK_DETECTION=true
```

### تعديل الإعدادات

#### تغيير حد الطلبات
```typescript
// في middleware.ts
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
```

#### إضافة نطاق جديد
```typescript
// في middleware.ts
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-new-domain.com', // أضف هنا
];
```

#### تعطيل ميزة (للتطوير فقط)
```typescript
// في middleware.ts
if (process.env.ENABLE_RATE_LIMITING !== 'false') {
  // ... rate limiting logic
}
```

---

## 🧪 الاختبار

### 1. سكريبت اختبار بسيط

```bash
# تشغيل السيرفر
npm run dev

# في نافذة أخرى
node tests/security/test-rate-limit.js
```

#### النتيجة المتوقعة
```
═══════════════════════════════════════════════════════════
🔒 اختبار أمان Middleware
═══════════════════════════════════════════════════════════

✅ الاختبار 3: فحص Rate Limit Headers
   📋 Headers:
      X-RateLimit-Limit: 100
      X-RateLimit-Remaining: 99
      X-RateLimit-Reset: 2026-01-20T15:30:00.000Z
   ✅ الاختبار نجح: جميع Headers موجودة

✅ الاختبار 4: فحص Security Headers
   📋 Security Headers:
      X-Frame-Options: DENY
      X-Content-Type-Options: nosniff
      Referrer-Policy: strict-origin-when-cross-origin
      X-XSS-Protection: 1; mode=block
      CSP: موجود
   ✅ الاختبار نجح: جميع Security Headers موجودة

✅ الاختبار 5: فحص Attack Pattern Detection
   📊 محاولات خبيثة: 3
   🛡️ محظور: 3
   ✅ الاختبار نجح: Attack Detection يعمل

═══════════════════════════════════════════════════════════
📊 النتائج النهائية
═══════════════════════════════════════════════════════════
✅ نجح: 3/3

🎉 جميع الاختبارات نجحت!
```

---

### 2. اختبار يدوي

#### اختبار Rate Limiting
```bash
# إرسال 101 طلب
for i in {1..101}; do
  curl http://localhost:3000/api/books
done
```

الطلب 101 يجب أن يرجع:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
```

#### اختبار CORS
```bash
# نطاق مسموح
curl -H "Origin: http://localhost:3000" http://localhost:3000/api/books

# يجب أن يحتوي على:
Access-Control-Allow-Origin: http://localhost:3000

# نطاق غير مسموح
curl -H "Origin: https://malicious.com" http://localhost:3000/api/books

# يجب ألا يحتوي على:
Access-Control-Allow-Origin
```

#### اختبار Attack Detection
```bash
# SQL Injection
curl "http://localhost:3000/api/books?id=1' OR '1'='1"
# النتيجة: HTTP 400 Bad Request

# Path Traversal
curl "http://localhost:3000/api/books?file=../../etc/passwd"
# النتيجة: HTTP 400 Bad Request

# XSS
curl "http://localhost:3000/api/books?name=<script>alert('xss')</script>"
# النتيجة: HTTP 400 Bad Request
```

---

## 📁 الملفات المُنشأة

### 1. `middleware.ts`
- الملف الرئيسي لـ Middleware
- يحتوي على جميع الميزات الأمنية
- يعمل على جميع `/api/*` و `/admin/*`

**الموقع**: `f:\root ammar\project\conductor_playground\algiers\middleware.ts`

**الحجم**: ~250 سطر

**المحتوى**:
- Rate Limiting logic
- CORS configuration
- Security Headers
- Attack Pattern Detection
- IP Blocking System

---

### 2. `.env.example`
- ملف مثال لمتغيرات البيئة
- يحتوي على جميع الإعدادات المطلوبة
- **تم تحديثه** بإضافة متغيرات الأمان

**الموقع**: `f:\root ammar\project\conductor_playground\algiers\.env.example`

**الإضافات الجديدة**:
```env
# Security & Rate Limiting Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_SUSPICIOUS_THRESHOLD=3
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true
ENABLE_ATTACK_DETECTION=true
```

---

### 3. `tests/security/test-rate-limit.js`
- سكريبت اختبار بسيط (لا يحتاج Jest)
- يختبر جميع الميزات الأمنية
- نتائج واضحة بالعربي

**الموقع**: `f:\root ammar\project\conductor_playground\algiers\tests\security\test-rate-limit.js`

**الاستخدام**:
```bash
node tests/security/test-rate-limit.js
```

---

### 4. `tests/security/rate-limiting.test.ts`
- اختبارات Jest كاملة
- تغطية شاملة لجميع السيناريوهات
- للاستخدام في CI/CD

**الموقع**: `f:\root ammar\project\conductor_playground\algiers\tests\security\rate-limiting.test.ts`

**الاستخدام**:
```bash
npm install --save-dev jest @types/jest ts-jest
npx jest tests/security/rate-limiting.test.ts
```

---

### 5. `docs/security/RATE_LIMITING_SOLUTION.md`
- هذا الملف
- توثيق شامل للحل
- أمثلة وشرح مفصل

**الموقع**: `f:\root ammar\project\conductor_playground\algiers\docs\security\RATE_LIMITING_SOLUTION.md`

---

## 🔧 التعديلات المستقبلية

### إضافة Rate Limiting لكل User (بدلاً من IP)

```typescript
// في middleware.ts
const userId = request.cookies.get('userId')?.value;
const key = userId || ip; // استخدم userId إذا كان موجوداً

const entry = rateLimit.get(key) || { timestamps: [], suspiciousCount: 0 };
```

### استخدام Redis للتخزين (للإنتاج)

```typescript
// تثبيت Redis
npm install ioredis

// في middleware.ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(ip: string) {
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 900); // 15 minutes
  }

  return count <= 100;
}
```

### إضافة Whitelist لـ IPs موثوقة

```typescript
const WHITELISTED_IPS = [
  '127.0.0.1',
  '::1',
  // أضف IPs الإدارة
];

if (WHITELISTED_IPS.includes(ip)) {
  return NextResponse.next(); // تخطي Rate Limiting
}
```

---

## 📊 المقارنة: قبل وبعد

| الميزة | قبل الحل ❌ | بعد الحل ✅ |
|-------|------------|------------|
| Rate Limiting | لا يوجد | 100 طلب / 15 دقيقة |
| CORS | مفتوح للجميع | نطاقات محددة فقط |
| Security Headers | لا يوجد | 6 headers أمنية |
| Attack Detection | لا يوجد | 4 أنواع هجمات |
| IP Blocking | لا يوجد | حظر تلقائي |
| Logging | لا يوجد | تسجيل كامل |

---

## 🎯 الحالة النهائية

### ✅ تم تنفيذ

1. ✅ Rate Limiting: 100 طلب / 15 دقيقة
2. ✅ CORS: نطاقات محددة فقط
3. ✅ Security Headers: 6 headers
4. ✅ Attack Detection: SQL Injection, XSS, Path Traversal, Command Injection
5. ✅ IP Blocking: حظر تلقائي بعد 3 محاولات
6. ✅ Logging: تسجيل جميع الأحداث الأمنية
7. ✅ Testing: سكريبتات اختبار كاملة
8. ✅ Documentation: توثيق شامل

---

## 📞 ملاحظات إضافية

### للتطوير (Development)
- Rate Limiting مفعّل بشكل افتراضي
- يمكن تعطيله بتعيين `ENABLE_RATE_LIMITING=false`
- السجلات (logs) تظهر في console

### للإنتاج (Production)
- **يجب** تفعيل جميع الميزات
- **يجب** استخدام HTTPS (يُفعّل HSTS تلقائياً)
- **يُنصح** باستخدام Redis بدلاً من الذاكرة
- **يُنصح** بمراقبة السجلات بانتظام

---

**آخر تحديث**: 20 يناير 2026
**الحالة**: ✅ **مكتمل وجاهز للاستخدام**
**المسؤول**: Claude AI
