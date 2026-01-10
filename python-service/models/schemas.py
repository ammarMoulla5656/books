"""
Pydantic Schemas for Document Processing Service
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ============================================
# ENUMS
# ============================================

class DocumentType(str, Enum):
    PDF = "PDF"
    DOCX = "DOCX"
    ABX = "ABX"


class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    UPLOADING = "UPLOADING"
    EXTRACTING_TEXT = "EXTRACTING_TEXT"
    DETECTING_TOC = "DETECTING_TOC"
    PARSING_STRUCTURE = "PARSING_STRUCTURE"
    SPLITTING_CONTENT = "SPLITTING_CONTENT"
    SAVING_TO_DB = "SAVING_TO_DB"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class ProcessingStep(str, Enum):
    UPLOAD = "UPLOAD"
    TEXT_EXTRACTION = "TEXT_EXTRACTION"
    OCR = "OCR"
    TOC_DETECTION = "TOC_DETECTION"
    AI_PARSING = "AI_PARSING"
    CONTENT_SPLITTING = "CONTENT_SPLITTING"
    DB_SAVE = "DB_SAVE"


class StepStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


# ============================================
# REQUEST SCHEMAS
# ============================================

class ProcessingOptions(BaseModel):
    """Options for document processing."""
    use_ocr: bool = Field(default=False, description="Force OCR even for text PDFs")
    use_ai_parsing: bool = Field(default=True, description="Use AI for TOC parsing")
    ai_provider: str = Field(default="local", description="AI provider: local, claude, openai")
    ocr_provider: str = Field(default="easyocr", description="OCR provider: easyocr, tesseract, google")


class ProcessRequest(BaseModel):
    """Request to process a document."""
    upload_id: str
    file_path: str
    options: ProcessingOptions = Field(default_factory=ProcessingOptions)


class ExtractTextRequest(BaseModel):
    """Request to extract text from a file."""
    file_path: str
    use_ocr: bool = False
    ocr_provider: str = "easyocr"


class DetectTocRequest(BaseModel):
    """Request to detect table of contents."""
    text: str
    ai_provider: str = "local"
    pages: Optional[List[Dict[str, Any]]] = None


class SplitContentRequest(BaseModel):
    """Request to split content by TOC."""
    pages: List[Dict[str, Any]]
    toc_items: List[Dict[str, Any]]


# ============================================
# RESPONSE SCHEMAS
# ============================================

class DocumentUploadResponse(BaseModel):
    """Response after uploading a document."""
    upload_id: str
    status: ProcessingStatus
    message: str = "Upload successful"


class ProcessingLog(BaseModel):
    """Log entry for processing step."""
    step: ProcessingStep
    status: StepStatus
    message: str
    duration: Optional[int] = None  # milliseconds
    created_at: datetime = Field(default_factory=datetime.now)


class ProcessingStatusResponse(BaseModel):
    """Response for processing status."""
    upload_id: str
    status: ProcessingStatus
    progress: int = Field(ge=0, le=100)
    current_step: Optional[ProcessingStep] = None
    logs: List[ProcessingLog] = []
    detected_title: Optional[str] = None
    detected_author: Optional[str] = None
    page_count: Optional[int] = None
    error_message: Optional[str] = None


# ============================================
# DATA SCHEMAS
# ============================================

class PageContent(BaseModel):
    """Content of a single page."""
    page_number: int
    text: str
    confidence: Optional[float] = None  # OCR confidence
    is_ocr: bool = False


class ExtractedText(BaseModel):
    """Result of text extraction."""
    text: str
    pages: List[PageContent]
    total_pages: int
    is_scanned: bool = False
    extraction_method: str  # pymupdf, pdfplumber, ocr


class TocItem(BaseModel):
    """Table of Contents item."""
    id: Optional[str] = None
    title: str
    page_number: Optional[int] = None
    level: int = 1  # 1=chapter, 2=section, 3=subsection
    order: int
    parent_id: Optional[str] = None
    children: List["TocItem"] = []
    content_start_page: Optional[int] = None
    content_end_page: Optional[int] = None


class SectionContent(BaseModel):
    """Content for a section."""
    title: str
    content: str
    order: int
    page_count: Optional[int] = None


class ChapterContent(BaseModel):
    """Content for a chapter."""
    title: str
    order: int
    sections: List[SectionContent] = []
    content: Optional[str] = None  # If no sections, chapter has direct content


class BookStructure(BaseModel):
    """Complete book structure."""
    title: str
    author: Optional[str] = None
    chapters: List[ChapterContent]
    total_pages: int
    toc: List[TocItem]


# ============================================
# AI RESPONSE SCHEMAS
# ============================================

class AiTocParseResult(BaseModel):
    """Result from AI TOC parsing."""
    toc_items: List[TocItem]
    detected_title: Optional[str] = None
    detected_author: Optional[str] = None
    confidence: float = 0.0
    provider: str


# Update forward references
TocItem.model_rebuild()
