# 🧪 دليل اختبار الحل - المشكلة 5

## 📋 نظرة عامة

هذا الدليل يوضح كيفية اختبار نظام التحقق من الملفات المرفوعة للتأكد من أنه يعمل بشكل صحيح.

---

## ✅ سيناريوهات الاختبار

### 1. اختبار رفع ملفات صحيحة

#### Test 1.1: رفع PDF صحيح
```bash
# التحضير
curl -O https://www.example.com/sample.pdf

# الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: admin_session=YOUR_SESSION_TOKEN" \
  -F "file=@sample.pdf" \
  -F 'options={"useOcr":false,"useAiParsing":true}'

# النتيجة المتوقعة
✅ Status: 200
✅ Response: { "uploadId": "...", "status": "PENDING" }
✅ Log: "✅ File validation passed"
✅ Log: "Magic bytes: 25 50 44 46 (%PDF)"
```

#### Test 1.2: رفع DOCX صحيح
```bash
# الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: admin_session=YOUR_SESSION_TOKEN" \
  -F "file=@document.docx" \
  -F 'options={}'

# النتيجة المتوقعة
✅ Status: 200
✅ Detected Type: "docx"
✅ Magic bytes: 50 4b 03 04 (PK..)
```

#### Test 1.3: رفع ABX صحيح (ZIP-based)
```bash
# الرفع
curl -X POST http://localhost:3000/api/admin/books/abx \
  -H "Cookie: admin_session=YOUR_SESSION_TOKEN" \
  -F "file=@book.abx"

# النتيجة المتوقعة
✅ Status: 200
✅ Detected Type: "abx"
✅ Log: "ABX file validation passed"
```

#### Test 1.4: رفع ABX صحيح (XML-based)
```bash
# إنشاء ABX نصي
cat > test.abx << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<هوية_الكتاب>
  <اسم_الكتاب>كتاب الفقه</اسم_الكتاب>
  <اسم_المؤلف>المؤلف</اسم_المؤلف>
</هوية_الكتاب>
<صفحة>
  <متن>النص</متن>
</صفحة>
EOF

# الرفع
curl -X POST http://localhost:3000/api/admin/books/abx \
  -F "file=@test.abx"

# النتيجة المتوقعة
✅ Status: 200
✅ Detected Type: "abx"
✅ Validation: XML content detected
```

---

### 2. اختبار منع التزوير (File Type Spoofing)

#### Test 2.1: ملف EXE متخفي كـ PDF
```bash
# إنشاء ملف تنفيذي وهمي
echo -en '\x4D\x5A\x90\x00' > fake.exe

# إعادة تسميته
mv fake.exe malicious.pdf

# محاولة الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@malicious.pdf"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "File validation failed"
❌ Error: "File content validation failed: Expected PDF but got different file signature"
❌ Log: "⚠️ SECURITY: Magic bytes mismatch"
❌ Log: "actualHeader: 4d 5a 90 00"
```

#### Test 2.2: ملف ZIP متخفي كـ PDF
```bash
# إنشاء ملف ZIP
echo "test" > test.txt
zip test.zip test.txt

# إعادة تسميته
mv test.zip fake-document.pdf

# محاولة الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@fake-document.pdf"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "File content validation failed"
❌ Reason: "Expected PDF (25 50 44 46) but got ZIP (50 4b 03 04)"
```

#### Test 2.3: ملف نصي متخفي كـ PDF
```bash
# إنشاء ملف نصي
echo "This is not a PDF" > not-pdf.txt
mv not-pdf.txt text-as-pdf.pdf

# محاولة الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@text-as-pdf.pdf"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "File content validation failed"
❌ Magic bytes mismatch
```

---

### 3. اختبار حد الحجم

#### Test 3.1: ملف أكبر من 50MB
```bash
# إنشاء ملف 60MB
dd if=/dev/zero of=large.pdf bs=1M count=60

# محاولة الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@large.pdf"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "File size (60.00MB) exceeds maximum allowed size of 50MB"
```

#### Test 3.2: ملف فارغ
```bash
# إنشاء ملف فارغ
touch empty.pdf

# محاولة الرفع
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@empty.pdf"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "File is empty (0 bytes)"
```

---

### 4. اختبار تنظيف أسماء الملفات

#### Test 4.1: Path Traversal
```bash
# إنشاء PDF صحيح
echo "%PDF-1.4" > test.pdf

# الرفع باسم خطر
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@test.pdf;filename=../../etc/passwd.pdf"

# النتيجة المتوقعة
✅ Status: 200 (يُقبل لكن يُنظف)
✅ Sanitized: ".._.._etc_passwd.pdf"
✅ Secure name: "1737123456_abc123_etc_passwd.pdf"
✅ Saved to: "uploads/documents/1737123456_abc123_etc_passwd.pdf"
✅ Log: "⚠️ Filename was sanitized"
```

#### Test 4.2: أحرف خاصة
```bash
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@test.pdf;filename=<script>alert('xss')</script>.pdf"

# النتيجة المتوقعة
✅ Sanitized: "_script_alert__xss___script_.pdf"
✅ Secure name: "1737123456_abc123_script_alert_xss_script_.pdf"
```

#### Test 4.3: Null bytes
```bash
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@test.pdf;filename=test%00.pdf"

# النتيجة المتوقعة
✅ Null bytes removed
✅ Secure filename generated
```

---

### 5. اختبار MIME Type غير صحيح

#### Test 5.1: PDF صحيح مع MIME type خاطئ
```bash
# رفع PDF لكن مع MIME type مختلف
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@sample.pdf;type=application/octet-stream"

# النتيجة المتوقعة
✅ Status: 200 (يُقبل!)
⚠️ Warning: "MIME type mismatch"
✅ Magic bytes: %PDF ✓ (هذا ما يهم)
✅ Log: "Magic bytes validation passed despite MIME mismatch"
```

---

### 6. اختبار حالات ABX الخاصة

#### Test 6.1: ABX نصي مع BOM (UTF-8)
```bash
# إنشاء ABX مع BOM
printf '\xef\xbb\xbf<?xml version="1.0"?>\n<هوية_الكتاب><اسم_الكتاب>Test</اسم_الكتاب></هوية_الكتاب>' > bom-test.abx

# الرفع
curl -X POST http://localhost:3000/api/admin/books/abx \
  -F "file=@bom-test.abx"

# النتيجة المتوقعة
✅ Status: 200
✅ BOM detected and handled
✅ Content validated
```

#### Test 6.2: ABX بدون علامات عربية
```bash
# إنشاء ABX بدون محتوى عربي
cat > invalid.abx << 'EOF'
<?xml version="1.0"?>
<book>
  <title>Test</title>
</book>
EOF

# الرفع
curl -X POST http://localhost:3000/api/admin/books/abx \
  -F "file=@invalid.abx"

# النتيجة المتوقعة
❌ Status: 400
❌ Error: "ABX content validation failed"
❌ Reason: "Missing required Arabic tags"
```

---

### 7. اختبار التسجيل الأمني

#### Test 7.1: فحص السجلات
```bash
# بعد رفع عدة ملفات، افحص السجلات
tail -f logs/security.log

# يجب أن تظهر:
✅ [SECURITY] {"action":"file_uploaded","filename":"..."}
✅ [FILE_SECURITY_INFO] {"event":"upload_attempt","success":true}
```

#### Test 7.2: محاولات مشبوهة
```bash
# بعد محاولة رفع ملف خبيث
grep "validation_failed" logs/security.log

# يجب أن تظهر:
⚠️ [FILE_SECURITY_WARNING] {"event":"validation_failed","errors":[...]}
⚠️ IP address logged
⚠️ File details logged
```

---

## 🤖 اختبار آلي (Automated Tests)

### إنشاء ملف اختبار
```typescript
// tests/file-validation.test.ts

import { validateUploadedFile } from '@/lib/file-validation';

describe('File Validation', () => {

  test('should accept valid PDF', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });

    const result = await validateUploadedFile(file);

    expect(result.valid).toBe(true);
    expect(result.fileInfo?.detectedType).toBe('pdf');
  });

  test('should reject EXE disguised as PDF', async () => {
    const exeBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
    const file = new File([exeBytes], 'malicious.pdf', { type: 'application/pdf' });

    const result = await validateUploadedFile(file);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('file type spoofing'));
  });

  test('should reject file larger than 50MB', async () => {
    const largeBytes = new Uint8Array(51 * 1024 * 1024); // 51MB
    const file = new File([largeBytes], 'large.pdf', { type: 'application/pdf' });

    const result = await validateUploadedFile(file);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('exceeds maximum'));
  });

  test('should sanitize dangerous filenames', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const file = new File([pdfBytes], '../../etc/passwd.pdf', { type: 'application/pdf' });

    const result = await validateUploadedFile(file);

    expect(result.fileInfo?.sanitizedName).not.toContain('../');
    expect(result.fileInfo?.secureName).toMatch(/^\d+_[a-z0-9]+_/);
  });

});
```

### تشغيل الاختبارات
```bash
npm test -- file-validation.test.ts
```

---

## 📊 قائمة التحقق الشاملة

### ✅ اختبارات إلزامية

- [ ] رفع PDF صحيح
- [ ] رفع DOCX صحيح
- [ ] رفع ABX صحيح (ZIP)
- [ ] رفع ABX صحيح (XML)
- [ ] رفض ملف EXE متخفي
- [ ] رفض ملف ZIP متخفي
- [ ] رفض ملف > 50MB
- [ ] رفض ملف فارغ (0 bytes)
- [ ] تنظيف path traversal
- [ ] تنظيف أحرف خاصة
- [ ] قبول PDF مع MIME خاطئ (مع تحذير)

### ⚠️ اختبارات إضافية موصى بها

- [ ] رفع ملفات بأحجام مختلفة (1KB, 1MB, 25MB, 49MB)
- [ ] أسماء ملفات بلغات مختلفة (عربي، صيني، إيموجي)
- [ ] ABX مع BOM
- [ ] ABX بدون محتوى عربي
- [ ] فحص السجلات الأمنية
- [ ] اختبار الأداء (رفع 100 ملف متتالي)

---

## 🐛 إصلاح المشاكل

### المشكلة: "File validation failed" لملف صحيح

**الأسباب المحتملة**:
1. الملف تالف فعلاً
2. Magic bytes غير متطابقة
3. الملف ليس من النوع المتوقع

**الحل**:
```bash
# فحص magic bytes يدوياً
hexdump -C file.pdf | head -n 1

# يجب أن تبدأ بـ:
# PDF:  25 50 44 46  (%PDF)
# DOCX: 50 4b 03 04  (PK..)
```

### المشكلة: ABX صحيح يُرفض

**الحل**:
```bash
# تحقق من المحتوى
cat file.abx | head -n 20

# يجب أن يحتوي على علامات عربية:
# <هوية_الكتاب> أو <صفحة> أو <فهرس>
```

---

## 📞 التواصل

إذا واجهت مشاكل:
1. راجع السجلات: `console` في المتصفح
2. افحص server logs
3. راجع `docs/security/ISSUE_5_FIXED.md`

---

**آخر تحديث**: 20 يناير 2026
