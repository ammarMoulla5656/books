#!/bin/bash

# استخراج كتاب كامل من موقع السيستاني
# Full book scraper using curl

BOOK_ID=${1:-13}
MAX_CHAPTERS=${2:-200}
OUTPUT_DIR="./scraped-books"
BOOK_FILE="$OUTPUT_DIR/book-$BOOK_ID.json"

echo "🕌 بسم الله الرحمن الرحيم"
echo "📚 استخراج الكتاب $BOOK_ID من موقع السيستاني..."
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Get list of chapter IDs
echo "📋 استخراج قائمة الفصول..."
CHAPTER_IDS=$(curl -s "https://www.sistani.org/arabic/book/$BOOK_ID/" | \
  grep -o "href=\"/arabic/book/$BOOK_ID/[0-9]*/" | \
  grep -o "[0-9]*" | \
  head -n "$MAX_CHAPTERS")

CHAPTER_COUNT=$(echo "$CHAPTER_IDS" | wc -l | tr -d ' ')
echo "✓ وجدت $CHAPTER_COUNT فصل"
echo ""

# Start JSON
echo "{" > "$BOOK_FILE"
echo "  \"bookId\": \"$BOOK_ID\"," >> "$BOOK_FILE"
echo "  \"chapters\": [" >> "$BOOK_FILE"

COUNTER=0
for CHAPTER_ID in $CHAPTER_IDS; do
  COUNTER=$((COUNTER + 1))

  echo "[$COUNTER/$CHAPTER_COUNT] جاري استخراج الفصل $CHAPTER_ID..."

  # Fetch chapter content
  CONTENT=$(curl -s "https://www.sistani.org/arabic/book/$BOOK_ID/$CHAPTER_ID/")

  # Extract title
  TITLE=$(echo "$CONTENT" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g' | head -1)

  # Save chapter data
  if [ $COUNTER -gt 1 ]; then
    echo "," >> "$BOOK_FILE"
  fi

  echo "    {" >> "$BOOK_FILE"
  echo "      \"id\": \"$CHAPTER_ID\"," >> "$BOOK_FILE"
  echo "      \"title\": \"$TITLE\"," >> "$BOOK_FILE"
  echo "      \"order\": $COUNTER" >> "$BOOK_FILE"
  echo -n "    }" >> "$BOOK_FILE"

  # Save full HTML to separate file
  echo "$CONTENT" > "$OUTPUT_DIR/chapter-$BOOK_ID-$CHAPTER_ID.html"

  # Small delay to not overwhelm server
  sleep 1
done

# Close JSON
echo "" >> "$BOOK_FILE"
echo "  ]" >> "$BOOK_FILE"
echo "}" >> "$BOOK_FILE"

echo ""
echo "============================================================"
echo "✅ اكتمل الاستخراج!"
echo "============================================================"
echo "📁 الملفات محفوظة في: $OUTPUT_DIR"
echo "📄 ملف JSON: $BOOK_FILE"
echo "📑 عدد الفصول: $CHAPTER_COUNT"
echo "============================================================"
