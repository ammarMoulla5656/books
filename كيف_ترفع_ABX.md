# كيف ترفع ملفات ABX

## الطريقة السريعة

### 1. تشغيل السيرفر
```bash
npm run dev
```

انتظر حتى ترى:
```
✓ Ready in X.Xs
```

السيرفر سيعمل على: http://localhost:3000

---

### 2. رفع ملف ABX

افتح terminal جديد وشغّل:

```bash
curl -X POST http://localhost:3000/api/admin/books/abx \
  -F "file=@path/to/your-file.abx" \
  -F "title=اسم الكتاب" \
  -F "author=اسم المؤلف" \
  -H "Content-Type: multipart/form-data"
```

**مثال**:
```bash
curl -X POST http://localhost:3000/api/admin/books/abx \
  -F "file=@uploads/abx/1768105414039_17789.abx" \
  -F "title=موسوعة الكلمة" \
  -F "author=السيد حسن الشيرازي"
```

---

### 3. التحقق من النجاح

إذا نجح الرفع، ستحصل على:
```json
{
  "success": true,
  "message": "تم رفع الكتاب بنجاح",
  "book": {
    "id": "...",
    "title": "موسوعة الكلمة",
    "author": "السيد حسن الشيرازي",
    "category": "الأخلاق",
    "pages": 536,
    "chapters": 467
  }
}
```

---

## عرض الكتب

### عرض جميع الكتب
```bash
curl http://localhost:3000/api/books
```

### عرض كتاب معين
```bash
curl http://localhost:3000/api/books/[book-id]
```

حيث `[book-id]` هو الـ id الذي حصلت عليه من الرفع.

---

## المشاكل الشائعة

### خطأ: "Port 3000 is in use"
```bash
# أوقف السيرفر القديم
taskkill //F //PID [PID-number]

# أو
npm run dev
```

### خطأ: "Unauthorized"
المصادقة مُفعّلة. إما:
1. أنشئ حساب admin
2. أو عطّل المصادقة مؤقتاً (للاختبار فقط)

### خطأ: "Database encoding"
قاعدة البيانات ليست UTF-8. شغّل:
```bash
powershell -ExecutionPolicy Bypass -File fix-db-encoding.ps1
```

---

## ملاحظات

- ✅ الملفات المدعومة: `.abx`
- ✅ الحجم الأقصى: 50 MB
- ✅ جميع أنواع ABX مدعومة
- ✅ النصوص العربية تُحفظ بشكل صحيح

---

**تاريخ التحديث**: 20 يناير 2026
