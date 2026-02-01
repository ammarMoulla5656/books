# 🧭 Navigation System Guide
## دليل شامل لنظام التنقل في التطبيق

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الهيكل](#الهيكل)
3. [Navigation Types](#navigation-types)
4. [RootNavigator](#rootnavigator)
5. [AuthNavigator](#authnavigator)
6. [MainNavigator](#mainnavigator)
7. [Deep Linking](#deep-linking)
8. [التكامل مع App.tsx](#التكامل-مع-apptsx)
9. [Type-Safe Navigation](#type-safe-navigation)
10. [أمثلة الاستخدام](#أمثلة-الاستخدام)
11. [Testing](#testing)

---

## نظرة عامة

نظام التنقل في التطبيق مبني على **React Navigation 7.x** ويتكون من 3 مستويات:

```
RootNavigator (Stack)
├── AuthNavigator (Stack) - عندما المستخدم غير مسجل
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
│
└── MainNavigator (Bottom Tabs) - عندما المستخدم مسجل
    ├── HomeScreen
    ├── LibraryScreen
    ├── FavoritesScreen
    └── ProfileScreen
```

### الميزات الرئيسية:
- ✅ Type-safe navigation مع TypeScript
- ✅ Protected routes بناءً على حالة Authentication
- ✅ Deep linking للـ ResetPassword
- ✅ Bottom Tabs مع أيقونات عربية
- ✅ Smooth transitions
- ✅ Global navigation types

---

## الهيكل

```
src/navigation/
├── index.ts              # Barrel export
├── types.ts              # TypeScript types
├── RootNavigator.tsx     # Main navigator
├── AuthNavigator.tsx     # Auth stack
├── MainNavigator.tsx     # Main tabs
└── linking.ts            # Deep linking config
```

---

## Navigation Types

**الملف:** `src/navigation/types.ts`

### RootStackParamList

يحدد الـ navigators الرئيسية في التطبيق:

```typescript
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
```

### AuthStackParamList

يحدد شاشات Authentication:

```typescript
export type AuthStackParamList = {
  Login: undefined;                    // لا parameters
  Register: undefined;                 // لا parameters
  ForgotPassword: undefined;           // لا parameters
  ResetPassword: {                     // يستقبل token
    token: string;
  };
};
```

### MainTabParamList

يحدد شاشات Main App:

```typescript
export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Favorites: undefined;
  Profile: undefined;
};
```

### Screen Props Types

أنواع Props للشاشات:

```typescript
// Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Auth Stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Main Tab
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
```

### Global Navigation Declaration

للاستخدام مع `useNavigation` hook:

```typescript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

**فائدة:** يسمح باستخدام `useNavigation()` بدون تمرير types في كل مرة.

---

## RootNavigator

**الملف:** `src/navigation/RootNavigator.tsx`

### الوظيفة

RootNavigator هو Navigator الرئيسي الذي يتحكم في:
- التبديل بين Auth و Main بناءً على حالة Authentication
- Loading screen أثناء التحقق من Auth state
- Initialization للـ Auth Store

### المكونات الرئيسية

```typescript
export const RootNavigator: React.FC = () => {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();

  // Initialize auth store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while checking auth state
  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
```

### الحالات الثلاثة:

1. **Loading/Initializing**
   - يظهر `LoadingSpinner`
   - أثناء التحقق من Auth state

2. **User Logged In** (`user` exists)
   - يعرض `MainNavigator`
   - يصل للشاشات الرئيسية

3. **User Not Logged In** (`user` is null)
   - يعرض `AuthNavigator`
   - يطلب تسجيل دخول

### Authentication Flow

```
App Start
   ↓
RootNavigator
   ↓
initialize() → يتحقق من Storage
   ↓
├─→ user exists → MainNavigator
│                     ↓
│                   Home Screen
│
└─→ user null → AuthNavigator
                    ↓
                  Login Screen
```

---

## AuthNavigator

**الملف:** `src/navigation/AuthNavigator.tsx`

### الوظيفة

Stack Navigator لشاشات Authentication.

### التكوين

```typescript
<Stack.Navigator
  initialRouteName="Login"
  screenOptions={{
    headerShown: false,            // بدون header
    animation: 'slide_from_right', // انتقال سلس
    contentStyle: {
      backgroundColor: Colors.light.background,
    },
  }}
>
```

### الشاشات

```typescript
<Stack.Screen
  name="Login"
  component={LoginScreen}
  options={{ title: 'تسجيل الدخول' }}
/>

<Stack.Screen
  name="Register"
  component={RegisterScreen}
  options={{ title: 'إنشاء حساب' }}
/>

<Stack.Screen
  name="ForgotPassword"
  component={ForgotPasswordScreen}
  options={{ title: 'نسيت كلمة المرور' }}
/>

<Stack.Screen
  name="ResetPassword"
  component={ResetPasswordScreen}
  options={{ title: 'إعادة تعيين كلمة المرور' }}
/>
```

### الـ Flow

```
Login Screen
   │
   ├─→ سجل الآن → Register Screen
   │                  ↓
   │              تسجيل ناجح → Login Screen
   │
   ├─→ نسيت كلمة المرور؟ → ForgotPassword Screen
   │                              ↓
   │                         إرسال بريد
   │                              ↓
   │                   [User clicks email link]
   │                              ↓
   │                      ResetPassword Screen
   │                              ↓
   │                         إعادة تعيين ناجحة → Login Screen
   │
   └─→ تسجيل دخول ناجح → Main App
```

---

## MainNavigator

**الملف:** `src/navigation/MainNavigator.tsx`

### الوظيفة

Bottom Tab Navigator للشاشات الرئيسية في التطبيق.

### التكوين

```typescript
<Tab.Navigator
  initialRouteName="Home"
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: Colors.light.primary,      // لون الـ tab النشط
    tabBarInactiveTintColor: Colors.light.textSecondary, // لون الـ tabs غير النشطة
    tabBarStyle: {
      backgroundColor: Colors.light.background,
      borderTopWidth: 1,
      borderTopColor: Colors.light.border,
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
  }}
>
```

### الـ Tabs

#### 1. Home Tab
```typescript
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    title: 'الرئيسية',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home" size={size} color={color} />
    ),
  }}
/>
```

**الأيقونة:** `home` (بيت)
**الوظيفة:** الشاشة الرئيسية مع welcome message وإحصائيات

#### 2. Library Tab
```typescript
<Tab.Screen
  name="Library"
  component={LibraryScreen}
  options={{
    title: 'المكتبة',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="library" size={size} color={color} />
    ),
  }}
/>
```

**الأيقونة:** `library` (مكتبة)
**الوظيفة:** عرض قائمة الكتب

#### 3. Favorites Tab
```typescript
<Tab.Screen
  name="Favorites"
  component={FavoritesScreen}
  options={{
    title: 'المفضلة',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="heart" size={size} color={color} />
    ),
  }}
/>
```

**الأيقونة:** `heart` (قلب)
**الوظيفة:** عرض الكتب المفضلة

#### 4. Profile Tab
```typescript
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    title: 'الملف الشخصي',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person" size={size} color={color} />
    ),
  }}
/>
```

**الأيقونة:** `person` (شخص)
**الوظيفة:** ملف المستخدم والإعدادات

---

## Deep Linking

**الملف:** `src/navigation/linking.ts`

### التكوين

```typescript
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'islamiclibrary://',                    // App scheme
    'https://islamiclibrary.app',           // Production web URL
    'http://islamiclibrary.app',            // Development web URL
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',  // Dynamic token param
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Library: 'library',
          Favorites: 'favorites',
          Profile: 'profile',
        },
      },
    },
  },
};
```

### الروابط المدعومة

#### ResetPassword (الأكثر أهمية)
```
islamiclibrary://reset-password/abc123token
https://islamiclibrary.app/reset-password/abc123token
```

**الاستخدام:** في email "نسيت كلمة المرور"

#### باقي الشاشات
```
islamiclibrary://login
islamiclibrary://register
islamiclibrary://forgot-password
islamiclibrary://home
islamiclibrary://library
```

### Helper Function

```typescript
export const getDeepLink = (
  screen: string,
  params?: Record<string, string>
): string => {
  const baseUrl = 'islamiclibrary://';

  switch (screen) {
    case 'ResetPassword':
      return `${baseUrl}reset-password/${params?.token || ''}`;
    case 'Login':
      return `${baseUrl}login`;
    // ...
  }
};
```

**مثال استخدام:**
```typescript
const resetLink = getDeepLink('ResetPassword', { token: 'abc123' });
// Returns: "islamiclibrary://reset-password/abc123"
```

### Testing Deep Links

#### iOS Simulator
```bash
xcrun simctl openurl booted "islamiclibrary://reset-password/test123"
```

#### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "islamiclibrary://reset-password/test123"
```

#### Expo Go
```bash
npx uri-scheme open islamiclibrary://reset-password/test123 --ios
npx uri-scheme open islamiclibrary://reset-password/test123 --android
```

---

## التكامل مع App.tsx

**الملف:** `App.tsx`

### Before Phase 4

```typescript
return (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <StatusBar />
      <HomeScreen isAuthenticated={isAuthenticated} />
    </SafeAreaProvider>
  </QueryClientProvider>
);
```

### After Phase 4

```typescript
return (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  </QueryClientProvider>
);
```

### التغييرات:

1. **إضافة `NavigationContainer`**
   - يلف `RootNavigator`
   - يستقبل `linking` configuration

2. **استبدال `HomeScreen` بـ `RootNavigator`**
   - RootNavigator يتولى عرض الشاشة المناسبة

3. **إزالة `isAuthenticated` prop**
   - RootNavigator يستخدم `useAuthStore()` مباشرة

---

## Type-Safe Navigation

### في الشاشات

#### 1. تعريف Props Type

```typescript
import type { AuthStackScreenProps } from '@/navigation';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  // navigation و route مع type safety كامل
};
```

#### 2. استخدام useNavigation Hook

```typescript
import { useNavigation } from '@react-navigation/native';
import type { AuthStackScreenProps } from '@/navigation';

type NavigationProp = AuthStackScreenProps<'Login'>['navigation'];

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Type-safe navigation
  navigation.navigate('Register');        // ✅ صحيح
  navigation.navigate('Home');            // ❌ خطأ - not in AuthStack
};
```

#### 3. Global Declaration (أسهل طريقة)

بفضل Global declaration في `types.ts`:

```typescript
const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  // يعمل مع auto-complete
  navigation.navigate('Register');
};
```

### Navigation Methods

#### navigate

```typescript
// بدون params
navigation.navigate('Login');

// مع params
navigation.navigate('ResetPassword', { token: 'abc123' });
```

#### goBack

```typescript
navigation.goBack();
```

#### replace

```typescript
// استبدال الشاشة الحالية (لا يمكن الرجوع)
navigation.replace('Login');
```

#### reset

```typescript
// إعادة تعيين navigation stack بالكامل
navigation.reset({
  index: 0,
  routes: [{ name: 'Login' }],
});
```

---

## أمثلة الاستخدام

### مثال 1: Navigation من LoginScreen إلى RegisterScreen

```typescript
// LoginScreen.tsx
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <Button
      title="سجل الآن"
      onPress={handleRegisterPress}
      variant="outline"
    />
  );
};
```

### مثال 2: Navigation بعد Login ناجح

```typescript
// LoginScreen.tsx
import { useAuthStore } from '@/store';

const LoginScreen: React.FC = () => {
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // RootNavigator سيتولى التبديل تلقائياً إلى MainNavigator
      // لأن user أصبح موجود
    } catch (error) {
      setError(error.message);
    }
  };
};
```

**ملاحظة:** لا تحتاج لاستدعاء `navigation.navigate('Main')` يدوياً!
RootNavigator يتفاعل مع تغيير `user` في Store.

### مثال 3: Logout من ProfileScreen

```typescript
// ProfileScreen.tsx
import { useAuthStore } from '@/store';

const ProfileScreen: React.FC = () => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // RootNavigator سيتولى التبديل تلقائياً إلى AuthNavigator
  };

  return (
    <Button
      title="تسجيل الخروج"
      onPress={handleLogout}
      variant="outline"
    />
  );
};
```

### مثال 4: Navigation مع useRoute

```typescript
// ResetPasswordScreen.tsx
import { useRoute } from '@react-navigation/native';
import type { AuthStackScreenProps } from '@/navigation';

type RouteProp = AuthStackScreenProps<'ResetPassword'>['route'];

const ResetPasswordScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const { token } = route.params;

  useEffect(() => {
    validateToken(token);
  }, [token]);
};
```

### مثال 5: Navigation بين Tabs

```typescript
// HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleViewLibrary = () => {
    // التبديل إلى Library tab
    navigation.navigate('Library');
  };

  return (
    <Button
      title="تصفح المكتبة"
      onPress={handleViewLibrary}
    />
  );
};
```

---

## Testing

### Test Scenarios

#### RootNavigator

```
✅ يعرض LoadingSpinner أثناء initialization
✅ يعرض AuthNavigator عندما user = null
✅ يعرض MainNavigator عندما user موجود
✅ يتبدل من Auth إلى Main بعد login
✅ يتبدل من Main إلى Auth بعد logout
```

#### AuthNavigator

```
✅ يبدأ بـ LoginScreen
✅ ينتقل من Login إلى Register
✅ ينتقل من Login إلى ForgotPassword
✅ يفتح ResetPassword من deep link
✅ يرجع من Register إلى Login
```

#### MainNavigator

```
✅ يبدأ بـ Home tab
✅ يبدل بين الـ tabs بنجاح
✅ يعرض الأيقونة الصحيحة لكل tab
✅ يظهر active/inactive colors صحيح
✅ Tab bar يظهر في جميع الشاشات
```

#### Deep Linking

```
✅ يفتح ResetPassword مع token صحيح
✅ يفتح Login من deep link
✅ يفتح Register من deep link
✅ يتعامل مع invalid URLs
```

### Manual Testing Checklist

#### Authentication Flow
- [ ] فتح التطبيق → يعرض LoginScreen
- [ ] الضغط على "سجل الآن" → ينتقل لـ RegisterScreen
- [ ] الرجوع → يعود لـ LoginScreen
- [ ] تسجيل دخول ناجح → ينتقل لـ HomeScreen
- [ ] Logout → يعود لـ LoginScreen

#### Tab Navigation
- [ ] الضغط على Home tab → يعرض HomeScreen
- [ ] الضغط على Library tab → يعرض LibraryScreen
- [ ] الضغط على Favorites tab → يعرض FavoritesScreen
- [ ] الضغط على Profile tab → يعرض ProfileScreen
- [ ] Active tab له لون مختلف
- [ ] Icons تظهر بوضوح

#### Deep Linking
- [ ] فتح reset password link → يفتح ResetPasswordScreen مع token
- [ ] Token يُمرر بشكل صحيح
- [ ] Invalid link → error handling

#### State Persistence
- [ ] إغلاق التطبيق وهو في Library tab
- [ ] فتح التطبيق → يفتح على نفس الـ tab
- [ ] Logout وإغلاق
- [ ] فتح → يبدأ من LoginScreen

---

## الأخطاء الشائعة وحلولها

### 1. "Cannot read property 'navigate' of undefined"

**السبب:** استخدام `useNavigation` خارج `NavigationContainer`

**الحل:**
```typescript
// ❌ خطأ
const Component = () => {
  const navigation = useNavigation();
  // خارج NavigationContainer
};

// ✅ صحيح
<NavigationContainer>
  <Component />  {/* useNavigation يعمل هنا */}
</NavigationContainer>
```

### 2. Type Errors مع navigate

**السبب:** عدم استخدام TypeScript types

**الحل:**
```typescript
// استخدام Global declaration
const navigation = useNavigation();
navigation.navigate('InvalidScreen'); // سيعطي error

// أو تحديد type explicitly
type NavProp = AuthStackScreenProps<'Login'>['navigation'];
const navigation = useNavigation<NavProp>();
```

### 3. Deep Link لا يعمل

**السبب:** URL scheme غير مسجل في `app.json`

**الحل:**
```json
// app.json
{
  "expo": {
    "scheme": "islamiclibrary"
  }
}
```

### 4. Tabs لا تظهر

**السبب:** `screenOptions.headerShown` مخفي الـ tab bar

**الحل:**
```typescript
// ❌ خطأ
screenOptions={{
  headerShown: false,
  tabBarVisible: false,  // هذا يخفي tab bar
}}

// ✅ صحيح
screenOptions={{
  headerShown: false,  // يخفي header فقط
  // tabBarVisible بدون تحديد = true
}}
```

---

## Best Practices

### 1. استخدم Global Navigation Types

```typescript
// ✅ أفضل
const navigation = useNavigation();

// ❌ تجنب (إلا إذا كنت تحتاج specificity)
const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
```

### 2. لا تستخدم navigation.navigate للـ Auth Switching

```typescript
// ❌ خطأ
const handleLogin = async () => {
  await login(email, password);
  navigation.navigate('Main');  // غير مطلوب
};

// ✅ صحيح
const handleLogin = async () => {
  await login(email, password);
  // RootNavigator يتولى التبديل تلقائياً
};
```

### 3. استخدم navigation.replace للـ Success Screens

```typescript
// ✅ بعد إكمال عملية مهمة
navigation.replace('SuccessScreen');
// يمنع المستخدم من الرجوع
```

### 4. Clean Navigation Stack بعد Logout

```typescript
// ✅ يضمن عدم وجود history
const handleLogout = () => {
  logout();
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
};
```

---

## الملخص

### الملفات المُنشأة:
```
src/navigation/
├── index.ts              ✅ Barrel export
├── types.ts              ✅ TypeScript definitions
├── RootNavigator.tsx     ✅ Root stack navigator
├── AuthNavigator.tsx     ✅ Auth stack navigator
├── MainNavigator.tsx     ✅ Bottom tabs navigator
└── linking.ts            ✅ Deep linking config
```

### الميزات الرئيسية:
- ✅ Type-safe navigation
- ✅ Authentication-based routing
- ✅ Deep linking support
- ✅ Bottom tabs for main app
- ✅ Protected routes
- ✅ Smooth transitions
- ✅ Global navigation types

### Integration:
- ✅ متكامل مع useAuthStore
- ✅ متكامل مع App.tsx
- ✅ متكامل مع جميع الشاشات (Auth + Main)

---

**📚 للمزيد:**
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [TypeScript Guide](https://reactnavigation.org/docs/typescript/)
- [Deep Linking](https://reactnavigation.org/docs/deep-linking/)

---

_تم إنشاء هذا الملف: ${new Date().toLocaleString('ar-SA')}_

_Phase 4: Navigation System - Complete! ✅_
