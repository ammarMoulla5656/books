# ⚡ QUICK START: Fix Islamic Library Security Issues

## 🚨 URGENT: Current Site Status
**⛔ DO NOT DEPLOY TO PRODUCTION - CRITICAL VULNERABILITIES PRESENT**

Your site currently has **7 CRITICAL** security vulnerabilities that could lead to:
- Complete database compromise
- Unauthorized admin access
- System file deletion
- DOS attacks
- Data theft

---

## 📋 IMMEDIATE ACTIONS (THIS WEEK)

### Step 1: Take Down Production (If Live)
```bash
# If site is live, take it offline NOW
# Put up maintenance page
```

**Why:** Attackers can currently:
- Login as admin with password `Admin@123456` (hardcoded)
- Upload malicious files without authentication
- Delete any file on your server
- Poison your analytics
- Create unlimited fake accounts

---

### Step 2: Run Security Audit Script

Create this file: `security-check.js`
```javascript
// Quick security check
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Security Audit...\n');

let criticalIssues = 0;

// Check 1: Hardcoded password
const authFile = fs.readFileSync('./lib/auth.ts', 'utf8');
if (authFile.includes('Admin@123456')) {
  console.log('❌ CRITICAL: Hardcoded admin password found in lib/auth.ts');
  criticalIssues++;
}

// Check 2: .env in git
if (fs.existsSync('./.env') && !fs.readFileSync('./.gitignore', 'utf8').includes('.env')) {
  console.log('❌ CRITICAL: .env file not in .gitignore');
  criticalIssues++;
}

// Check 3: Admin route protection
const adminRoutes = [
  './app/api/admin/seed/route.ts',
  './app/api/admin/books/abx/route.ts'
];

adminRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    const content = fs.readFileSync(route, 'utf8');
    if (!content.includes('getAdminSession')) {
      console.log(`❌ CRITICAL: ${route} has no authentication`);
      criticalIssues++;
    }
  }
});

// Check 4: Session storage
const sessionFile = fs.readFileSync('./lib/session.ts', 'utf8');
if (sessionFile.includes('new Map<string')) {
  console.log('❌ CRITICAL: Sessions stored in memory (not database)');
  criticalIssues++;
}

console.log(`\n📊 Total Critical Issues: ${criticalIssues}`);
console.log(criticalIssues > 0 ? '⛔ Site NOT safe for production' : '✅ Critical checks passed');
```

Run it:
```bash
node security-check.js
```

---

## 🛠️ FIX IT NOW (4-Hour Emergency Fix)

### Emergency Fix #1: Disable Admin Routes (15 minutes)
**File:** `middleware.ts` (create this file)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // EMERGENCY: Block all admin routes until fixed
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json(
      { error: 'Admin panel temporarily disabled for security maintenance' },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
```

This blocks ALL admin access until you implement proper auth.

---

### Emergency Fix #2: Change Admin Password (10 minutes)

**File:** `lib/auth.ts`
```typescript
// REMOVE THIS LINE:
// const hashedPassword = await hashPassword('Admin@123456');

// ADD THIS:
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}
const hashedPassword = await hashPassword(adminPassword);
```

**File:** `.env` (add this line)
```
ADMIN_PASSWORD=YourSecureP@ssw0rd!2024
```

**File:** `.gitignore` (add if not present)
```
.env
.env.local
```

Remove `.env` from git:
```bash
git rm --cached .env
git commit -m "Remove .env from git"
```

---

### Emergency Fix #3: Add Basic Rate Limiting (30 minutes)

**File:** `lib/rate-limit.ts` (create this)
```typescript
const requests = new Map<string, number[]>();

export function rateLimit(ip: string, limit: number = 100, window: number = 15 * 60 * 1000) {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];

  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < window);

  if (recentRequests.length >= limit) {
    return false; // Rate limited
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true; // Allowed
}
```

**Update:** `middleware.ts`
```typescript
import { rateLimit } from './lib/rate-limit';

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of middleware
}
```

---

### Emergency Fix #4: Secure File Uploads (45 minutes)

**File:** `lib/file-validation.ts` (create this)
```typescript
export function validateFile(buffer: Buffer, allowedTypes: string[]): boolean {
  // Check magic bytes
  const signatures: Record<string, number[]> = {
    'pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'docx': [0x50, 0x4B, 0x03, 0x04], // PK..
  };

  for (const [type, signature] of Object.entries(signatures)) {
    if (!allowedTypes.includes(type)) continue;

    let match = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  return false;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}
```

**Update:** `app/api/admin/documents/route.ts`
```typescript
import { validateFile, sanitizeFilename } from '@/lib/file-validation';
import { randomBytes } from 'crypto';

// In POST handler:
const bytes = Buffer.from(await file.arrayBuffer());

// Validate magic bytes, NOT MIME type
if (!validateFile(bytes, ['pdf', 'docx'])) {
  return NextResponse.json(
    { error: 'Invalid file type' },
    { status: 400 }
  );
}

// Generate random filename
const hash = randomBytes(16).toString('hex');
const ext = file.name.split('.').pop();
const filename = `${hash}.${ext}`;
```

---

### Emergency Fix #5: Fix Path Traversal (30 minutes)

**File:** `lib/file-security.ts` (create this)
```typescript
import { resolve } from 'path';

export function validateFilePath(filePath: string): boolean {
  const uploadsDir = resolve(process.cwd(), 'uploads');
  const absolutePath = resolve(filePath);

  // Ensure path is within uploads directory
  return absolutePath.startsWith(uploadsDir);
}
```

**Update:** `app/api/admin/documents/[id]/route.ts`
```typescript
import { validateFilePath } from '@/lib/file-security';

// Before deleting file:
if (!validateFilePath(upload.storagePath)) {
  throw new Error('Invalid file path');
}

await unlink(upload.storagePath);
```

---

### Emergency Fix #6: Add Environment Validation (15 minutes)

**File:** `lib/env.ts` (create this)
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'ADMIN_PASSWORD',
];

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}`
    );
  }
}
```

**Update:** `app/layout.tsx` (add at top)
```typescript
import { validateEnv } from '@/lib/env';

if (typeof window === 'undefined') {
  validateEnv();
}
```

---

### Emergency Fix #7: Add Security Headers (20 minutes)

**Update:** `next.config.ts`
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## ✅ VERIFICATION CHECKLIST

After applying emergency fixes:

```bash
# 1. Check security script
node security-check.js

# 2. Test admin routes are blocked
curl http://localhost:3000/api/admin/seed
# Should return 503

# 3. Test rate limiting
for i in {1..150}; do curl http://localhost:3000/api/books; done
# Should return 429 after 100 requests

# 4. Verify environment vars
npm run build
# Should fail if missing required vars

# 5. Check security headers
curl -I http://localhost:3000
# Should see X-Frame-Options, CSP, etc.
```

---

## 📝 COMMIT YOUR FIXES

```bash
git add .
git commit -m "🔒 SECURITY: Emergency fixes for critical vulnerabilities

- Block admin routes until proper auth implemented
- Remove hardcoded admin password
- Add rate limiting
- Secure file uploads with magic byte validation
- Fix path traversal vulnerability
- Add environment variable validation
- Implement security headers

DO NOT DEPLOY UNTIL FULL AUDIT FIXES ARE APPLIED"

git push
```

---

## 🎯 NEXT STEPS (AFTER EMERGENCY FIXES)

**You've now applied band-aid fixes. These are NOT complete solutions.**

Follow the full implementation plan:

### Week 1 (CRITICAL - Required for Production)
1. Read: [CRITICAL_FIXES_PROMPTS.md](./CRITICAL_FIXES_PROMPTS.md)
2. Implement database session management
3. Add proper authentication to admin routes
4. Complete file security implementation
5. Set up secrets management

### Week 2 (HIGH - Do This Next)
1. Read: [HIGH_PRIORITY_FIXES_PROMPTS.md](./HIGH_PRIORITY_FIXES_PROMPTS.md)
2. Add input validation with Zod
3. Fix performance issues (N+1 queries)
4. Implement CSRF protection

### Week 3-4 (MEDIUM/LOW - Quality Improvements)
1. Read: [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
2. Follow the detailed weekly plan
3. Write tests
4. Add monitoring

---

## 🆘 IF SOMETHING BREAKS

### Rollback Emergency Fixes
```bash
git revert HEAD
npm run build
```

### Get Help
1. Read error message carefully
2. Check: [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)
3. Use relevant prompt from CRITICAL_FIXES_PROMPTS.md
4. Ask Claude with specific error details

---

## 📊 CURRENT STATUS

After emergency fixes:
- ✅ Admin routes blocked (temporary)
- ✅ No hardcoded passwords
- ✅ Basic rate limiting
- ✅ File upload validation
- ✅ Path traversal protection
- ✅ Environment validation
- ✅ Security headers

**Still remaining: 29 issues to fix**
- See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for complete plan

---

## ⚠️ IMPORTANT REMINDERS

1. **These are TEMPORARY fixes** - not production-ready
2. **Admin panel is DISABLED** - you can't use it until you implement proper auth
3. **Follow the full roadmap** - don't skip steps
4. **Test everything** - in staging environment first
5. **Backup your database** - before making changes

**Estimated time to production-ready:** 3-4 weeks following the roadmap

Good luck! 🚀
