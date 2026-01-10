"""
Content Splitter
Splits document content based on detected table of contents.
"""

import logging
from typing import List, Dict, Any, Optional
import re

from models import TocItem, ChapterContent, SectionContent, PageContent

logger = logging.getLogger(__name__)


class ContentSplitter:
    """
    Split document content into chapters and sections based on TOC.
    """

    def __init__(self):
        pass

    async def split(
        self,
        pages: List[Dict[str, Any]],
        toc_items: List[Dict[str, Any]]
    ) -> List[ChapterContent]:
        """
        Split document content by TOC.

        Args:
            pages: List of page contents [{"page_number": 1, "text": "..."}]
            toc_items: List of TOC items [{"title": "...", "page_number": 1, "level": 1}]

        Returns:
            List of ChapterContent with sections
        """
        logger.info(f"Splitting content: {len(pages)} pages, {len(toc_items)} TOC items")

        if not pages or not toc_items:
            return []

        # Convert to TocItem objects if needed
        toc_list = self._normalize_toc_items(toc_items)

        # Sort TOC by page number
        toc_with_pages = [t for t in toc_list if t.page_number]
        toc_with_pages.sort(key=lambda x: x.page_number or 0)

        if not toc_with_pages:
            # No page numbers - try to find titles in text
            return await self._split_by_title_matching(pages, toc_list)

        # Split by page numbers
        chapters = []
        level1_items = [t for t in toc_with_pages if t.level == 1]

        if not level1_items:
            # No level 1 items, treat all as chapters
            level1_items = toc_with_pages

        for i, chapter_item in enumerate(level1_items):
            # Determine page range
            start_page = chapter_item.page_number
            end_page = (
                level1_items[i + 1].page_number - 1
                if i + 1 < len(level1_items)
                else len(pages)
            )

            # Extract content
            content = self._extract_pages_content(pages, start_page, end_page)

            # Find sections within this chapter
            child_items = [
                t for t in toc_with_pages
                if t.level > 1 and start_page <= (t.page_number or 0) <= end_page
            ]

            sections = self._extract_sections(pages, child_items, start_page, end_page)

            chapters.append(ChapterContent(
                title=chapter_item.title,
                order=i + 1,
                sections=sections,
                content=content if not sections else None
            ))

        logger.info(f"Created {len(chapters)} chapters")
        return chapters

    def _normalize_toc_items(self, items: List[Dict[str, Any]]) -> List[TocItem]:
        """Convert dict items to TocItem objects."""
        result = []
        for i, item in enumerate(items):
            if isinstance(item, TocItem):
                result.append(item)
            elif isinstance(item, dict):
                result.append(TocItem(
                    title=item.get('title', ''),
                    page_number=item.get('page_number') or item.get('page'),
                    level=item.get('level', 2),
                    order=item.get('order', i + 1)
                ))
        return result

    def _extract_pages_content(
        self,
        pages: List[Dict[str, Any]],
        start_page: int,
        end_page: int
    ) -> str:
        """Extract text from page range."""
        content_parts = []

        for page in pages:
            page_num = page.get('page_number', 0)
            if start_page <= page_num <= end_page:
                text = page.get('text', '')
                if text:
                    content_parts.append(text)

        return '\n\n'.join(content_parts)

    def _extract_sections(
        self,
        pages: List[Dict[str, Any]],
        section_items: List[TocItem],
        chapter_start: int,
        chapter_end: int
    ) -> List[SectionContent]:
        """Extract sections within a chapter."""
        if not section_items:
            return []

        sections = []

        for i, section_item in enumerate(section_items):
            start_page = section_item.page_number
            end_page = (
                section_items[i + 1].page_number - 1
                if i + 1 < len(section_items)
                else chapter_end
            )

            content = self._extract_pages_content(pages, start_page, end_page)

            sections.append(SectionContent(
                title=section_item.title,
                content=content,
                order=i + 1,
                page_count=end_page - start_page + 1 if end_page >= start_page else 1
            ))

        return sections

    async def _split_by_title_matching(
        self,
        pages: List[Dict[str, Any]],
        toc_items: List[TocItem]
    ) -> List[ChapterContent]:
        """
        Split content by matching TOC titles in text.
        Used when page numbers are not available.
        """
        logger.info("Splitting by title matching (no page numbers)")

        # Combine all pages text
        full_text = '\n\n'.join(p.get('text', '') for p in pages)

        chapters = []
        level1_items = [t for t in toc_items if t.level == 1]

        if not level1_items:
            level1_items = toc_items

        for i, chapter_item in enumerate(level1_items):
            # Find chapter title in text
            start_pos = self._find_title_position(full_text, chapter_item.title)

            if start_pos == -1:
                continue

            # Find next chapter start
            end_pos = len(full_text)
            if i + 1 < len(level1_items):
                next_pos = self._find_title_position(
                    full_text,
                    level1_items[i + 1].title,
                    start_pos + 1
                )
                if next_pos > start_pos:
                    end_pos = next_pos

            # Extract content
            content = full_text[start_pos:end_pos].strip()

            # Find sections
            sections = self._find_sections_in_content(
                content,
                [t for t in toc_items if t.level > 1]
            )

            chapters.append(ChapterContent(
                title=chapter_item.title,
                order=i + 1,
                sections=sections,
                content=content if not sections else None
            ))

        return chapters

    def _find_title_position(
        self,
        text: str,
        title: str,
        start: int = 0
    ) -> int:
        """Find position of title in text."""
        # Try exact match first
        pos = text.find(title, start)
        if pos >= 0:
            return pos

        # Try normalized match
        normalized_title = self._normalize_for_matching(title)
        normalized_text = self._normalize_for_matching(text[start:])

        pos = normalized_text.find(normalized_title)
        if pos >= 0:
            return start + pos

        # Try fuzzy match (first few words)
        title_words = title.split()[:3]
        if title_words:
            pattern = r'\s*'.join(re.escape(w) for w in title_words)
            match = re.search(pattern, text[start:])
            if match:
                return start + match.start()

        return -1

    def _normalize_for_matching(self, text: str) -> str:
        """Normalize text for matching."""
        # Remove diacritics and normalize spacing
        text = re.sub(r'[\u064B-\u065F\u0670]', '', text)  # Arabic diacritics
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _find_sections_in_content(
        self,
        content: str,
        section_items: List[TocItem]
    ) -> List[SectionContent]:
        """Find sections within chapter content."""
        sections = []

        for i, section_item in enumerate(section_items):
            pos = self._find_title_position(content, section_item.title)
            if pos == -1:
                continue

            # Find next section
            end_pos = len(content)
            for next_item in section_items[i + 1:]:
                next_pos = self._find_title_position(content, next_item.title, pos + 1)
                if next_pos > pos:
                    end_pos = next_pos
                    break

            section_content = content[pos:end_pos].strip()

            sections.append(SectionContent(
                title=section_item.title,
                content=section_content,
                order=len(sections) + 1
            ))

        return sections


class ContentCleaner:
    """
    Clean and format extracted content.
    """

    @staticmethod
    def clean_chapter_content(content: str) -> str:
        """Clean chapter content for display."""
        if not content:
            return ""

        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = re.sub(r' {2,}', ' ', content)

        # Remove page numbers
        content = re.sub(r'^\s*\d+\s*$', '', content, flags=re.MULTILINE)

        # Remove headers/footers (common patterns)
        content = re.sub(r'^\s*-\s*\d+\s*-\s*$', '', content, flags=re.MULTILINE)

        return content.strip()

    @staticmethod
    def format_for_html(content: str) -> str:
        """Format content for HTML display."""
        if not content:
            return ""

        # Convert paragraphs
        paragraphs = content.split('\n\n')
        formatted = []

        for para in paragraphs:
            para = para.strip()
            if para:
                formatted.append(f'<p>{para}</p>')

        return '\n'.join(formatted)
