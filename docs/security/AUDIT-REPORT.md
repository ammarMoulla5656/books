# 🔒 COMPREHENSIVE SECURITY & CODE AUDIT REPORT
## Islamic Library Web Application

**Audit Date:** January 17, 2026
**Repository:** conductor_playground/algiers
**Stack:** Next.js 16.1.1 + React 19.2.3 + Prisma 7.2.0 + PostgreSQL

---

## 📊 EXECUTIVE SUMMARY

The Islamic Library application has several **critical security vulnerabilities** and **design issues** that need immediate attention. While the codebase is well-structured and includes good documentation, multiple authentication gaps and security flaws could expose sensitive data and allow unauthorized administrative access.

### Issue Count
- 🔴 **Critical Issues:** 7
- 🟠 **High Severity:** 9
- 🟡 **Medium Severity:** 12
- 🔵 **Low Severity:** 8
- **Total:** 36 Issues

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1.1 Hardcoded Default Admin Password
**Severity:** CRITICAL
**Files:**
- `/lib/auth.ts` (line 21)
- `/app/api/admin/seed/route.ts` (line 58)
- `/prisma/seed.ts`
- `/scripts/create-admin.ts`

**Issue:**
```typescript
const hashedPassword = await hashPassword('Admin@123456');
```

Default admin password `Admin@123456` is hardcoded in multiple files.

**Impact:**
- Anyone with code access can login as admin
- Password in git history permanently
- Cannot be changed without code modification

**Fix:**
```typescript
// Generate random password at deployment
const randomPassword = randomBytes(32).toString('hex');
const hashedPassword = await hashPassword(randomPassword);

// Log once and require immediate change
console.log('ADMIN INITIAL PASSWORD (change immediately):', randomPassword);
```

---

### 1.2 No Authentication on Admin API Routes
**Severity:** CRITICAL
**Files:**
- `/app/api/admin/seed/route.ts`
- `/app/api/admin/books/abx/route.ts`
- `/app/api/admin/documents/route.ts`
- `/app/api/admin/import-sistani/route.ts`

**Issue:**
Admin routes are publicly accessible - no authentication checks!

```typescript
// VULNERABLE: Anyone can POST
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  // ... processes immediately
}
```

**Impact:**
- Arbitrary file uploads
- Database seeding/manipulation
- Bulk imports
- Complete system compromise

**Fix:**
```typescript
import { getAdminSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

---

### 1.3 Session Token Not Verified
**Severity:** CRITICAL
**File:** `/lib/session.ts` (lines 8-9, 44-49)

**Issue:**
Sessions stored in memory Map (resets on restart):

```typescript
const activeSessions = new Map<string, { adminId: string; createdAt: Date }>();

export async function getAdminSession() {
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = activeSessions.get(sessionToken); // Only memory check!
  return sessionToken;
}
```

**Vulnerabilities:**
1. No expiration check
2. No database persistence
3. UUIDs are predictable
4. No CSRF protection
5. Sessions lost on restart

**Fix:**
```typescript
// Store in database with expiration
export async function getAdminSession() {
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  // Check expiration
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.adminSession.delete({ where: { token } });
    return null;
  }

  return session;
}
```

---

### 1.4 Path Traversal in File Operations
**Severity:** CRITICAL
**File:** `/app/api/admin/documents/[id]/route.ts` (line 92)

**Issue:**
```typescript
const upload = await prisma.documentUpload.findUnique({ where: { id } });
await unlink(upload.storagePath); // Uses DB path directly!
```

**Impact:**
- Delete arbitrary system files
- Filesystem compromise

**Fix:**
```typescript
import { relative, resolve } from 'path';

const uploadsDir = resolve(process.cwd(), 'uploads');
const safePath = resolve(upload.storagePath);

// Verify path is within uploads directory
if (!safePath.startsWith(uploadsDir)) {
  throw new Error('Invalid file path');
}

await unlink(safePath);
```

---

### 1.5 Unvalidated File Uploads
**Severity:** CRITICAL
**File:** `/app/api/admin/documents/route.ts` (lines 76-86)

**Issue:**
```typescript
if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
  // file.type is from client - can be spoofed!
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

**Vulnerabilities:**
1. MIME type from client (forgeable)
2. Only extension checked, not content
3. 100MB limit too large
4. No filename sanitization

**Fix:**
```typescript
import { createHash } from 'crypto';

// Validate file magic bytes
function getFileType(buffer: Buffer): string {
  const head = buffer.slice(0, 8);
  if (head[0] === 0x25 && head[1] === 0x50) return 'pdf'; // %PDF
  if (head[0] === 0x50 && head[1] === 0x4b) return 'docx'; // PK
  return null;
}

const bytes = Buffer.from(await file.arrayBuffer());
const actualType = getFileType(bytes);
if (!actualType) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}

// Generate safe filename
const fileHash = createHash('sha256').update(bytes).digest('hex');
const filename = `${fileHash}.${actualType}`;
```

---

### 1.6 Database Credentials Exposed
**Severity:** CRITICAL
**File:** `/.env`

**Issue:**
```
DATABASE_URL="postgresql://postgres:iioopp00@localhost:5432/islamic_library"
```

**Problems:**
1. Credentials in version control
2. Default PostgreSQL credentials
3. No rotation mechanism

**Fix:**
1. Remove `.env` from git history
2. Use `.env.local` for development
3. Use secrets manager in production
4. Rotate credentials regularly

---

### 1.7 No CORS or Rate Limiting
**Severity:** CRITICAL
**Location:** All API routes

**Issue:**
No CORS headers, rate limiting, or request throttling.

**Impact:**
- CSRF attacks
- DOS attacks
- Spam submissions

**Fix:**
```typescript
// middleware.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  return response;
}
```

---

## 🟠 HIGH SEVERITY ISSUES

### 2.1 No Input Validation
**File:** `/app/api/books/route.ts`

**Issue:**
```typescript
const { title, author, categoryId } = body;
// Direct insert without validation
await prisma.book.create({ data: { title, author, categoryId } });
```

**Fix:**
```typescript
import { z } from 'zod';

const BookSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().max(500).optional(),
  categoryId: z.string().uuid(),
});

const validated = BookSchema.parse(body);
```

---

### 2.2 N+1 Query Problem
**File:** `/app/api/analytics/route.ts` (lines 149-164)

**Issue:**
```typescript
const popularBooks = await Promise.all(
  bookViews.map(async (view) => {
    const book = await prisma.book.findUnique({ ... }); // N queries!
  })
);
```

**Fix:**
```typescript
const bookIds = bookViews.map(v => extractBookId(v.page)).filter(Boolean);
const books = await prisma.book.findMany({
  where: { id: { in: bookIds } },
  select: { id: true, title: true },
});

const booksMap = new Map(books.map(b => [b.id, b]));
```

---

### 2.3 Visitor IP Spoofing
**File:** `/app/api/visitor/track/route.ts` (line 20)

**Issue:**
```typescript
const forwarded = request.headers.get('x-forwarded-for');
const ipAddress = forwarded?.split(',')[0] || 'localhost';
```

`X-Forwarded-For` can be forged by client.

**Fix:**
```typescript
const isTrustedProxy = process.env.TRUSTED_PROXY === 'true';
const ipAddress = isTrustedProxy
  ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  : request.ip || 'unknown';
```

---

### 2.4 Memory Leak in Infinite Scroll
**File:** `/app/books/[id]/page.tsx` (lines 152-249)

**Issue:**
```typescript
setLoadedPageIndices(prev => {
  const newSet = new Set(prev);
  for (let i = Math.max(0, pageIndex - 2); i < Math.min(allPages.length, pageIndex + 5); i++) {
    newSet.add(i); // Set only grows!
  }
  return newSet;
});
```

**Impact:**
- Memory usage grows with book size
- Browser slowdown on large books

**Fix:**
```typescript
setLoadedPageIndices(prev => {
  const newSet = new Set<number>();
  const bufferSize = 3;

  // Only keep visible + buffer pages
  for (let i = Math.max(0, currentPageIndex - bufferSize);
       i < Math.min(allPages.length, currentPageIndex + bufferSize + 1);
       i++) {
    newSet.add(i);
  }

  return newSet;
});
```

---

### 2.5-2.9 Additional High Issues
- No query parameter validation
- Regular Expression DoS potential
- Settings API accepts any key
- No access control on user data
- No IntersectionObserver cleanup

---

## 🟡 MEDIUM SEVERITY ISSUES

### 3.1 Console Logging Sensitive Information
**Multiple Files**

**Issue:**
```typescript
console.error('ABX upload error:', error);
console.error('Error creating book:', error);
```

**Fix:**
```typescript
// Use structured logging
import winston from 'winston';

logger.error('Book creation failed', {
  error: error instanceof Error ? error.message : 'Unknown'
});
```

---

### 3.2 Missing Error Context
**File:** `/app/api/admin/documents/[id]/confirm/route.ts`

**Issue:**
No error handling for individual chapter creation.

**Fix:**
```typescript
async function createChaptersFromToc(...) {
  const results = { successful: 0, failed: 0, errors: [] };

  for (const tocItem of tocItems) {
    try {
      await prisma.chapter.create({ ... });
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ tocItem: tocItem.title, error: error.message });
    }
  }

  return results;
}
```

---

### 3.3-3.12 Additional Medium Issues
- Weak type safety with 'any'
- No transaction support
- No pagination on large queries
- Missing CSRF protection
- Unicode/RTL text handling issues
- No Content Security Policy
- Stale admin credentials
- Weak visitor session generation
- Type mismatch in ABX parser
- Fake analytics data generation

---

## 🔵 LOW SEVERITY ISSUES

### 4.1-4.8
- Missing environment variable validation
- Unreliable analytics data (using `Math.random()`)
- Default theme not set
- Missing API documentation
- Unused Firebase code
- Book images not optimized
- No robots.txt or sitemap
- Potential XSS in book content

---

## 📋 ACTION PLAN

### Phase 1: Critical (Week 1) - MUST DO BEFORE PRODUCTION
1. ✅ Implement database session management
2. ✅ Add authentication to ALL admin endpoints
3. ✅ Remove hardcoded passwords
4. ✅ Implement input validation (Zod)
5. ✅ Add rate limiting middleware
6. ✅ Fix path traversal vulnerability

### Phase 2: High (Week 2)
1. Add pagination to all endpoints
2. Fix N+1 queries
3. Implement CSRF protection
4. Add CORS configuration
5. Fix memory leak
6. Add audit trail logging

### Phase 3: Medium (Week 3-4)
1. Comprehensive error handling
2. CSP headers
3. Structured logging
4. Fix type safety issues
5. Database transactions
6. Session timeout

### Phase 4: Low (Ongoing)
1. Unit/integration tests
2. API documentation
3. Monitoring/alerting
4. Performance optimization
5. External security audit

---

## 🛡️ SECURITY CHECKLIST FOR DEPLOYMENT

- [ ] Remove all hardcoded credentials
- [ ] Implement proper session management
- [ ] Add authentication to all admin endpoints
- [ ] Input validation and sanitization
- [ ] Rate limiting and CORS
- [ ] Secure cookies and CSRF protection
- [ ] Environment variables for all config
- [ ] Logging and monitoring
- [ ] Database backups
- [ ] HTTPS only
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] File upload validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Path traversal protection

---

## 📊 SEVERITY SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 7 | ⚠️ BLOCKER FOR PRODUCTION |
| 🟠 HIGH | 9 | ⚠️ FIX BEFORE LAUNCH |
| 🟡 MEDIUM | 12 | ⚠️ FIX SOON |
| 🔵 LOW | 8 | ℹ️ IMPROVE OVER TIME |
| **TOTAL** | **36** | |

---

## ⚠️ RECOMMENDATION

**DO NOT DEPLOY TO PRODUCTION** until critical and high severity vulnerabilities are addressed.

**Estimated remediation:** 3-4 weeks (80-120 hours)

---

## 📝 COMPLIANCE VIOLATIONS

### OWASP Top 10
- ✗ A01: Broken Access Control (No auth on admin routes)
- ✗ A02: Cryptographic Failures (Hardcoded passwords, weak sessions)
- ✗ A03: Injection (SQL injection patterns, no input validation)
- ✗ A04: Insecure Design (Session in memory, no CSRF)
- ✗ A05: Security Misconfiguration (Default credentials, no CSP)
- ✗ A07: Identification and Authentication Failures (Weak session management)
- ✗ A08: Software and Data Integrity Failures (No file validation)
- ✗ A09: Security Logging and Monitoring Failures (Console logging only)

### CWE Violations
- CWE-352: No CSRF protection
- CWE-89: SQL injection patterns
- CWE-434: Unrestricted file upload
- CWE-640: Weak password generation
- CWE-798: Hardcoded credentials
- CWE-22: Path traversal

---

## 🎯 NEXT STEPS

1. **Immediate:** Review this report with development team
2. **Week 1:** Fix all CRITICAL issues
3. **Week 2:** Address HIGH severity issues
4. **Week 3-4:** Resolve MEDIUM issues
5. **Ongoing:** Improve LOW priority items
6. **Before Launch:** External penetration test
7. **Post-Launch:** Continuous security monitoring

---

**Report Generated:** January 17, 2026
**Confidence:** High (Static code analysis)
**Contact:** security@islamiclibrary.dev (example)

---

## 📚 REFERENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Prisma Security Guidelines](https://www.prisma.io/docs/concepts/components/prisma-client/security)
