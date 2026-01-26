import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// Rate Limiting Configuration
// ============================================

interface RateLimitEntry {
  timestamps: number[];
  suspiciousCount: number;
}

const rateLimit = new Map<string, RateLimitEntry>();
const blockedIPs = new Set<string>();

// تنظيف البيانات القديمة كل 30 دقيقة
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  for (const [ip, entry] of rateLimit.entries()) {
    entry.timestamps = entry.timestamps.filter(time => now - time < windowMs);
    if (entry.timestamps.length === 0) {
      rateLimit.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// ============================================
// CORS Configuration
// ============================================

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://islamic-library.vercel.app',
  // أضف النطاقات المصرح بها هنا
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

// ============================================
// Security Headers
// ============================================

const SECURITY_HEADERS = {
  // منع التضمين في iframe (حماية من clickjacking)
  'X-Frame-Options': 'DENY',

  // منع تخمين MIME type
  'X-Content-Type-Options': 'nosniff',

  // سياسة الإحالة
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // حماية من XSS في المتصفحات القديمة
  'X-XSS-Protection': '1; mode=block',

  // Content Security Policy (CSP)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // إجبار HTTPS في production
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),

  // معلومات إضافية
  'X-Powered-By': 'Islamic Library',
};

// ============================================
// Attack Pattern Detection
// ============================================

const ATTACK_PATTERNS = [
  // SQL Injection
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,

  // Path Traversal
  /\.\.[\/\\]/,
  /\.(env|git|ssh|aws|config)/i,

  // Command Injection
  /[;&|`$()]/,

  // XSS
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

function detectAttackPattern(request: NextRequest): boolean {
  const url = request.url;
  const searchParams = request.nextUrl.searchParams.toString();

  // فحص URL و query parameters
  const testString = url + searchParams;

  return ATTACK_PATTERNS.some(pattern => pattern.test(testString));
}

// ============================================
// Main Middleware Function
// ============================================

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = process.env.NODE_ENV === 'development' ? 10000 : 100; // More permissive in dev

  // ============================================
  // 1. Check if IP is blocked
  // ============================================

  if (blockedIPs.has(ip)) {
    console.warn(`[SECURITY] Blocked IP attempted access: ${ip}`);
    return new NextResponse('Access denied', { status: 403 });
  }

  // ============================================
  // 2. Attack Pattern Detection
  // ============================================

  if (detectAttackPattern(request)) {
    const entry = rateLimit.get(ip) || { timestamps: [], suspiciousCount: 0 };
    entry.suspiciousCount++;

    console.warn(`[SECURITY] Attack pattern detected from ${ip} - Count: ${entry.suspiciousCount}`);

    // حظر IP بعد 3 محاولات مشبوهة
    if (entry.suspiciousCount >= 3) {
      blockedIPs.add(ip);
      console.error(`[SECURITY] IP blocked due to suspicious activity: ${ip}`);
      return new NextResponse('Access denied', { status: 403 });
    }

    rateLimit.set(ip, entry);
    return new NextResponse('Bad request', { status: 400 });
  }

  // ============================================
  // 3. Rate Limiting
  // ============================================

  const entry = rateLimit.get(ip) || { timestamps: [], suspiciousCount: 0 };
  entry.timestamps = entry.timestamps.filter(time => now - time < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} (${entry.timestamps.length} requests)`);

    // تسجيل كمحاولة مشبوهة إذا تجاوز الحد بكثير
    if (entry.timestamps.length >= maxRequests * 2) {
      entry.suspiciousCount++;
      if (entry.suspiciousCount >= 5) {
        blockedIPs.add(ip);
        console.error(`[SECURITY] IP blocked due to excessive requests: ${ip}`);
        return new NextResponse('Access denied', { status: 403 });
      }
    }

    const response = new NextResponse('Too many requests', { status: 429 });
    response.headers.set('Retry-After', '900'); // 15 minutes
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    return response;
  }

  entry.timestamps.push(now);
  rateLimit.set(ip, entry);

  // ============================================
  // 4. CORS Configuration
  // ============================================

  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  // ============================================
  // 5. Create Response with Security Headers
  // ============================================

  const response = NextResponse.next();

  // إضافة Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // إضافة CORS Headers
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // إضافة Rate Limit Headers
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - entry.timestamps.length).toString());
  response.headers.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

  return response;
}

// ============================================
// Middleware Configuration
// ============================================

export const config = {
  matcher: [
    // تطبيق على جميع routes API
    '/api/:path*',

    // تطبيق على صفحات الإدارة
    '/admin/:path*',

    // استثناء الملفات الثابتة
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
