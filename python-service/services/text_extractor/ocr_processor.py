"""
OCR Processor
Extracts text from scanned/image-based PDFs using EasyOCR and Tesseract.
"""

import logging
from pathlib import Path
from typing import List, Optional
from PIL import Image
import io
import fitz  # PyMuPDF for PDF to image conversion

from models import PageContent
from config import settings

logger = logging.getLogger(__name__)

# Lazy load OCR libraries (they're heavy)
_easyocr_reader = None
_tesseract_available = None


def get_easyocr_reader():
    """Get or create EasyOCR reader (singleton)."""
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            logger.info("Initializing EasyOCR reader...")
            _easyocr_reader = easyocr.Reader(
                settings.EASYOCR_LANGUAGES,
                gpu=settings.EASYOCR_GPU
            )
            logger.info("EasyOCR reader initialized")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {e}")
            raise
    return _easyocr_reader


def check_tesseract():
    """Check if Tesseract is available."""
    global _tesseract_available
    if _tesseract_available is None:
        try:
            import pytesseract
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            pytesseract.get_tesseract_version()
            _tesseract_available = True
            logger.info("Tesseract OCR is available")
        except Exception as e:
            logger.warning(f"Tesseract not available: {e}")
            _tesseract_available = False
    return _tesseract_available


class OCRProcessor:
    """
    Process scanned PDFs using OCR.
    Supports EasyOCR (primary) and Tesseract (fallback).
    """

    def __init__(self, provider: str = "easyocr"):
        """
        Initialize OCR processor.

        Args:
            provider: OCR provider to use (easyocr, tesseract, google)
        """
        self.provider = provider
        self.dpi = 300  # Resolution for PDF to image conversion

    async def process_pdf(self, file_path: str) -> List[PageContent]:
        """
        Process all pages of a PDF using OCR.

        Args:
            file_path: Path to the PDF file

        Returns:
            List of PageContent with OCR text
        """
        logger.info(f"Processing PDF with OCR: {file_path}")
        pages = []

        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)

            for page_num in range(total_pages):
                logger.info(f"OCR processing page {page_num + 1}/{total_pages}")

                # Convert PDF page to image
                page = doc[page_num]
                pix = page.get_pixmap(dpi=self.dpi)
                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))

                # Preprocess image
                image = self._preprocess_image(image)

                # Run OCR
                text, confidence = await self._run_ocr(image)

                pages.append(PageContent(
                    page_number=page_num + 1,
                    text=text,
                    confidence=confidence,
                    is_ocr=True
                ))

            doc.close()
            logger.info(f"OCR completed for {total_pages} pages")
            return pages

        except Exception as e:
            logger.error(f"OCR processing failed: {e}")
            raise

    async def process_image(self, image: Image.Image) -> tuple[str, float]:
        """
        Process a single image with OCR.

        Args:
            image: PIL Image

        Returns:
            Tuple of (text, confidence)
        """
        image = self._preprocess_image(image)
        return await self._run_ocr(image)

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR results.
        """
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize if too small
        min_dimension = 1000
        if min(image.size) < min_dimension:
            scale = min_dimension / min(image.size)
            new_size = (int(image.size[0] * scale), int(image.size[1] * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        return image

    async def _run_ocr(self, image: Image.Image) -> tuple[str, float]:
        """
        Run OCR on an image using the configured provider.
        """
        if self.provider == "easyocr":
            return await self._ocr_easyocr(image)
        elif self.provider == "tesseract":
            return await self._ocr_tesseract(image)
        elif self.provider == "google":
            return await self._ocr_google(image)
        else:
            # Default to EasyOCR
            return await self._ocr_easyocr(image)

    async def _ocr_easyocr(self, image: Image.Image) -> tuple[str, float]:
        """Run OCR using EasyOCR."""
        try:
            import numpy as np

            reader = get_easyocr_reader()

            # Convert PIL Image to numpy array
            img_array = np.array(image)

            # Run OCR
            results = reader.readtext(img_array, detail=1)

            if not results:
                return "", 0.0

            # Extract text and calculate average confidence
            texts = []
            total_confidence = 0.0

            for detection in results:
                # detection format: (bbox, text, confidence)
                _, text, confidence = detection
                texts.append(text)
                total_confidence += confidence

            avg_confidence = total_confidence / len(results) if results else 0.0

            # Join text with proper spacing
            # For Arabic, we need to handle RTL
            full_text = self._join_arabic_text(texts)

            return full_text, avg_confidence

        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            # Fallback to Tesseract
            if check_tesseract():
                return await self._ocr_tesseract(image)
            raise

    async def _ocr_tesseract(self, image: Image.Image) -> tuple[str, float]:
        """Run OCR using Tesseract."""
        try:
            import pytesseract

            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

            # Run OCR with Arabic language
            text = pytesseract.image_to_string(
                image,
                lang='ara+eng',  # Arabic + English
                config='--psm 6'  # Assume uniform block of text
            )

            # Get confidence data
            data = pytesseract.image_to_data(
                image,
                lang='ara+eng',
                output_type=pytesseract.Output.DICT
            )

            # Calculate average confidence
            confidences = [int(c) for c in data['conf'] if int(c) > 0]
            avg_confidence = sum(confidences) / len(confidences) / 100 if confidences else 0.0

            return text.strip(), avg_confidence

        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            raise

    async def _ocr_google(self, image: Image.Image) -> tuple[str, float]:
        """Run OCR using Google Cloud Vision."""
        if not settings.GOOGLE_CLOUD_KEY:
            raise ValueError("Google Cloud API key not configured")

        try:
            from google.cloud import vision
            import io as io_module

            client = vision.ImageAnnotatorClient()

            # Convert image to bytes
            img_byte_arr = io_module.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()

            vision_image = vision.Image(content=img_byte_arr)

            # Perform OCR
            response = client.document_text_detection(
                image=vision_image,
                image_context={"language_hints": ["ar", "en"]}
            )

            if response.error.message:
                raise Exception(response.error.message)

            text = response.full_text_annotation.text
            confidence = 0.95  # Google Vision doesn't return per-text confidence easily

            return text.strip(), confidence

        except Exception as e:
            logger.error(f"Google Vision OCR failed: {e}")
            raise

    def _join_arabic_text(self, texts: List[str]) -> str:
        """
        Join Arabic text fragments properly.
        Handles RTL text and proper spacing.
        """
        try:
            import arabic_reshaper
            from bidi.algorithm import get_display

            # Reshape and reorder Arabic text
            reshaped_texts = []
            for text in texts:
                reshaped = arabic_reshaper.reshape(text)
                bidi_text = get_display(reshaped)
                reshaped_texts.append(bidi_text)

            return ' '.join(reshaped_texts)

        except ImportError:
            # If arabic-reshaper not available, just join
            return ' '.join(texts)


class OCRCache:
    """
    Cache OCR results to avoid re-processing.
    Uses file hash and page number as key.
    """

    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or settings.TEMP_DIR / "ocr_cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def get(self, file_hash: str, page_number: int) -> Optional[str]:
        """Get cached OCR result."""
        cache_file = self.cache_dir / f"{file_hash}_{page_number}.txt"
        if cache_file.exists():
            return cache_file.read_text(encoding="utf-8")
        return None

    def set(self, file_hash: str, page_number: int, text: str):
        """Cache OCR result."""
        cache_file = self.cache_dir / f"{file_hash}_{page_number}.txt"
        cache_file.write_text(text, encoding="utf-8")

    def clear(self):
        """Clear all cached results."""
        import shutil
        if self.cache_dir.exists():
            shutil.rmtree(self.cache_dir)
            self.cache_dir.mkdir(parents=True, exist_ok=True)
