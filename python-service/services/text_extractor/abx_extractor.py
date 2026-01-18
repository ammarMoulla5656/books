"""
ABX File Extractor
Handles extraction of text from ABX format files.
ABX can be a ZIP archive or a plain text file with special formatting.
"""

import logging
import zipfile
import json
from pathlib import Path
from typing import Tuple, Optional
from models import ExtractedText, PageContent

logger = logging.getLogger(__name__)


class ABXExtractor:
    """
    Extract text from ABX format files.
    Supports both:
    1. ZIP-based ABX files (containing chapters/sections as separate files)
    2. Plain text ABX files (with metadata in header)
    """

    async def extract(self, file_path: str) -> ExtractedText:
        """
        Extract text from ABX file.

        Args:
            file_path: Path to ABX file

        Returns:
            ExtractedText with all pages and metadata
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            # Try to open as ZIP archive first
            if zipfile.is_zipfile(file_path):
                return await self._extract_from_zip(file_path)
            else:
                # Fall back to plain text extraction
                return await self._extract_from_text(file_path)

        except Exception as e:
            logger.error(f"ABX extraction failed: {e}")
            raise

    async def _extract_from_zip(self, file_path: str) -> ExtractedText:
        """
        Extract text from ZIP-based ABX file.

        Assumes structure like:
        - metadata.json (optional)
        - chapters/
          - 01_chapter.txt
          - 02_chapter.txt
        - content.txt (fallback)
        """
        logger.info("Extracting ABX as ZIP archive")

        pages = []
        metadata = {}
        page_num = 1
        all_text = []

        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                # Try to read metadata first
                metadata_files = [f for f in zip_ref.namelist() if 'metadata' in f.lower()]
                if metadata_files:
                    try:
                        with zip_ref.open(metadata_files[0]) as meta_file:
                            metadata = json.loads(meta_file.read().decode('utf-8'))
                            logger.info(f"Loaded metadata from {metadata_files[0]}")
                    except Exception as e:
                        logger.warning(f"Failed to read metadata: {e}")

                # Extract text files (chapters or content)
                text_files = [f for f in zip_ref.namelist()
                             if f.endswith(('.txt', '.text')) and not f.lower().startswith('metadata')]
                text_files.sort()  # Ensure ordered extraction

                for file_in_zip in text_files:
                    try:
                        with zip_ref.open(file_in_zip) as text_file:
                            content = text_file.read().decode('utf-8')
                            if content.strip():
                                all_text.append(content)
                                pages.append(PageContent(
                                    page_number=page_num,
                                    text=content.strip(),
                                    is_ocr=False
                                ))
                                page_num += 1
                    except Exception as e:
                        logger.warning(f"Failed to read {file_in_zip}: {e}")

        except zipfile.BadZipFile:
            logger.warning("Not a valid ZIP file, attempting plain text extraction")
            return await self._extract_from_text(file_path)

        if not pages:
            # If no text files found in ZIP, try to read as plain text
            return await self._extract_from_text(file_path)

        full_text = "\n\n".join(all_text)

        return ExtractedText(
            text=full_text,
            pages=pages,
            total_pages=len(pages),
            is_scanned=False,
            extraction_method="abx_zip"
        )

    async def _extract_from_text(self, file_path: str) -> ExtractedText:
        """
        Extract text from plain text ABX file.

        Assumes format:
        ---
        {metadata in JSON or key=value format}
        ---
        {actual content}
        """
        logger.info("Extracting ABX as plain text file")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Try to parse metadata section if present
            metadata = {}
            text_content = content

            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    meta_section = parts[1].strip()
                    text_content = parts[2].strip()

                    # Try to parse as JSON
                    try:
                        metadata = json.loads(meta_section)
                        logger.info("Parsed metadata as JSON")
                    except json.JSONDecodeError:
                        # Try to parse as key=value
                        for line in meta_section.split('\n'):
                            if '=' in line:
                                key, value = line.split('=', 1)
                                metadata[key.strip()] = value.strip()
                        if metadata:
                            logger.info("Parsed metadata as key=value")

            # Split text into pages (approximate by line count or content length)
            pages = self._split_into_pages(text_content)

            full_text = text_content.strip()

            return ExtractedText(
                text=full_text,
                pages=pages,
                total_pages=len(pages),
                is_scanned=False,
                extraction_method="abx_text"
            )

        except Exception as e:
            logger.error(f"Plain text ABX extraction failed: {e}")
            raise

    def _split_into_pages(self, text: str, lines_per_page: int = 50) -> list:
        """
        Split text content into pages based on line count.

        Args:
            text: Full text content
            lines_per_page: Approximate lines per page

        Returns:
            List of PageContent objects
        """
        lines = text.split('\n')
        pages = []
        page_num = 1

        for i in range(0, len(lines), lines_per_page):
            page_lines = lines[i:i + lines_per_page]
            page_text = '\n'.join(page_lines).strip()

            if page_text:
                pages.append(PageContent(
                    page_number=page_num,
                    text=page_text,
                    is_ocr=False
                ))
                page_num += 1

        return pages if pages else [
            PageContent(
                page_number=1,
                text=text.strip(),
                is_ocr=False
            )
        ]
