"""
Arabic TOC Patterns
Regular expressions and patterns for detecting Arabic book table of contents.
"""

import re
from typing import List, Optional, Tuple
import logging

from models import TocItem

logger = logging.getLogger(__name__)


class ArabicTOCPatterns:
    """
    Detect and parse Arabic table of contents using pattern matching.
    Designed for Islamic religious books and general Arabic texts.
    """

    # ============================================
    # TOC SECTION HEADERS
    # ============================================
    TOC_HEADERS = [
        r'فهرس\s*(?:ال)?محتويات',
        r'فهرس\s*(?:ال)?مواضيع',
        r'فهرس\s*(?:ال)?كتاب',
        r'فهرس\s*(?:ال)?أبواب',
        r'فهرس\s*(?:ال)?فصول',
        r'جدول\s*(?:ال)?محتويات',
        r'المحتويات',
        r'الفهرس(?:\s+العام)?',
        r'ثبت\s*(?:ال)?مواضيع',
    ]

    # ============================================
    # CHAPTER/SECTION PATTERNS (Level 1 - Main divisions)
    # ============================================
    LEVEL1_PATTERNS = [
        # الكتاب الأول، الكتاب الثاني...
        (r'(?:^|\n)\s*(?:ال)?كتاب\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 1),
        # الباب الأول، الباب الثاني...
        (r'(?:^|\n)\s*(?:ال)?باب\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 1),
        # الجزء الأول، الجزء الثاني...
        (r'(?:^|\n)\s*(?:ال)?جزء\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 1),
        # المقصد الأول، المقصد الثاني...
        (r'(?:^|\n)\s*(?:ال)?مقصد\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 1),
        # القسم الأول، القسم الثاني...
        (r'(?:^|\n)\s*(?:ال)?قسم\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 1),
    ]

    # ============================================
    # CHAPTER PATTERNS (Level 2)
    # ============================================
    LEVEL2_PATTERNS = [
        # الفصل الأول، الفصل الثاني...
        (r'(?:^|\n)\s*(?:ال)?فصل\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 2),
        # المبحث الأول، المبحث الثاني...
        (r'(?:^|\n)\s*(?:ال)?مبحث\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 2),
        # الفرع الأول، الفرع الثاني...
        (r'(?:^|\n)\s*(?:ال)?فرع\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 2),
    ]

    # ============================================
    # SECTION PATTERNS (Level 3)
    # ============================================
    LEVEL3_PATTERNS = [
        # المسألة 1، المسألة 2...
        (r'(?:^|\n)\s*(?:ال)?مسألة\s*([\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 3),
        # المطلب الأول، المطلب الثاني...
        (r'(?:^|\n)\s*(?:ال)?مطلب\s+(?:ال)?(أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|[\u0660-\u0669\d]+)\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 3),
        # تنبيه: ...
        (r'(?:^|\n)\s*تنبيه\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 3),
        # ملاحظة: ...
        (r'(?:^|\n)\s*ملاحظة\s*[:\-]?\s*(.+?)(?=\s*[\d\u0660-\u0669]+\s*$|\n|$)', 3),
    ]

    # ============================================
    # GENERIC PATTERNS WITH PAGE NUMBERS
    # ============================================
    GENERIC_TOC_LINE = r'^(.+?)\s*\.{2,}\s*([\d\u0660-\u0669]+)\s*$'
    GENERIC_TOC_LINE_ALT = r'^(.+?)\s{3,}([\d\u0660-\u0669]+)\s*$'

    # ============================================
    # ARABIC NUMBER WORDS TO DIGITS
    # ============================================
    ARABIC_NUMBER_WORDS = {
        'أول': 1, 'الأول': 1,
        'ثاني': 2, 'الثاني': 2,
        'ثالث': 3, 'الثالث': 3,
        'رابع': 4, 'الرابع': 4,
        'خامس': 5, 'الخامس': 5,
        'سادس': 6, 'السادس': 6,
        'سابع': 7, 'السابع': 7,
        'ثامن': 8, 'الثامن': 8,
        'تاسع': 9, 'التاسع': 9,
        'عاشر': 10, 'العاشر': 10,
        'حادي عشر': 11, 'الحادي عشر': 11,
        'ثاني عشر': 12, 'الثاني عشر': 12,
    }

    # Arabic-Indic numerals mapping
    ARABIC_INDIC_MAP = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    }

    def __init__(self):
        # Compile all patterns
        self.toc_header_pattern = re.compile(
            '|'.join(self.TOC_HEADERS),
            re.IGNORECASE | re.MULTILINE
        )

    def find_toc_section(self, text: str, max_pages: int = 20) -> Optional[str]:
        """
        Find the table of contents section in the text.

        Args:
            text: Full document text
            max_pages: Maximum pages to search (roughly)

        Returns:
            TOC section text or None
        """
        # Search for TOC header
        match = self.toc_header_pattern.search(text)

        if match:
            start = match.start()
            # Extract approximately 100 lines after TOC header
            lines = text[start:].split('\n')[:100]
            toc_text = '\n'.join(lines)
            logger.info(f"Found TOC section starting at position {start}")
            return toc_text

        return None

    def parse_toc(self, toc_text: str) -> List[TocItem]:
        """
        Parse TOC section into structured items.

        Args:
            toc_text: Text of the TOC section

        Returns:
            List of TocItem
        """
        items = []
        lines = toc_text.split('\n')
        order = 0

        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue

            # Try to parse as TOC line
            item = self._parse_toc_line(line)
            if item:
                order += 1
                item.order = order
                items.append(item)

        # Build hierarchy
        items = self._build_hierarchy(items)

        logger.info(f"Parsed {len(items)} TOC items")
        return items

    def _parse_toc_line(self, line: str) -> Optional[TocItem]:
        """Parse a single TOC line."""

        # Try generic patterns first (title ... page_number)
        generic_match = re.match(self.GENERIC_TOC_LINE, line)
        if not generic_match:
            generic_match = re.match(self.GENERIC_TOC_LINE_ALT, line)

        if generic_match:
            title = generic_match.group(1).strip()
            page_str = generic_match.group(2)
            page_number = self._convert_arabic_number(page_str)

            # Determine level
            level = self._determine_level(title)

            return TocItem(
                title=title,
                page_number=page_number,
                level=level,
                order=0
            )

        # Try structured patterns
        for patterns, default_level in [
            (self.LEVEL1_PATTERNS, 1),
            (self.LEVEL2_PATTERNS, 2),
            (self.LEVEL3_PATTERNS, 3)
        ]:
            for pattern, level in patterns:
                match = re.search(pattern, line)
                if match:
                    groups = match.groups()
                    if len(groups) >= 2:
                        number_part = groups[0]
                        title = groups[1].strip()
                    else:
                        title = groups[0].strip()

                    # Try to find page number at end
                    page_match = re.search(r'([\d\u0660-\u0669]+)\s*$', line)
                    page_number = self._convert_arabic_number(page_match.group(1)) if page_match else None

                    return TocItem(
                        title=title,
                        page_number=page_number,
                        level=level,
                        order=0
                    )

        return None

    def _determine_level(self, title: str) -> int:
        """Determine hierarchy level from title content."""

        # Check for level 1 keywords
        level1_keywords = ['كتاب', 'باب', 'جزء', 'مقصد', 'قسم']
        for keyword in level1_keywords:
            if keyword in title[:20]:
                return 1

        # Check for level 2 keywords
        level2_keywords = ['فصل', 'مبحث', 'فرع']
        for keyword in level2_keywords:
            if keyword in title[:20]:
                return 2

        # Check for level 3 keywords
        level3_keywords = ['مسألة', 'مطلب', 'تنبيه', 'ملاحظة']
        for keyword in level3_keywords:
            if keyword in title[:20]:
                return 3

        # Default to level 2
        return 2

    def _convert_arabic_number(self, text: str) -> Optional[int]:
        """Convert Arabic/Arabic-Indic number to integer."""
        if not text:
            return None

        text = text.strip()

        # Check if it's a word number
        if text in self.ARABIC_NUMBER_WORDS:
            return self.ARABIC_NUMBER_WORDS[text]

        # Convert Arabic-Indic numerals to Western
        converted = ''
        for char in text:
            if char in self.ARABIC_INDIC_MAP:
                converted += self.ARABIC_INDIC_MAP[char]
            elif char.isdigit():
                converted += char

        try:
            return int(converted) if converted else None
        except ValueError:
            return None

    def _build_hierarchy(self, items: List[TocItem]) -> List[TocItem]:
        """Build parent-child relationships based on levels."""

        if not items:
            return items

        # Stack to track parent items at each level
        level_stack = {}

        for item in items:
            level = item.level

            # Find parent (closest item with lower level)
            parent_level = level - 1
            while parent_level >= 1:
                if parent_level in level_stack:
                    parent = level_stack[parent_level]
                    item.parent_id = parent.id
                    parent.children.append(item)
                    break
                parent_level -= 1

            # Update stack
            level_stack[level] = item

            # Clear higher levels from stack
            for l in list(level_stack.keys()):
                if l > level:
                    del level_stack[l]

        # Return only top-level items (children are nested)
        return [item for item in items if item.parent_id is None]

    def detect_book_info(self, text: str) -> dict:
        """
        Try to detect book title and author from text.

        Args:
            text: Document text (usually first few pages)

        Returns:
            Dict with 'title' and 'author' if found
        """
        info = {}

        # Common patterns for book title
        title_patterns = [
            r'(?:^|\n)\s*كتاب\s+(.+?)(?:\n|$)',
            r'(?:^|\n)\s*رسالة\s+(.+?)(?:\n|$)',
            r'بسم\s+الله\s+الرحمن\s+الرحيم\s*\n+\s*(.+?)(?:\n|$)',
        ]

        for pattern in title_patterns:
            match = re.search(pattern, text[:2000])
            if match:
                info['title'] = match.group(1).strip()
                break

        # Common patterns for author
        author_patterns = [
            r'(?:تأليف|للشيخ|للعلامة|للإمام|المؤلف)\s*[:\s]?\s*(.+?)(?:\n|$)',
            r'(?:^|\n)\s*(.+?)\s+(?:قدس سره|دام ظله|حفظه الله)',
        ]

        for pattern in author_patterns:
            match = re.search(pattern, text[:3000])
            if match:
                info['author'] = match.group(1).strip()
                break

        return info
