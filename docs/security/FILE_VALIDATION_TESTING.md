# 🧪 دليل اختبار التحقق من الملفات

## نظرة عامة

هذا الدليل يوضح كيفية اختبار نظام التحقق الشامل من الملفات المرفوعة.

---

## 🎯 سيناريوهات الاختبار

### 1️⃣ اختبار رفع ملف PDF صحيح ✅

**الملف**: `document.pdf`
**المتوقع**: يُقبل الملف

```bash
# في المتصفح أو Postman:
POST /api/admin/documents
Content-Type: multipart/form-data
File: document.pdf (ملف PDF حقيقي)

# النتيجة المتوقعة:
{
  "uploadId": "clx...",
  "status": "PENDING",
  "message": "Upload successful, processing started"
}
```

**السجلات المتوقعة**:
```
🔒 Starting comprehensive file validation...
✅ File validation passed: {
  detectedType: 'pdf',
  extension: 'pdf',
  size: 1234567,
  secureName: '1768600145280_a7f9k2_document.pdf'
}
🔒 SECURITY EVENT: {
  event: 'upload_attempt',
  filename: '1768600145280_a7f9k2_document.pdf',
  success: true
}
```

---

### 2️⃣ اختبار تزوير نوع الملف ❌

**الهجوم**: إعادة تسمية `virus.exe` إلى `document.pdf`

```bash
# خطوات المحاكاة:
1. خذ أي ملف .exe
2. أعد تسميته إلى document.pdf
3. حاول رفعه

# النتيجة المتوقعة:
{
  "error": "File validation failed",
  "errors": [
    "File content does not match any allowed file type...",
    "⚠️ SECURITY: File content validation failed..."
  ]
}
```

**السجلات المتوقعة**:
```
❌ File validation failed: [
  "File content does not match any allowed file type",
  "⚠️ SECURITY: File content validation failed"
]
🔒 SECURITY EVENT: {
  event: 'validation_failed',
  filename: 'document.pdf',
  errors: [...],
  ip: "xxx.xxx.xxx.xxx"
}
```

**التفسير**:
Magic bytes لملف EXE (عادة `MZ` أو `0x4D5A`) لا تطابق توقيع PDF (`%PDF` أو `0x25504446`)

---

### 3️⃣ اختبار ملف كبير جداً ❌

**الهجوم**: رفع ملف 100MB

```bash
# إنشاء ملف كبير للاختبار:
dd if=/dev/zero of=large.pdf bs=1M count=100

# محاولة الرفع
POST /api/admin/documents
File: large.pdf (100MB)

# النتيجة المتوقعة:
{
  "error": "File validation failed",
  "errors": [
    "File size (100.00 MB) exceeds maximum allowed size of 50 MB"
  ]
}
```

---

### 4️⃣ اختبار Path Traversal ❌

**الهجوم**: رفع ملف باسم `../../etc/passwd.pdf`

```bash
# محاولة الرفع
POST /api/admin/documents
Filename: ../../etc/passwd.pdf

# النتيجة:
- الاسم يُنظف إلى: _etc_passwd.pdf
- ثم يُضاف timestamp وrandom: 1768600145280_a7f9k2_etc_passwd.pdf
- الملف يُحفظ في: uploads/documents/ فقط

# ✅ لا يمكن الوصول خارج مجلد uploads
```

---

### 5️⃣ اختبار Null Byte Injection ❌

**الهجوم**: `document.pdf%00.exe`

```bash
# محاولة الرفع
Filename: document.pdf\x00.exe

# النتيجة:
- Null byte يُزال
- الاسم يصبح: document.pdf.exe
- ثم يُرفض لأن .exe غير مسموح
```

---

### 6️⃣ اختبار DOCX حقيقي ✅

```bash
# رفع ملف DOCX صحيح
POST /api/admin/documents
File: document.docx

# النتيجة:
✅ يُقبل (magic bytes: PK.. يطابق ZIP/DOCX)
```

---

### 7️⃣ اختبار ABX (XML) ✅

```bash
# رفع ملف ABX بصيغة XML
POST /api/admin/documents
File: book.abx (XML-based)

# النتيجة:
✅ يُقبل (magic bytes: <?xml)
```

---

### 8️⃣ اختبار ABX (ZIP) ✅

```bash
# رفع ملف ABX مضغوط
POST /api/admin/documents
File: book.abx (ZIP-based)

# النتيجة:
✅ يُقبل (magic bytes: PK..)
```

---

### 9️⃣ اختبار تزوير MIME Type ❌

```bash
# في المتصفح، تغيير MIME type يدوياً:
File: virus.exe
MIME Type: application/pdf (مزور)

# النتيجة:
⚠️ تحذير: MIME type غير صحيح
❌ رفض: magic bytes لا تطابق PDF
```

---

### 🔟 اختبار أحرف خاصة في الاسم

```bash
# اسم الملف: "كتاب السيستاني <>.pdf"
POST /api/admin/documents
Filename: كتاب السيستاني <>.pdf

# النتيجة:
- الأحرف العربية: محفوظة ✅
- < و >: يُستبدلان بـ _
- الاسم النهائي: 1768600145280_a7f9k2_كتاب_السيستاني___.pdf
```

---

## 📊 جدول النتائج المتوقعة

| الاختبار | الملف | المتوقع | السبب |
|---------|------|---------|-------|
| PDF صحيح | document.pdf | ✅ قبول | Magic bytes صحيحة |
| EXE → PDF | virus.exe → .pdf | ❌ رفض | Magic bytes خاطئة |
| ملف كبير | 100MB.pdf | ❌ رفض | يتجاوز 50MB |
| Path Traversal | ../../file.pdf | ✅ منظف | يُزال ../ |
| Null Byte | file.pdf%00.exe | ❌ رفض | يُزال null byte ثم .exe مرفوض |
| DOCX صحيح | doc.docx | ✅ قبول | Magic bytes PK.. |
| ABX XML | book.abx | ✅ قبول | Magic bytes <?xml |
| ABX ZIP | book.abx | ✅ قبول | Magic bytes PK.. |
| MIME مزور | virus (MIME=pdf) | ❌ رفض | Magic bytes تكشف الحقيقة |
| أحرف خاصة | <ملف>.pdf | ✅ منظف | الأحرف الخاصة تُستبدل |

---

## 🔍 كيفية مراقبة السجلات

### أثناء التطوير

```bash
# في terminal:
npm run dev

# راقب السجلات:
# ✅ نجاح:
🔒 Starting comprehensive file validation...
✅ File validation passed

# ❌ فشل:
❌ File validation failed: [...]
🔒 SECURITY EVENT: validation_failed
```

### في الإنتاج

```bash
# راقب PM2 logs:
pm2 logs islamic-library

# ابحث عن:
grep "SECURITY EVENT" logs/app.log
grep "validation_failed" logs/app.log
```

---

## 🛠️ أدوات الاختبار

### Postman

```
POST https://localhost:3000/api/admin/documents
Headers:
  Cookie: admin_session=...
Body:
  form-data
    file: [اختر الملف]
    options: {"useOcr": false}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -F "file=@document.pdf" \
  -F 'options={"useOcr":false}'
```

### Browser DevTools

1. افتح لوحة الإدارة
2. افتح DevTools (F12)
3. اذهب إلى Network tab
4. ارفع ملف
5. راقب الـ Request/Response

---

## 🎭 اختبار الاختراق (Penetration Testing)

### أدوات مفيدة

1. **Burp Suite**: اعتراض وتعديل الطلبات
2. **OWASP ZAP**: فحص أمني تلقائي
3. **hexedit**: تعديل magic bytes للاختبار

### سيناريو متقدم: تعديل Magic Bytes

```bash
# 1. خذ ملف EXE
hexdump -C virus.exe | head

# 2. عدّل أول 4 بايت إلى %PDF
printf '\x25\x50\x44\x46' | dd of=fake.pdf bs=1 count=4 conv=notrunc
cat virus.exe >> fake.pdf

# 3. حاول الرفع
# النتيجة: سيُقبل أول 4 بايت، لكن:
# - إذا فحص الفيروسات مُفعّل: سيُكتشف
# - عند محاولة معالجة PDF: سيفشل
```

**الحماية الإضافية المطلوبة**:
- فحص أعمق للبنية (Deep inspection)
- فحص الفيروسات الشامل

---

## ✅ قائمة تحقق الاختبار

قبل نشر النظام، تأكد من:

- [ ] رفع PDF صحيح يعمل
- [ ] رفع DOCX صحيح يعمل
- [ ] رفع ABX (XML) يعمل
- [ ] رفع ABX (ZIP) يعمل
- [ ] رفض EXE مُعاد تسميته
- [ ] رفض ملفات > 50MB
- [ ] تنظيف Path Traversal
- [ ] إزالة Null Bytes
- [ ] تنظيف الأحرف الخاصة
- [ ] الحفاظ على الأحرف العربية
- [ ] تسجيل الأحداث الأمنية
- [ ] عرض رسائل خطأ واضحة

---

## 🚨 التعامل مع المشاكل

### مشكلة: "ملف PDF صحيح يُرفض"

**الحل**:
1. تحقق من magic bytes:
   ```bash
   hexdump -C file.pdf | head -1
   # يجب أن ترى: 25 50 44 46 (%PDF)
   ```
2. بعض PDFs قد تبدأ بـ whitespace - أضف دعماً لهذه الحالة

### مشكلة: "DOCX يُرفض"

**الحل**:
- DOCX هو ZIP في الأساس
- تأكد أن magic bytes PK.. (50 4B 03 04) مدعومة

### مشكلة: "ABX XML يُرفض"

**الحل**:
- تحقق من وجود BOM (0xEF 0xBB 0xBF)
- تأكد من دعم كل من:
  - `<?xml` فقط
  - BOM + `<?xml`

---

## 📚 مراجع إضافية

- [List of file signatures](https://en.wikipedia.org/wiki/List_of_file_signatures)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Magic Bytes Database](https://www.garykessler.net/library/file_sigs.html)

---

**آخر تحديث**: 20 يناير 2026
