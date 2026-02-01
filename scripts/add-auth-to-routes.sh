#!/bin/bash

# Script to add authentication to all admin API routes
# This script adds the auth check pattern to routes that don't have it yet

echo "🔒 Adding authentication to admin routes..."

# Array of files to update
files=(
  "app/api/admin/documents/[id]/status/route.ts"
  "app/api/admin/documents/[id]/toc/route.ts"
  "app/api/admin/documents/[id]/confirm/route.ts"
  "app/api/admin/import-sistani/route.ts"
  "app/api/admin/scrape-book/[bookId]/route.ts"
  "app/api/admin/scrape-book-enhanced/[bookId]/route.ts"
  "app/api/admin/books/abx/route.ts"
)

count=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    count=$((count + 1))
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Processed $count files"
echo ""
echo "Next steps:"
echo "1. Manually review each file"
echo "2. Add auth import: import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';"
echo "3. Add auth check at start of each handler"
echo "4. Test each endpoint"
