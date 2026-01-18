"""
Document Processor - Main Processing Pipeline
Orchestrates the full document processing workflow.
"""

import logging
import time
from typing import Dict, Any, Optional
from pathlib import Path
import hashlib

from models import (
    ProcessingOptions,
    ProcessingStatus,
    ProcessingStep,
    StepStatus,
    TocItem,
    ChapterContent,
)
from config import settings
from .text_extractor import TextExtractor, PDFExtractor
from .toc_detector import TocDetector
from .content_splitter import ContentSplitter

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Main document processing pipeline.
    Coordinates text extraction, TOC detection, and content splitting.
    """

    def __init__(self):
        self.text_extractor = TextExtractor()
        self.pdf_extractor = PDFExtractor()
        self.content_splitter = ContentSplitter()

    async def process(
        self,
        upload_id: str,
        file_path: str,
        options: ProcessingOptions,
        status_store: Dict[str, Any]
    ):
        """
        Process a document through the full pipeline.

        Args:
            upload_id: Unique identifier for this upload
            file_path: Path to the document file
            options: Processing options
            status_store: Dict to update with progress
        """
        logger.info(f"Starting processing for upload {upload_id}")

        try:
            # Initialize status
            self._update_status(status_store, upload_id, ProcessingStatus.EXTRACTING_TEXT, 10)

            # Step 1: Get document info
            doc_info = await self.text_extractor.get_document_info(file_path)
            status_store[upload_id]['page_count'] = doc_info.get('page_count', 0)

            # Step 2: Extract text
            self._log_step(status_store, upload_id, ProcessingStep.TEXT_EXTRACTION, StepStatus.IN_PROGRESS)
            start_time = time.time()

            extracted = await self.text_extractor.extract(
                file_path,
                use_ocr=options.use_ocr,
                ocr_provider=options.ocr_provider
            )

            duration = int((time.time() - start_time) * 1000)
            self._log_step(
                status_store, upload_id,
                ProcessingStep.TEXT_EXTRACTION if not extracted.is_scanned else ProcessingStep.OCR,
                StepStatus.COMPLETED,
                f"Extracted {len(extracted.text)} characters from {extracted.total_pages} pages",
                duration
            )

            self._update_status(status_store, upload_id, ProcessingStatus.DETECTING_TOC, 30)

            # Step 3: Get embedded TOC (for PDFs)
            embedded_toc = None
            if file_path.lower().endswith('.pdf'):
                embedded_toc = await self.pdf_extractor.get_embedded_toc(file_path)

            # Step 4: Detect TOC
            self._log_step(status_store, upload_id, ProcessingStep.TOC_DETECTION, StepStatus.IN_PROGRESS)
            start_time = time.time()

            toc_detector = TocDetector(ai_provider=options.ai_provider if options.use_ai_parsing else "pattern")

            toc_result = await toc_detector.detect(
                extracted.text,
                pages=[p.model_dump() for p in extracted.pages],
                embedded_toc=embedded_toc
            )

            duration = int((time.time() - start_time) * 1000)
            self._log_step(
                status_store, upload_id,
                ProcessingStep.TOC_DETECTION,
                StepStatus.COMPLETED,
                f"Found {len(toc_result.toc_items)} TOC entries using {toc_result.provider}",
                duration
            )

            # Update detected info
            if toc_result.detected_title:
                status_store[upload_id]['detected_title'] = toc_result.detected_title
            if toc_result.detected_author:
                status_store[upload_id]['detected_author'] = toc_result.detected_author

            self._update_status(status_store, upload_id, ProcessingStatus.PARSING_STRUCTURE, 50)

            # Step 5: Use AI for complex TOC (if enabled and needed)
            if options.use_ai_parsing and len(toc_result.toc_items) < 3:
                self._log_step(status_store, upload_id, ProcessingStep.AI_PARSING, StepStatus.IN_PROGRESS)
                start_time = time.time()

                # Re-run with AI
                ai_detector = TocDetector(ai_provider=options.ai_provider)
                toc_result = await ai_detector.detect(extracted.text)

                duration = int((time.time() - start_time) * 1000)
                self._log_step(
                    status_store, upload_id,
                    ProcessingStep.AI_PARSING,
                    StepStatus.COMPLETED,
                    f"AI found {len(toc_result.toc_items)} entries",
                    duration
                )

            self._update_status(status_store, upload_id, ProcessingStatus.SPLITTING_CONTENT, 70)

            # Step 6: Split content
            self._log_step(status_store, upload_id, ProcessingStep.CONTENT_SPLITTING, StepStatus.IN_PROGRESS)
            start_time = time.time()

            chapters = await self.content_splitter.split(
                [p.model_dump() for p in extracted.pages],
                [t.model_dump() for t in toc_result.toc_items]
            )

            duration = int((time.time() - start_time) * 1000)
            self._log_step(
                status_store, upload_id,
                ProcessingStep.CONTENT_SPLITTING,
                StepStatus.COMPLETED,
                f"Split into {len(chapters)} chapters",
                duration
            )

            self._update_status(status_store, upload_id, ProcessingStatus.SAVING_TO_DB, 90)

            # Step 7: Prepare result for database save
            # (Actual DB save happens in Next.js API)
            result = {
                'upload_id': upload_id,
                'extracted_text': extracted.model_dump(),
                'toc': [t.model_dump() for t in toc_result.toc_items],
                'chapters': [c.model_dump() for c in chapters],
                'detected_title': toc_result.detected_title,
                'detected_author': toc_result.detected_author,
            }

            # Store result for retrieval
            status_store[upload_id]['result'] = result

            self._log_step(
                status_store, upload_id,
                ProcessingStep.DB_SAVE,
                StepStatus.COMPLETED,
                "Ready for database save"
            )

            # Complete
            self._update_status(status_store, upload_id, ProcessingStatus.COMPLETED, 100)
            logger.info(f"Processing completed for upload {upload_id}")

        except Exception as e:
            logger.error(f"Processing failed for {upload_id}: {e}")
            status_store[upload_id]['status'] = ProcessingStatus.FAILED
            status_store[upload_id]['error_message'] = str(e)
            self._log_step(
                status_store, upload_id,
                status_store[upload_id].get('current_step', ProcessingStep.UPLOAD),
                StepStatus.FAILED,
                str(e)
            )

    def _update_status(
        self,
        store: Dict,
        upload_id: str,
        status: ProcessingStatus,
        progress: int
    ):
        """Update processing status."""
        store[upload_id]['status'] = status
        store[upload_id]['progress'] = progress
        store[upload_id]['current_step'] = self._status_to_step(status)

    def _status_to_step(self, status: ProcessingStatus) -> Optional[ProcessingStep]:
        """Convert status to current step."""
        mapping = {
            ProcessingStatus.EXTRACTING_TEXT: ProcessingStep.TEXT_EXTRACTION,
            ProcessingStatus.DETECTING_TOC: ProcessingStep.TOC_DETECTION,
            ProcessingStatus.PARSING_STRUCTURE: ProcessingStep.AI_PARSING,
            ProcessingStatus.SPLITTING_CONTENT: ProcessingStep.CONTENT_SPLITTING,
            ProcessingStatus.SAVING_TO_DB: ProcessingStep.DB_SAVE,
        }
        return mapping.get(status)

    def _log_step(
        self,
        store: Dict,
        upload_id: str,
        step: ProcessingStep,
        status: StepStatus,
        message: str = "",
        duration: Optional[int] = None
    ):
        """Add a log entry for a processing step."""
        log_entry = {
            'step': step,
            'status': status,
            'message': message,
            'duration': duration,
            'created_at': time.time()
        }
        store[upload_id]['logs'].append(log_entry)


def get_file_hash(file_path: str) -> str:
    """Calculate SHA256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()
