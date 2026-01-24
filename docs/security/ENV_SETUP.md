# 🔐 إعداد المتغيرات البيئية بشكل آمن

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الإعداد الأولي](#الإعداد-الأولي)
3. [توليد القيم الآمنة](#توليد-القيم-الآمنة)
4. [التحقق من الإعداد](#التحقق-من-الإعداد)
5. [بيئة الإنتاج](#بيئة-الإنتاج)
6. [تدوير كلمات المرور](#تدوير-كلمات-المرور)
7. [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## 🎯 نظرة عامة

### لماذا هذا مهم؟

المتغيرات البيئية تحتوي على معلومات حساسة جداً:
- 🔑 كلمات مرور قاعدة البيانات
- 🔐 مفاتيح التشفير والجلسات
- 🌐 عناوين الخوادم الخارجية
- ⚙️ إعدادات الأمان

**إذا وقعت هذه المعلومات في الأيدي الخاطئة، يمكن اختراق التطبيق بالكامل!**

### القواعد الذهبية

1. ❌ **أبداً** لا ترفع ملف `.env` على Git
2. ❌ **أبداً** لا تشارك ملف `.env` عبر البريد أو Slack
3. ❌ **أبداً** لا تستخدم كلمات مرور بسيطة أو افتراضية
4. ✅ **دائماً** استخدم `.env.example` كقالب فقط
5. ✅ **دائماً** ولّد قيم عشوائية آمنة
6. ✅ **دائماً** غيّر كلمات المرور دورياً

---

## 🚀 الإعداد الأولي

### الخطوة 1: نسخ القالب

```bash
# نسخ ملف القالب
cp .env.example .env

# التحقق من أن .env موجود في .gitignore
cat .gitignore | grep ".env"
```

يجب أن ترى:
```
.env*
```

### الخطوة 2: توليد القيم الآمنة

**⚠️ لا تستخدم القيم من `.env.example` مباشرة!**

استخدم هذه الأوامر لتوليد قيم آمنة:

#### قاعدة البيانات (DATABASE_URL)

```bash
# توليد كلمة مرور عشوائية قوية (24 حرف)
openssl rand -base64 24

# مثال على النتيجة:
# Kj8mP2nL9xQ4vR7wZ5tY3uS6
```

ثم استبدل في `.env`:
```env
DATABASE_URL="postgresql://postgres:Kj8mP2nL9xQ4vR7wZ5tY3uS6@localhost:5432/islamic_library"
```

#### كلمة مرور الإدارة (ADMIN_INITIAL_PASSWORD)

```bash
# توليد كلمة مرور قوية للمدير (32 حرف)
openssl rand -base64 32

# مثال:
# Xy9Lm3Pq8Rn4Wz7Vt2Kb6Jh5Ng1Df0Cs
```

ضعها في `.env`:
```env
ADMIN_INITIAL_PASSWORD="Xy9Lm3Pq8Rn4Wz7Vt2Kb6Jh5Ng1Df0Cs"
```

**⚠️ احفظ هذه الكلمة في مكان آمن! ستحتاجها لأول تسجيل دخول.**

#### مفتاح الجلسة (SESSION_SECRET)

```bash
# توليد مفتاح تشفير الجلسات (64 حرف)
openssl rand -base64 64

# مثال:
# Hs8Kj9Lm3Pq4Rn7Wz2Vt6Kb1Jh5Ng0Df9Cs...
```

ضعه في `.env`:
```env
SESSION_SECRET="Hs8Kj9Lm3Pq4Rn7Wz2Vt6Kb1Jh5Ng0Df9Cs..."
```

#### مفتاح NEXTAUTH_SECRET

```bash
openssl rand -base64 64
```

```env
NEXTAUTH_SECRET="توليد_مفتاح_عشوائي_هنا"
```

#### مفتاح CRON_SECRET

```bash
openssl rand -hex 32
```

```env
CRON_SECRET="مفتاح_hex_عشوائي_هنا"
```

### الخطوة 3: ملء باقي القيم

```env
# عنوان خدمة Python
PYTHON_SERVICE_URL="http://localhost:5000"

# عنوان التطبيق
NEXTAUTH_URL="http://localhost:3000"

# مسار لوحة التحكم السري (غيّره!)
NEXT_PUBLIC_ADMIN_SECRET_PATH="your-unique-secret-path-2024"

# مدة الجلسة (بالساعات)
SESSION_DURATION_HOURS=24
```

---

## 🔍 التحقق من الإعداد

### التحقق التلقائي

التطبيق يتحقق من المتغيرات عند البدء:

```bash
npm run dev
```

إذا كان هناك مشاكل، سترى رسائل مثل:

```
❌ Environment Validation Failed:
  1. DATABASE_URL uses an insecure password: "iioopp00"
  2. ADMIN_INITIAL_PASSWORD is still set to the default example value
  3. SESSION_SECRET should be at least 32 characters long
```

### التحقق اليدوي

تأكد من:

1. ✅ كل القيم مملوءة (لا توجد قيم فارغة)
2. ✅ لا توجد قيم من `.env.example`
3. ✅ كلمات المرور قوية (20+ حرف)
4. ✅ لا توجد كلمات مرور بسيطة مثل:
   - `password`
   - `admin123`
   - `123456`
   - `iioopp00`

---

## 🌐 بيئة الإنتاج

### الفرق بين Development و Production

| الإعداد | Development | Production |
|---------|-------------|------------|
| DATABASE_URL | localhost | خادم قاعدة بيانات خارجي |
| NODE_ENV | development | production |
| NEXTAUTH_URL | http://localhost:3000 | https://yourdomain.com |
| DEBUG | true (اختياري) | **false** |
| FORCE_HTTPS | false | **true** |

### استخدام Secrets Manager

#### AWS Secrets Manager

```bash
# تخزين سر في AWS
aws secretsmanager create-secret \
  --name islamic-library/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# استرجاع السر
aws secretsmanager get-secret-value \
  --secret-id islamic-library/database-url \
  --query SecretString \
  --output text
```

في الكود:
```typescript
// lib/secrets.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export async function getDatabaseUrl() {
  const client = new SecretsManager({ region: 'us-east-1' });
  const response = await client.getSecretValue({
    SecretId: 'islamic-library/database-url'
  });
  return response.SecretString;
}
```

#### Azure Key Vault

```bash
# إنشاء Key Vault
az keyvault create --name islamic-library-kv --resource-group myRG

# تخزين سر
az keyvault secret set \
  --vault-name islamic-library-kv \
  --name database-url \
  --value "postgresql://..."

# استرجاع سر
az keyvault secret show \
  --vault-name islamic-library-kv \
  --name database-url \
  --query value -o tsv
```

#### Docker Secrets

```bash
# إنشاء ملف سر
echo "postgresql://..." | docker secret create db_url -

# استخدامه في docker-compose.yml
services:
  app:
    secrets:
      - db_url
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url

secrets:
  db_url:
    external: true
```

### متغيرات بيئة Production الموصى بها

```env
# Production Environment Variables

# Database (from Secrets Manager)
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/islamic_library?sslmode=require"

# URLs
NEXTAUTH_URL="https://islamic-library.example.com"
PYTHON_SERVICE_URL="https://python-service.internal:5000"

# Security
NODE_ENV=production
FORCE_HTTPS=true
DEBUG=false
DISABLE_AUTH=false

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15

# CORS
ALLOWED_ORIGINS="https://islamic-library.example.com,https://www.islamic-library.example.com"

# Session
SESSION_DURATION_HOURS=24

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
```

---

## 🔄 تدوير كلمات المرور

### متى تدوّر كلمات المرور؟

- 📅 كل 90 يوم (أفضل ممارسة)
- 🚨 فوراً إذا:
  - تم اختراق السيرفر
  - غادر موظف لديه وصول
  - تم تسريب `.env` عن طريق الخطأ
  - اشتبهت في نشاط مشبوه

### كيفية تدوير كلمة مرور قاعدة البيانات

#### الخطوة 1: إنشاء كلمة مرور جديدة

```bash
NEW_PASSWORD=$(openssl rand -base64 24)
echo "كلمة المرور الجديدة: $NEW_PASSWORD"
```

#### الخطوة 2: تحديث قاعدة البيانات

```bash
# الاتصال بقاعدة البيانات
psql -U postgres -d islamic_library

# تغيير كلمة المرور
ALTER USER postgres WITH PASSWORD 'NEW_PASSWORD_HERE';
\q
```

#### الخطوة 3: تحديث .env

```env
DATABASE_URL="postgresql://postgres:NEW_PASSWORD_HERE@localhost:5432/islamic_library"
```

#### الخطوة 4: إعادة تشغيل التطبيق

```bash
# إذا كنت تستخدم PM2
pm2 restart islamic-library

# أو
npm run dev
```

#### الخطوة 5: التحقق

```bash
# اختبر الاتصال
npm run test:db-connection
```

### تدوير مفاتيح الجلسات

```bash
# توليد مفتاح جديد
NEW_SECRET=$(openssl rand -base64 64)

# تحديث .env
# SESSION_SECRET="$NEW_SECRET"

# إعادة التشغيل
pm2 restart islamic-library
```

**⚠️ ملاحظة**: تدوير `SESSION_SECRET` سيجعل كل الجلسات الحالية غير صالحة، وسيحتاج المستخدمون لتسجيل الدخول مرة أخرى.

---

## 📦 النسخ الاحتياطي الآمن

### كيفية أخذ نسخة احتياطية من .env

```bash
# أخذ نسخة احتياطية مشفرة
# 1. إنشاء نسخة احتياطية
cp .env .env.backup

# 2. تشفيرها
gpg --symmetric --cipher-algo AES256 .env.backup

# 3. حذف النسخة غير المشفرة
rm .env.backup

# 4. تخزين .env.backup.gpg في مكان آمن
```

### استرجاع النسخة الاحتياطية

```bash
# فك التشفير
gpg --decrypt .env.backup.gpg > .env

# التحقق
cat .env
```

---

## ❓ الأسئلة الشائعة

### س: هل يمكنني استخدام نفس .env في Development و Production؟

**ج**: ❌ لا! استخدم ملفات منفصلة:
- `.env` - للتطوير المحلي
- `.env.production` - للإنتاج (على السيرفر فقط)

### س: رفعت .env على Git عن طريق الخطأ، ماذا أفعل؟

**ج**: اتبع هذه الخطوات **فوراً**:

1. غيّر **جميع** كلمات المرور والمفاتيح
2. أزل الملف من Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```
3. راجع access logs لأي نشاط مشبوه

### س: كيف أشارك .env مع فريقي؟

**ج**: ❌ لا تشارك `.env` مباشرة!

بدلاً من ذلك:
1. شارك `.env.example` عبر Git
2. أرسل القيم الحقيقية عبر:
   - Password manager (1Password, LastPass)
   - Secrets manager (AWS, Azure)
   - اتصال آمن مشفر (Signal, encrypted email)

### س: هل أحتاج لتدوير المفاتيح حتى لو لم يحدث اختراق؟

**ج**: ✅ نعم! التدوير الدوري (كل 90 يوم) هو أفضل ممارسة أمنية.

### س: ماذا لو نسيت ADMIN_INITIAL_PASSWORD؟

**ج**: يمكنك إعادة تعيينها:

```bash
# 1. توليد كلمة مرور جديدة
NEW_PASS=$(openssl rand -base64 32)
echo "كلمة المرور الجديدة: $NEW_PASS"

# 2. تشغيل script إعادة التعيين
npm run reset-admin-password

# 3. استخدم الكلمة الجديدة لتسجيل الدخول
```

---

## 🔗 روابط مفيدة

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [AWS Secrets Manager Docs](https://docs.aws.amazon.com/secretsmanager/)
- [Azure Key Vault Docs](https://docs.microsoft.com/azure/key-vault/)
- [12 Factor App - Config](https://12factor.net/config)

---

## 📞 الدعم

إذا واجهت مشاكل في إعداد المتغيرات:

1. راجع [SECURITY_FIX_PLAN.md](./SECURITY_FIX_PLAN.md)
2. راجع رسائل الأخطاء في console
3. تأكد من أن جميع المتغيرات المطلوبة موجودة

---

**آخر تحديث**: 20 يناير 2026
**الإصدار**: 1.0
**الحالة**: ✅ جاهز للاستخدام
