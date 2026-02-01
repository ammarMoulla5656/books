# 📦 دليل المكونات - UI Components Guide

## نظرة عامة

تم إنشاء 6 مكونات أساسية قابلة لإعادة الاستخدام في `src/components/common/`:

1. **Button** - زر بأشكال وأحجام مختلفة
2. **Input** - حقل إدخال مع دعم التحقق
3. **Card** - بطاقة عرض
4. **LoadingSpinner** - مؤشر تحميل
5. **ErrorMessage** - رسالة خطأ
6. **EmptyState** - حالة فارغة

---

## 1. Button Component

### الوصف
زر قابل لإعادة الاستخدام مع 5 أنواع و 3 أحجام مختلفة.

### الاستيراد
```typescript
import { Button } from '@/components';
```

### الأنواع (Variants)
- `primary` - اللون الأساسي (افتراضي)
- `secondary` - اللون الثانوي
- `outline` - إطار فقط
- `ghost` - شفاف
- `danger` - للعمليات الخطرة

### الأحجام (Sizes)
- `small` - صغير (32px)
- `medium` - متوسط (44px) - افتراضي
- `large` - كبير (52px)

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| title | string | required | نص الزر |
| variant | ButtonVariant | 'primary' | نوع الزر |
| size | ButtonSize | 'medium' | حجم الزر |
| loading | boolean | false | حالة التحميل |
| disabled | boolean | false | تعطيل الزر |
| leftIcon | React.ReactNode | - | أيقونة يسار النص |
| rightIcon | React.ReactNode | - | أيقونة يمين النص |
| fullWidth | boolean | false | عرض كامل |
| onPress | function | - | دالة عند الضغط |

### أمثلة

#### زر أساسي
```typescript
<Button
  title="تسجيل الدخول"
  onPress={() => console.log('Pressed')}
/>
```

#### زر مع تحميل
```typescript
<Button
  title="جاري التحميل..."
  loading={true}
  disabled={true}
/>
```

#### زر Outline
```typescript
<Button
  title="إلغاء"
  variant="outline"
  onPress={handleCancel}
/>
```

#### زر مع أيقونة
```typescript
<Button
  title="حفظ"
  leftIcon={<Icon name="save" />}
  onPress={handleSave}
/>
```

#### زر كامل العرض
```typescript
<Button
  title="متابعة"
  fullWidth
  size="large"
  onPress={handleContinue}
/>
```

---

## 2. Input Component

### الوصف
حقل إدخال مع دعم Label، أيقونات، رسائل خطأ، وإخفاء/إظهار النص.

### الاستيراد
```typescript
import { Input } from '@/components';
```

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| label | string | - | تسمية الحقل |
| placeholder | string | - | نص placeholder |
| value | string | - | القيمة |
| onChangeText | function | - | دالة التغيير |
| helperText | string | - | نص المساعدة |
| errorText | string | - | رسالة الخطأ |
| error | boolean | false | حالة الخطأ |
| leftIcon | React.ReactNode | - | أيقونة يسار |
| rightIcon | React.ReactNode | - | أيقونة يمين |
| secureTextEntry | boolean | false | إخفاء النص (password) |
| disabled | boolean | false | تعطيل الحقل |
| multiline | boolean | false | عدة أسطر |
| numberOfLines | number | 1 | عدد الأسطر |
| fullWidth | boolean | true | عرض كامل |

### أمثلة

#### حقل بسيط
```typescript
<Input
  label="البريد الإلكتروني"
  placeholder="أدخل بريدك الإلكتروني"
  value={email}
  onChangeText={setEmail}
/>
```

#### حقل مع خطأ
```typescript
<Input
  label="كلمة المرور"
  value={password}
  onChangeText={setPassword}
  error={!!passwordError}
  errorText={passwordError}
/>
```

#### حقل password
```typescript
<Input
  label="كلمة المرور"
  placeholder="********"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

#### حقل مع أيقونة
```typescript
<Input
  label="البحث"
  placeholder="ابحث عن كتاب..."
  value={search}
  onChangeText={setSearch}
  leftIcon={<Icon name="search" />}
/>
```

#### حقل multiline
```typescript
<Input
  label="الملاحظات"
  placeholder="اكتب ملاحظاتك هنا..."
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
/>
```

---

## 3. Card Component

### الوصف
بطاقة عرض قابلة لإعادة الاستخدام مع 3 أنواع.

### الاستيراد
```typescript
import { Card, CardHeader, CardBody, CardFooter } from '@/components';
```

### الأنواع (Variants)
- `default` - ظل خفيف (افتراضي)
- `elevated` - ظل متوسط
- `outlined` - إطار فقط

### المكونات الفرعية
- `CardHeader` - رأس البطاقة
- `CardBody` - جسم البطاقة
- `CardFooter` - ذيل البطاقة

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| children | React.ReactNode | required | المحتوى |
| variant | CardVariant | 'default' | نوع البطاقة |
| pressable | boolean | false | قابلة للضغط |
| onPress | function | - | دالة عند الضغط |

### أمثلة

#### بطاقة بسيطة
```typescript
<Card>
  <CardBody>
    <Text>محتوى البطاقة</Text>
  </CardBody>
</Card>
```

#### بطاقة كاملة
```typescript
<Card variant="elevated">
  <CardHeader>
    <Text style={styles.title}>عنوان الكتاب</Text>
  </CardHeader>
  <CardBody>
    <Text>وصف الكتاب...</Text>
  </CardBody>
  <CardFooter>
    <Button title="قراءة" onPress={handleRead} />
  </CardFooter>
</Card>
```

#### بطاقة قابلة للضغط
```typescript
<Card
  pressable
  onPress={() => navigation.navigate('BookDetails', { id: book.id })}
>
  <CardBody>
    <Image source={{ uri: book.cover }} />
    <Text>{book.title}</Text>
  </CardBody>
</Card>
```

---

## 4. LoadingSpinner Component

### الوصف
مؤشر تحميل مع رسالة اختيارية و overlay.

### الاستيراد
```typescript
import { LoadingSpinner, LoadingOverlay } from '@/components';
```

### الأحجام (Sizes)
- `small` - صغير
- `medium` - متوسط (افتراضي)
- `large` - كبير

### الخصائص - LoadingSpinner

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| size | LoadingSize | 'medium' | حجم المؤشر |
| message | string | - | رسالة التحميل |
| color | string | primary | لون المؤشر |
| fullScreen | boolean | false | ملء الشاشة |

### الخصائص - LoadingOverlay

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| visible | boolean | required | إظهار الطبقة |
| message | string | - | رسالة التحميل |
| backgroundColor | string | rgba(0,0,0,0.5) | لون الخلفية |

### أمثلة

#### مؤشر بسيط
```typescript
<LoadingSpinner />
```

#### مؤشر مع رسالة
```typescript
<LoadingSpinner
  size="large"
  message="جاري تحميل الكتب..."
/>
```

#### مؤشر ملء الشاشة
```typescript
<LoadingSpinner
  fullScreen
  message="يرجى الانتظار..."
/>
```

#### Overlay للتحميل
```typescript
<View>
  {/* محتوى الشاشة */}
  <LoadingOverlay
    visible={isLoading}
    message="جاري الحفظ..."
  />
</View>
```

---

## 5. ErrorMessage Component

### الوصف
رسالة خطأ مع خيار إعادة المحاولة.

### الاستيراد
```typescript
import { ErrorMessage } from '@/components';
```

### الأنواع (Variants)
- `default` - للشاشات الكاملة
- `inline` - للأخطاء المضمنة
- `card` - بطاقة خطأ

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| message | string | required | رسالة الخطأ |
| title | string | 'حدث خطأ' | عنوان الخطأ |
| variant | ErrorVariant | 'default' | نوع العرض |
| showRetry | boolean | true | إظهار زر إعادة المحاولة |
| onRetry | function | - | دالة إعادة المحاولة |
| retryText | string | 'إعادة المحاولة' | نص زر إعادة المحاولة |
| icon | React.ReactNode | - | أيقونة مخصصة |
| fullScreen | boolean | false | ملء الشاشة |

### أمثلة

#### خطأ بسيط
```typescript
<ErrorMessage
  message="فشل تحميل البيانات"
  onRetry={handleRetry}
/>
```

#### خطأ مضمن
```typescript
<ErrorMessage
  variant="inline"
  message="البريد الإلكتروني غير صحيح"
  showRetry={false}
/>
```

#### خطأ كامل الشاشة
```typescript
<ErrorMessage
  fullScreen
  title="خطأ في الاتصال"
  message="لم نتمكن من الاتصال بالخادم. يرجى المحاولة لاحقاً."
  onRetry={refetch}
  retryText="إعادة المحاولة"
/>
```

---

## 6. EmptyState Component

### الوصف
حالة فارغة عندما لا يوجد محتوى، مع 7 حالات جاهزة.

### الاستيراد
```typescript
import {
  EmptyState,
  NoBooks,
  NoSearchResults,
  NoFavorites,
  NoReadingHistory,
  NoDownloads,
  NoNotifications,
  Offline,
} from '@/components';
```

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|------|
| title | string | required | عنوان الحالة |
| description | string | - | وصف الحالة |
| icon | React.ReactNode | - | أيقونة مخصصة |
| emoji | string | '📭' | emoji افتراضي |
| showAction | boolean | false | إظهار زر العمل |
| actionText | string | 'ابدأ الآن' | نص زر العمل |
| onAction | function | - | دالة زر العمل |
| fullScreen | boolean | false | ملء الشاشة |

### أمثلة

#### حالة فارغة مخصصة
```typescript
<EmptyState
  emoji="📚"
  title="لا توجد كتب"
  description="لم تقم بإضافة أي كتب بعد"
  showAction
  actionText="تصفح المكتبة"
  onAction={() => navigation.navigate('Library')}
/>
```

#### حالات جاهزة
```typescript
// لا توجد كتب
<NoBooks onAction={() => navigation.navigate('Library')} />

// لا توجد نتائج بحث
<NoSearchResults searchQuery={query} />

// لا توجد مفضلات
<NoFavorites onAction={() => navigation.navigate('Books')} />

// لا يوجد سجل قراءة
<NoReadingHistory onAction={() => navigation.navigate('Books')} />

// لا توجد تنزيلات
<NoDownloads onAction={() => navigation.navigate('Books')} />

// لا توجد إشعارات
<NoNotifications />

// لا يوجد اتصال
<Offline onRetry={handleRetry} />
```

---

## الاستخدام المشترك

### مثال: شاشة تسجيل دخول

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, ErrorMessage, LoadingOverlay } from '@/components';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // تسجيل الدخول
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && (
        <ErrorMessage
          variant="inline"
          message={error}
          showRetry={false}
        />
      )}

      <Button
        title="تسجيل الدخول"
        onPress={handleLogin}
        loading={loading}
        fullWidth
      />

      <LoadingOverlay
        visible={loading}
        message="جاري تسجيل الدخول..."
      />
    </View>
  );
};
```

### مثال: قائمة كتب

```typescript
import React from 'react';
import { FlatList } from 'react-native';
import { Card, CardBody, LoadingSpinner, EmptyState, ErrorMessage } from '@/components';

const BooksScreen = () => {
  const { data: books, isLoading, isError, error, refetch } = useBooks();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="جاري تحميل الكتب..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        fullScreen
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (books.length === 0) {
    return <NoBooks onAction={() => navigation.navigate('Library')} />;
  }

  return (
    <FlatList
      data={books}
      renderItem={({ item }) => (
        <Card
          pressable
          onPress={() => navigation.navigate('BookDetails', { id: item.id })}
        >
          <CardBody>
            <Text>{item.title}</Text>
            <Text>{item.author}</Text>
          </CardBody>
        </Card>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
```

---

## نصائح الاستخدام

### 1. التصدير المركزي
استخدم التصدير المركزي دائماً:
```typescript
// ✅ صحيح
import { Button, Input, Card } from '@/components';

// ❌ خطأ
import { Button } from '@/components/common/Button';
```

### 2. Type Safety
استخدم الأنواع المصدرة:
```typescript
import { ButtonVariant, ButtonSize } from '@/components';

const variant: ButtonVariant = 'primary';
const size: ButtonSize = 'large';
```

### 3. التخصيص
جميع المكونات تدعم custom styles:
```typescript
<Button
  title="مخصص"
  style={{ backgroundColor: 'blue' }}
  textStyle={{ color: 'white' }}
/>
```

### 4. Accessibility
تأكد من إضافة accessibility labels:
```typescript
<Button
  title="إرسال"
  accessibilityLabel="إرسال النموذج"
  accessibilityHint="اضغط لإرسال النموذج"
/>
```

---

## التوافق

### React Native
- ✅ iOS
- ✅ Android
- ✅ Web (مع بعض التعديلات)

### الأداء
- جميع المكونات محسّنة للأداء
- تستخدم `React.memo` عند الحاجة
- لا re-renders غير ضرورية

### Theming
- تستخدم Colors من `@/constants`
- سهلة التخصيص للـ dark mode
- تدعم RTL للعربية

---

## الخطوات القادمة

### المكونات القادمة (Phase 3):
- Badge - شارة
- Avatar - صورة شخصية
- Modal - نافذة منبثقة
- Dropdown - قائمة منسدلة
- Checkbox - مربع اختيار
- Radio - زر اختيار
- Switch - مفتاح تبديل
- Slider - شريط تمرير
- Toast - إشعار سريع
- BottomSheet - ورقة سفلية

---

## الدعم والمساعدة

### الملفات المرجعية:
- [README.md](./README.md) - نظرة عامة على المشروع
- [NEXT_STEPS.md](./NEXT_STEPS.md) - الخطوات القادمة
- [SUMMARY.md](./SUMMARY.md) - ملخص المشروع

### الأمثلة:
راجع ملف `App.tsx` لأمثلة استخدام فعلية.

---

_تم إنشاء هذا الدليل: ${new Date().toLocaleString('ar-SA')}_

**📦 6 مكونات جاهزة للاستخدام!**
