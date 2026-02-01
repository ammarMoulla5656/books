# 🟠 HIGH PRIORITY FIXES - Claude Prompts

## Fix 1: Add Input Validation with Zod

**Prompt for Claude:**
```
My API routes accept user input without validation. File: /app/api/books/route.ts

Please:
1. Install and configure Zod for validation
2. Create validation schemas for all API endpoints
3. Add comprehensive validation to:
   - Book creation/update
   - Chapter creation
   - Document uploads
   - Settings updates
   - User bookmarks/highlights

Example schema I need:
```typescript
import { z } from 'zod';

const BookSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid(),
  coverImage: z.string().url().optional(),
  pageCount: z.number().int().min(0).max(50000).optional(),
  chapters: z.array(ChapterSchema).max(1000).optional(),
});
```

Create schemas for ALL data models and show me how to use them in API routes.
Include error handling with clear error messages.
```

---

## Fix 2: Fix N+1 Query Problem in Analytics

**Prompt for Claude:**
```
My analytics endpoint has N+1 query problem in /app/api/analytics/route.ts (lines 149-164):

```typescript
const popularBooks = await Promise.all(
  bookViews.map(async (view) => {
    const book = await prisma.book.findUnique({ ... }); // N queries!
  })
);
```

This executes 1 query to get views, then N additional queries for book details.

Please:
1. Rewrite to use a single query with findMany + where: { in: [...ids] }
2. Create a Map for O(1) lookups
3. Optimize all similar patterns in the codebase
4. Add database indexes for frequently queried fields
5. Show me the Prisma schema updates needed

Provide the optimized code and explain the performance improvement.
```

---

## Fix 3: Prevent IP Spoofing in Analytics

**Prompt for Claude:**
```
Visitor tracking uses untrusted X-Forwarded-For header:
File: /app/api/visitor/track/route.ts (line 20)

```typescript
const forwarded = request.headers.get('x-forwarded-for');
const ipAddress = forwarded?.split(',')[0] || 'localhost';
```

Attackers can spoof this header to poison analytics.

Please:
1. Only trust X-Forwarded-For when behind verified proxy
2. Use environment variable TRUSTED_PROXY to configure
3. Fall back to request.ip for direct connections
4. Validate IP format
5. Add IP range blocking (optional)

Show me the secure implementation with configuration docs.
```

---

## Fix 4: Fix Memory Leak in Infinite Scroll

**Prompt for Claude:**
```
The book reader has a memory leak in /app/books/[id]/page.tsx:

```typescript
const [loadedPageIndices, setLoadedPageIndices] = useState<Set<number>>(new Set([0, 1, 2]));

// Set only grows, never shrinks!
setLoadedPageIndices(prev => {
  const newSet = new Set(prev);
  for (let i = Math.max(0, pageIndex - 2); i < Math.min(allPages.length, pageIndex + 5); i++) {
    newSet.add(i);
  }
  return newSet;
});
```

On a 1000-page book, this loads ALL pages into memory.

Please:
1. Implement a sliding window - keep only visible pages + small buffer
2. Remove pages outside the window from state
3. Add virtual scrolling for very large books (10000+ pages)
4. Optimize IntersectionObserver to cleanup properly
5. Test with large books

Show me the memory-efficient implementation.
```

---

## Fix 5: Add Query Parameter Validation

**Prompt for Claude:**
```
API routes accept query parameters without validation:
Files: /app/api/books/route.ts, /app/api/analytics/route.ts

```typescript
const search = searchParams.get('search');
const range = searchParams.get('range') || 'week'; // No validation!
```

Please:
1. Create Zod schemas for query parameters
2. Validate allowed values (enums)
3. Add length limits
4. Sanitize search queries
5. Add pagination validation

Example:
```typescript
const QuerySchema = z.object({
  search: z.string().max(500).optional(),
  range: z.enum(['day', 'week', 'month', 'year']).default('week'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
```

Apply to all endpoints with query parameters.
```

---

## Fix 6: Prevent Regular Expression DoS

**Prompt for Claude:**
```
ABX parser uses potentially dangerous regex: /lib/abx-parser.ts

```typescript
const attachmentRegex = /<\s*ملحق\s*=\s*(\d+)\s*>([\s\S]*?)<\s*\/\s*ملحق\s*=\s*\1\s*>/g;
```

On very large files, `[\s\S]*?` could cause performance issues (ReDoS).

Please:
1. Add input size validation (max 10MB before parsing)
2. Use streaming for large files instead of regex
3. Add timeout protection for regex operations
4. Consider using a proper XML parser instead of regex
5. Add progress feedback for large file processing

Show me the safer implementation.
```

---

## Fix 7: Validate Settings API Keys

**Prompt for Claude:**
```
Settings API accepts ANY key without validation:
File: /app/api/settings/route.ts

```typescript
for (const [key, value] of Object.entries(body)) {
  await prisma.systemSettings.upsert({ where: { key }, ... });
}
```

Attacker could create millions of settings or modify critical ones.

Please:
1. Create a whitelist of allowed setting keys
2. Use Zod schema for validation
3. Add type checking per setting
4. Limit value lengths
5. Add audit logging for setting changes

Example:
```typescript
const AllowedSettings = z.object({
  siteName: z.string().max(255).optional(),
  siteDescription: z.string().max(1000).optional(),
  maintenanceMode: z.boolean().optional(),
});
```

Show me the secure settings handler.
```

---

## Fix 8: Add User Data Access Control

**Prompt for Claude:**
```
User bookmarks/highlights are not properly isolated:
Files: /app/api/bookmarks/route.ts, /app/api/highlights/route.ts

Session tokens are just UUIDs (predictable) and could be guessed.

Please:
1. Use cryptographically secure session tokens (crypto.randomBytes)
2. Hash session tokens before storing in DB
3. Add rate limiting on user data endpoints
4. Validate session signatures
5. Add logging for data access
6. Implement token rotation

Show me the secure user session implementation.
```

---

## Fix 9: Add CSRF Protection

**Prompt for Claude:**
```
No CSRF protection on state-changing operations (POST/PUT/DELETE).

Please implement comprehensive CSRF protection:
1. Generate CSRF tokens on GET requests
2. Validate tokens on POST/PUT/DELETE
3. Use double-submit cookie pattern
4. Add SameSite=Strict to cookies
5. Create middleware for CSRF validation

Example flow:
```typescript
// In GET handler
const csrfToken = generateCsrfToken();
setCookie('csrf-token', csrfToken, { httpOnly: true, sameSite: 'strict' });

// In POST handler
const submittedToken = request.headers.get('x-csrf-token');
if (!validateCsrfToken(submittedToken)) {
  return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
}
```

Create a complete CSRF protection system for the app.
```

---

## Combined High Priority Fix

**Prompt for Claude:**
```
I need to fix all 9 high-priority issues in my Next.js app:

1. No input validation (Zod)
2. N+1 queries in analytics
3. IP spoofing vulnerability
4. Memory leak in infinite scroll
5. No query parameter validation
6. ReDoS vulnerability
7. Unvalidated settings API
8. Weak user data access control
9. No CSRF protection

Please create:
1. Complete implementation for all fixes
2. Database migrations if needed
3. Configuration guide
4. Testing strategy
5. Performance benchmarks

Provide a comprehensive solution package.
```

---

## Testing After Fixes

**Prompt for Claude:**
```
Please create comprehensive tests for all high-priority fixes:

1. Unit tests for Zod validators
2. Integration tests for API endpoints
3. Performance tests for analytics (before/after N+1 fix)
4. Memory leak tests for infinite scroll
5. Security tests for CSRF protection
6. Load tests for rate limiting

Use Jest and React Testing Library.
Generate test files I can run with `npm test`.
```
