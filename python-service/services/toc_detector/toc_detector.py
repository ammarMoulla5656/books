"""
TOC Detector - Main Module
Detects and parses table of contents from documents.
"""

import logging
from typing import List, Optional

from models import TocItem, AiTocParseResult, PageContent
from config import settings
from .arabic_patterns import ArabicTOCPatterns
from .ai_parser import AiTocParser

logger = logging.getLogger(__name__)


class TocDetector:
    """
    Detect and parse table of contents from document text.
    Combines pattern matching with AI for best results.
    """

    def __init__(self, ai_provider: str = "local"):
        """
        Initialize TOC detector.

        Args:
            ai_provider: AI provider for complex parsing (local, claude, openai)
        """
        self.patterns = ArabicTOCPatterns()
        self.ai_parser = AiTocParser(provider=ai_provider)
        self.ai_provider = ai_provider

    async def detect(
        self,
        text: str,
        pages: Optional[List[dict]] = None,
        embedded_toc: Optional[List[dict]] = None
    ) -> AiTocParseResult:
        """
        Detect TOC from document text.

        Strategy:
        1. First check for embedded PDF TOC
        2. Then try pattern matching
        3. Finally use AI for complex cases

        Args:
            text: Full document text or TOC section
            pages: Optional list of pages for context
            embedded_toc: Optional embedded TOC from PDF

        Returns:
            AiTocParseResult with detected TOC
        """
        logger.info("Starting TOC detection")

        # 1. Check embedded TOC (from PDF metadata)
        if embedded_toc and len(embedded_toc) >= 3:
            logger.info(f"Using embedded TOC with {len(embedded_toc)} items")
            toc_items = self._convert_embedded_toc(embedded_toc)
            return AiTocParseResult(
                toc_items=toc_items,
                confidence=0.95,
                provider="embedded"
            )

        # 2. Find TOC section in text
        toc_section = self.patterns.find_toc_section(text)

        if toc_section:
            # 3. Try pattern matching first
            pattern_items = self.patterns.parse_toc(toc_section)

            if len(pattern_items) >= 3:
                logger.info(f"Pattern matching found {len(pattern_items)} items")

                # Detect book info
                book_info = self.patterns.detect_book_info(text[:5000])

                return AiTocParseResult(
                    toc_items=pattern_items,
                    detected_title=book_info.get('title'),
                    detected_author=book_info.get('author'),
                    confidence=0.8,
                    provider="pattern"
                )

        # 4. Use AI for complex cases
        logger.info("Using AI for TOC detection")

        # Prepare text for AI (prioritize TOC section if found)
        ai_text = toc_section if toc_section else text[:20000]

        result = await self.ai_parser.parse(ai_text, pages)

        # If AI found nothing, try analyzing page structure
        if not result.toc_items and pages:
            logger.info("Trying page structure analysis")
            result = await self._analyze_page_structure(pages)

        return result

    def _convert_embedded_toc(self, embedded_toc: List[dict]) -> List[TocItem]:
        """Convert embedded PDF TOC to our format."""
        items = []

        for i, item in enumerate(embedded_toc):
            items.append(TocItem(
                title=item.get('title', ''),
                page_number=item.get('page_number') or item.get('page'),
                level=item.get('level', 1),
                order=i + 1
            ))

        return items

    async def _analyze_page_structure(self, pages: List[dict]) -> AiTocParseResult:
        """
        Analyze page structure to detect chapter breaks.
        Used as fallback when no explicit TOC is found.
        """
        logger.info("Analyzing page structure for chapters")

        items = []
        order = 0

        for page in pages:
            page_num = page.get('page_number', 0)
            text = page.get('text', '')

            if not text:
                continue

            # Check first few lines for chapter-like titles
            first_lines = text.split('\n')[:5]

            for line in first_lines:
                line = line.strip()
                if not line or len(line) < 5:
                    continue

                # Check if line looks like a chapter title
                if self._is_chapter_title(line):
                    order += 1
                    items.append(TocItem(
                        title=line,
                        page_number=page_num,
                        level=self._determine_level_from_title(line),
                        order=order
                    ))
                    break  # Only one title per page

        if items:
            logger.info(f"Found {len(items)} chapters from page structure")

        return AiTocParseResult(
            toc_items=items,
            confidence=0.5 if items else 0.0,
            provider="structure_analysis"
        )

    def _is_chapter_title(self, line: str) -> bool:
        """Check if a line looks like a chapter title."""
        chapter_keywords = [
            'كتاب', 'باب', 'فصل', 'مبحث', 'مقصد',
            'جزء', 'قسم', 'مسألة', 'فرع', 'مطلب'
        ]

        # Check for chapter keywords
        for keyword in chapter_keywords:
            if keyword in line[:30]:
                return True

        # Check for numbered pattern (الأول، الثاني...)
        number_words = ['أول', 'ثاني', 'ثالث', 'رابع', 'خامس']
        for num in number_words:
            if num in line:
                return True

        return False

    def _determine_level_from_title(self, title: str) -> int:
        """Determine hierarchy level from title."""
        title_lower = title[:30]

        if any(kw in title_lower for kw in ['كتاب', 'جزء', 'قسم']):
            return 1
        elif any(kw in title_lower for kw in ['باب', 'فصل', 'مبحث', 'مقصد']):
            return 2
        else:
            return 3

    async def enhance_toc_with_ai(
        self,
        toc_items: List[TocItem],
        full_text: str
    ) -> List[TocItem]:
        """
        Use AI to enhance/correct detected TOC items.
        Can fix titles, page numbers, or hierarchy.
        """
        # Not implemented yet - for future enhancement
        return toc_items
