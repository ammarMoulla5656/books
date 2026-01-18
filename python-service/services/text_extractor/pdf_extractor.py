"""
PDF Text Extractor
Extracts text from PDF files using PyMuPDF and pdfplumber.
"""

import fitz  # PyMuPDF
import pdfplumber
from pathlib import Path
from typing import List, Tuple, Optional
import logging
import re

from models import PageContent, ExtractedText
from config import settings

logger = logging.getLogger(__name__)


class PDFExtractor:
    """
    Extract text from PDF files.
    Uses PyMuPDF as primary method, falls back to pdfplumber if needed.
    Automatically detects if PDF is scanned (image-based).
    """

    def __init__(self):
        self.min_text_for_non_ocr = settings.MIN_TEXT_LENGTH_FOR_OCR

    async def extract(self, file_path: str) -> Tuple[ExtractedText, bool]:
        """
        Extract text from a PDF file.

        Args:
            file_path: Path to the PDF file

        Returns:
            Tuple of (ExtractedText, is_scanned)
            is_scanned is True if the PDF appears to be image-based
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        logger.info(f"Extracting text from PDF: {file_path}")

        # Try PyMuPDF first (faster)
        pages, total_pages = await self._extract_with_pymupdf(file_path)

        # Check if PDF is scanned (very little text)
        total_text = "".join(p.text for p in pages)
        is_scanned = len(total_text.strip()) < self.min_text_for_non_ocr * total_pages

        if is_scanned:
            logger.info("PDF appears to be scanned (image-based)")
        else:
            logger.info(f"Extracted {len(total_text)} characters from {total_pages} pages")

        return ExtractedText(
            text=total_text,
            pages=pages,
            total_pages=total_pages,
            is_scanned=is_scanned,
            extraction_method="pymupdf"
        ), is_scanned

    async def _extract_with_pymupdf(self, file_path: str) -> Tuple[List[PageContent], int]:
        """Extract text using PyMuPDF (fitz)."""
        pages = []

        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)

            for page_num in range(total_pages):
                page = doc[page_num]
                text = page.get_text("text")

                # Clean up text
                text = self._clean_text(text)

                pages.append(PageContent(
                    page_number=page_num + 1,
                    text=text,
                    is_ocr=False
                ))

            doc.close()
            return pages, total_pages

        except Exception as e:
            logger.error(f"PyMuPDF extraction failed: {e}")
            # Fallback to pdfplumber
            return await self._extract_with_pdfplumber(file_path)

    async def _extract_with_pdfplumber(self, file_path: str) -> Tuple[List[PageContent], int]:
        """Extract text using pdfplumber (more accurate for some PDFs)."""
        pages = []

        try:
            with pdfplumber.open(file_path) as pdf:
                total_pages = len(pdf.pages)

                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    text = self._clean_text(text)

                    pages.append(PageContent(
                        page_number=page_num + 1,
                        text=text,
                        is_ocr=False
                    ))

            return pages, total_pages

        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}")
            raise

    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        if not text:
            return ""

        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)

        # Fix common Arabic text issues
        # Remove zero-width characters
        text = re.sub(r'[\u200b\u200c\u200d\ufeff]', '', text)

        # Normalize Arabic characters
        text = self._normalize_arabic(text)

        return text.strip()

    def _normalize_arabic(self, text: str) -> str:
        """Normalize Arabic text for consistency."""
        # Normalize alef variations
        text = re.sub(r'[آأإا]', 'ا', text)

        # Normalize yaa variations
        text = re.sub(r'[يى]', 'ي', text)

        # Normalize taa marbuta
        text = re.sub(r'ة', 'ه', text)

        return text

    async def get_pdf_info(self, file_path: str) -> dict:
        """Get PDF metadata and information."""
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata

            info = {
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", ""),
                "producer": metadata.get("producer", ""),
                "page_count": len(doc),
                "has_toc": len(doc.get_toc()) > 0,
                "toc": doc.get_toc()  # Built-in table of contents
            }

            doc.close()
            return info

        except Exception as e:
            logger.error(f"Failed to get PDF info: {e}")
            return {"page_count": 0, "has_toc": False}

    async def get_embedded_toc(self, file_path: str) -> List[dict]:
        """
        Extract embedded table of contents from PDF.
        Many PDFs have a built-in TOC that can be used directly.
        """
        try:
            doc = fitz.open(file_path)
            toc = doc.get_toc()
            doc.close()

            if not toc:
                return []

            # Convert to our format
            result = []
            for level, title, page in toc:
                result.append({
                    "level": level,
                    "title": title,
                    "page_number": page
                })

            logger.info(f"Found embedded TOC with {len(result)} entries")
            return result

        except Exception as e:
            logger.error(f"Failed to get embedded TOC: {e}")
            return []
