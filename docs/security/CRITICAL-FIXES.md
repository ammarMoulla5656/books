# 🔴 CRITICAL SECURITY FIXES - Claude Prompts

## Fix 1: Remove Hardcoded Admin Password

**Prompt for Claude:**
```
I need to fix a critical security vulnerability in my Islamic Library app. The admin password is hardcoded as 'Admin@123456' in multiple files:
- /lib/auth.ts (line 21)
- /app/api/admin/seed/route.ts (line 58)
- /prisma/seed.ts
- /scripts/create-admin.ts

Please:
1. Remove all hardcoded passwords
2. Generate a cryptographically random password at deployment time
3. Store it securely in environment variable ADMIN_INITIAL_PASSWORD
4. Add a "force password change on first login" feature
5. Show me the updated code for all affected files

Make sure the solution is production-ready and secure.
```

---

## Fix 2: Add Authentication to Admin Routes

**Prompt for Claude:**
```
My admin API routes have NO authentication - anyone can access them! These routes are vulnerable:
- /app/api/admin/seed/route.ts
- /app/api/admin/books/abx/route.ts
- /app/api/admin/documents/route.ts
- /app/api/admin/import-sistani/route.ts
- /app/api/admin/scrape-book/[bookId]/route.ts

Please:
1. Create a middleware function to check admin authentication
2. Add authentication checks to ALL admin routes
3. Return 401 Unauthorized if not authenticated
4. Use the existing getAdminSession() from /lib/session.ts
5. Show me the updated code for all affected routes

Example pattern I want:
```typescript
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

Apply this to all admin routes consistently.
```

---

## Fix 3: Implement Database Session Management

**Prompt for Claude:**
```
My session management is critically flawed:
- Sessions stored in memory Map (lost on restart)
- No expiration checks
- UUIDs are predictable
- File: /lib/session.ts

Please completely rewrite the session system to:
1. Store sessions in PostgreSQL database using Prisma
2. Add expiration timestamps (24 hours default)
3. Use cryptographically secure random tokens (not UUIDs)
4. Validate sessions against database on every request
5. Auto-delete expired sessions
6. Add session refresh mechanism

Also update the Prisma schema to include:
```prisma
model AdminSession {
  id        String   @id @default(cuid())
  token     String   @unique
  adminId   String
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Show me the complete updated /lib/session.ts file.
```

---

## Fix 4: Fix Path Traversal Vulnerability

**Prompt for Claude:**
```
There's a path traversal vulnerability in /app/api/admin/documents/[id]/route.ts at line 92:

```typescript
const upload = await prisma.documentUpload.findUnique({ where: { id } });
await unlink(upload.storagePath); // DANGEROUS: uses DB path directly!
```

An attacker could manipulate the database to set storagePath to any system file.

Please:
1. Add path validation to ensure file is within uploads directory
2. Use path.resolve() and verify it starts with uploadsDir
3. Add error handling for invalid paths
4. Apply the same fix to all file operations in the codebase

Show me the secure implementation.
```

---

## Fix 5: Validate File Uploads Properly

**Prompt for Claude:**
```
File upload validation in /app/api/admin/documents/route.ts is broken:
- Only checks MIME type from client (can be spoofed)
- No magic byte validation
- 100MB limit too large
- No filename sanitization

Please rewrite the file upload handler to:
1. Validate file content using magic bytes (not MIME type)
2. Check PDF signature: [0x25, 0x50, 0x44, 0x46] (%PDF)
3. Check DOCX signature: [0x50, 0x4b, 0x03, 0x04] (PK..)
4. Sanitize filename (remove special chars)
5. Generate random hash-based filenames
6. Reduce size limit to 50MB
7. Add virus scanning hook (placeholder for ClamAV)

Show me the complete updated upload handler with proper validation.
```

---

## Fix 6: Secure Database Credentials

**Prompt for Claude:**
```
My .env file contains plaintext credentials:
```
DATABASE_URL="postgresql://postgres:iioopp00@localhost:5432/islamic_library"
```

This is committed to git and uses default credentials.

Please help me:
1. Create a .env.example template (without real credentials)
2. Add .env to .gitignore
3. Document how to set up environment variables securely
4. Create instructions for using secrets manager in production (AWS Secrets Manager example)
5. Add startup validation to check required env vars exist
6. Show me how to rotate database credentials safely

Provide the complete setup guide.
```

---

## Fix 7: Implement Rate Limiting and CORS

**Prompt for Claude:**
```
My API has no rate limiting or CORS protection. Any origin can spam requests.

Please create a comprehensive security middleware that:
1. Implements rate limiting (100 requests per 15 minutes per IP)
2. Configures CORS to only allow specific origins
3. Adds security headers (HSTS, X-Frame-Options, CSP, etc.)
4. Blocks common attack patterns
5. Logs suspicious activity

Create a /middleware.ts file with:
- Rate limiting using in-memory Map (or Redis if available)
- CORS whitelist from environment variable
- Security headers best practices
- Request size limits
- Apply to all API routes

Show me the complete middleware.ts implementation.
```

---

## Combined Fix Script

**Prompt for Claude:**
```
I have 7 critical security vulnerabilities in my Next.js app. Please create a step-by-step migration script that fixes all of them safely:

1. Hardcoded admin passwords
2. No auth on admin routes
3. Session management in memory
4. Path traversal in file operations
5. Weak file upload validation
6. Exposed database credentials
7. No rate limiting or CORS

Requirements:
- Create database migration for AdminSession table
- Update all affected files
- Add comprehensive tests
- Create rollback procedure
- Document breaking changes
- Provide deployment checklist

Generate:
1. Prisma migration files
2. Updated code for all affected files
3. Environment variable documentation
4. Deployment script
5. Testing instructions

Make it production-ready and foolproof.
```

---

## Testing Prompts

**After Fixes - Validation Prompt:**
```
I've implemented the critical security fixes. Please review and test:

1. Session Management:
   - Test session creation and validation
   - Verify expiration works
   - Check database persistence

2. Authentication:
   - Try accessing admin routes without auth
   - Verify 401 responses
   - Test session timeout

3. File Uploads:
   - Try uploading malicious files
   - Test magic byte validation
   - Verify path traversal protection

4. Rate Limiting:
   - Simulate 200 requests from one IP
   - Verify rate limit kicks in
   - Test CORS from different origins

Generate test cases and a security verification script I can run.
```

---

## Emergency Rollback Prompt

**If Something Breaks:**
```
The security fixes broke my application. Here's the error:
[PASTE ERROR HERE]

Please help me:
1. Identify what went wrong
2. Create a safe rollback procedure
3. Fix the issue without losing security improvements
4. Test the fix thoroughly

Current state:
- Database migrations applied: [YES/NO]
- Code deployed: [YES/NO]
- Error occurs when: [DESCRIBE]
```
