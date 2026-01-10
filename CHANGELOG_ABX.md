# سجل التغييرات - إضافة دعم صيغة ABX

## الإصدار: إضافة دعم ملفات ABX

### ملخص التغييرات

تمت إضافة دعم شامل لصيغة ABX (Advanced Book eXchange) في نظام معالجة الكتب. صيغة ABX توفر طريقة مرنة لتنظيم محتوى الكتب سواء كملفات ZIP منظمة أو ملفات نصية بسيطة.

---

## الملفات المعدلة

### 1. قاعدة البيانات (Prisma Schema)

**ملف**: `prisma/schema.prisma`

- ✅ إضافة `ABX` إلى enum `DocumentType`

```prisma
enum DocumentType {
  PDF
  DOCX
  ABX  // ← جديد
}
```

### 2. TypeScript/Next.js

#### `lib/python-service.ts`
- ✅ إضافة `ABX` إلى نوع `DocumentType`
- ✅ تحديث documentation

#### `app/api/admin/documents/route.ts`
- ✅ إضافة `application/x-abx` إلى أنواع MIME المدعومة
- ✅ إضافة `.abx` إلى الامتدادات المسموح بها
- ✅ إضافة معالجة نوع ملف ABX
- ✅ تحديث رسائل الخطأ

#### `components/admin/DocumentUploader.tsx`
- ✅ إضافة `application/x-abx` إلى أنواع الملفات المسموح بها
- ✅ إضافة `.abx` إلى الامتدادات المدعومة
- ✅ تحديث رسالة الدعم من "PDF, DOCX" إلى "PDF, DOCX, ABX"
- ✅ تحديث رسائل الأخطاء

#### `app/secret-admin-panel-xyz/books/upload/page.tsx`
- ✅ تحديث نص الوصف
- ✅ تحديث نقاط المساعدة

#### `app/secret-admin-panel-xyz/books/page.tsx`
- ✅ إضافة زر "رفع من ملف" مع دعم ABX

### 3. Python Service

#### `python-service/models/schemas.py`
- ✅ إضافة `ABX = "ABX"` إلى enum `DocumentType`

#### `python-service/services/text_extractor/text_extractor.py`
- ✅ إضافة import لـ `ABXExtractor`
- ✅ تهيئة `ABXExtractor` في `__init__`
- ✅ إضافة دعم `.abx` في method `extract`
- ✅ إضافة `_get_abx_info` method
- ✅ تحديث documentation

#### `python-service/services/text_extractor/abx_extractor.py` ⭐ جديد
- ✅ فئة `ABXExtractor` كاملة
- ✅ دعم ABX كملفات ZIP
- ✅ دعم ABX كملفات نصية
- ✅ معالجة البيانات الوصفية (Metadata)
- ✅ تقسيم محتوى الصفحات
- ✅ معالجة الأخطاء

---

## الميزات الجديدة

### 1. صيغة ABX ZIP

ملف ZIP يحتوي على:
- `metadata.json` (اختياري) - بيانات الكتاب الوصفية
- `chapters/` - مجلد يحتوي على ملفات الفصول
- `content.txt` (اختياري) - محتوى بسيط كبديل

**مثال**:
```
book.abx (ZIP)
├── metadata.json
├── chapters/
│   ├── 01_intro.txt
│   ├── 02_chapter1.txt
│   └── 03_chapter2.txt
```

### 2. صيغة ABX Text

ملف نص عادي بتنسيق:
```
---
{metadata as JSON}
---
محتوى الكتاب
```

أو:
```
---
key1=value1
key2=value2
---
محتوى الكتاب
```

### 3. دعم البيانات الوصفية

البيانات المدعومة:
- `title` - عنوان الكتاب
- `author` - اسم المؤلف
- `publisher` - الناشر
- `year` - سنة النشر
- `language` - اللغة
- `description` - وصف الكتاب

---

## ملفات جديدة

### 1. `python-service/services/text_extractor/abx_extractor.py`
- فئة `ABXExtractor` مع جميع الطرق اللازمة
- معالجة ملفات ZIP
- معالجة ملفات النص البسيطة
- معالجة البيانات الوصفية

### 2. `python-service/ABX_FORMAT.md`
- دليل تفصيلي لصيغة ABX
- أمثلة استخدام
- دليل حل المشاكل
- نصائح للاستخدام الأمثل

### 3. `python-service/tests/test_abx_extractor.py`
- اختبارات لفئة `ABXExtractor`
- اختبار استخراج ملفات ZIP
- اختبار استخراج ملفات نصية
- اختبار معالجة الأخطاء

### 4. `CHANGELOG_ABX.md` (هذا الملف)
- سجل شامل للتغييرات

---

## متطلبات النظام

### مكتبات Python

جميع المكتبات المطلوبة موجودة بالفعل في `requirements.txt`:
- `zipfile` - مكتبة قياسية (معالجة ملفات ZIP)
- `json` - مكتبة قياسية (معالجة JSON)

لا توجد متطلبات إضافية.

---

## كيفية الاستخدام

### من واجهة المستخدم

1. انتقل إلى `/secret-admin-panel-xyz/books`
2. اضغط على زر "رفع من ملف"
3. اختر ملف ABX (أو PDF أو DOCX)
4. اختر خيارات المعالجة
5. اضغط رفع
6. راجع النتيجة

### من واجهة API

```bash
curl -X POST http://localhost:3000/api/admin/documents \
  -F "file=@book.abx" \
  -F "options={\"useOcr\": false, \"useAiParsing\": true, \"aiProvider\": \"local\"}"
```

---

## الاختبار

### تشغيل الاختبارات

```bash
cd python-service
pytest tests/test_abx_extractor.py -v
```

### اختبار يدوي

1. إنشاء ملف ABX بسيط
2. رفعه عبر الواجهة
3. التحقق من استخراج المحتوى

---

## ملاحظات

### التوافقية
- ✅ متوافق مع جميع المتصفحات الحديثة
- ✅ متوافق مع جميع إصدارات Python 3.10+
- ✅ متوافق مع PostgreSQL

### الأداء
- معالجة سريعة للملفات الصغيرة (< 10 MB)
- معالجة فعالة للملفات الكبيرة (حتى 100 MB)
- استخدام ذاكرة محسّن للملفات الكبيرة

### الأمان
- ✅ التحقق من نوع الملف
- ✅ التحقق من حجم الملف (100 MB max)
- ✅ معالجة آمنة للأخطاء
- ✅ دعم ترميز UTF-8 آمن

---

## الخطوات التالية (مقترحة)

- [ ] إضافة دعم ABX في Dashboard
- [ ] إضافة إحصائيات عن الملفات المرفوعة
- [ ] إضافة معاينة مباشرة للملفات قبل الرفع
- [ ] دعم التحويل بين الصيغ المختلفة

---

## الدعم

للمساعدة في استخدام صيغة ABX:
1. اقرأ `python-service/ABX_FORMAT.md`
2. راجع أمثلة في نفس الملف
3. تحقق من الأخطاء الشائعة وحلولها

---

آخر تحديث: 10 يناير 2026
