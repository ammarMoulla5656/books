"""
Document Processing Service - FastAPI Application
Converts PDF/DOCX books to structured content with AI-powered TOC detection.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from typing import Optional
import json

from config import settings
from models import (
    ProcessingOptions,
    ProcessRequest,
    ExtractTextRequest,
    DetectTocRequest,
    SplitContentRequest,
    DocumentUploadResponse,
    ProcessingStatusResponse,
    ProcessingStatus,
    ProcessingStep,
    StepStatus,
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# In-memory storage for processing status (in production, use Redis or database)
processing_status: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"Default AI provider: {settings.DEFAULT_AI_PROVIDER}")
    yield
    # Shutdown
    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered document processing service for converting PDF/DOCX books to structured content",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", settings.NEXTJS_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Check service health."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "process": "POST /process",
            "status": "GET /status/{upload_id}",
            "extract_text": "POST /extract-text",
            "detect_toc": "POST /detect-toc",
            "split_content": "POST /split-content",
        }
    }


# ============================================
# DOCUMENT PROCESSING ENDPOINTS
# ============================================

@app.post("/process", response_model=DocumentUploadResponse)
async def process_document(
    request: ProcessRequest,
    background_tasks: BackgroundTasks
):
    """
    Start processing a document.
    This runs in the background and updates status as it progresses.
    """
    from services.document_processor import DocumentProcessor

    upload_id = request.upload_id

    # Initialize status
    processing_status[upload_id] = {
        "status": ProcessingStatus.PENDING,
        "progress": 0,
        "current_step": None,
        "logs": [],
        "detected_title": None,
        "detected_author": None,
        "page_count": None,
        "error_message": None,
    }

    # Start background processing
    processor = DocumentProcessor()
    background_tasks.add_task(
        processor.process,
        upload_id,
        request.file_path,
        request.options,
        processing_status
    )

    return DocumentUploadResponse(
        upload_id=upload_id,
        status=ProcessingStatus.PENDING,
        message="Processing started"
    )


@app.get("/status/{upload_id}", response_model=ProcessingStatusResponse)
async def get_processing_status(upload_id: str):
    """Get the current processing status for a document."""
    if upload_id not in processing_status:
        raise HTTPException(status_code=404, detail="Upload not found")

    status_data = processing_status[upload_id]
    return ProcessingStatusResponse(
        upload_id=upload_id,
        **status_data
    )


@app.post("/extract-text")
async def extract_text(request: ExtractTextRequest):
    """
    Extract text from a PDF or DOCX file.
    Returns the extracted text and metadata.
    """
    from services.text_extractor import TextExtractor

    try:
        extractor = TextExtractor()
        result = await extractor.extract(
            request.file_path,
            use_ocr=request.use_ocr,
            ocr_provider=request.ocr_provider
        )
        return result.model_dump()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-toc")
async def detect_toc(request: DetectTocRequest):
    """
    Detect table of contents from text.
    Uses pattern matching and AI for best results.
    """
    from services.toc_detector import TocDetector

    try:
        detector = TocDetector(ai_provider=request.ai_provider)
        result = await detector.detect(request.text, request.pages)
        return result.model_dump()
    except Exception as e:
        logger.error(f"TOC detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/split-content")
async def split_content(request: SplitContentRequest):
    """
    Split document content based on detected TOC.
    Returns structured chapters and sections.
    """
    from services.content_splitter import ContentSplitter

    try:
        splitter = ContentSplitter()
        result = await splitter.split(request.pages, request.toc_items)
        return {"chapters": [ch.model_dump() for ch in result]}
    except Exception as e:
        logger.error(f"Content splitting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# AI PROVIDER ENDPOINTS
# ============================================

@app.get("/ai/providers")
async def get_ai_providers():
    """Get available AI providers and their status."""
    providers = {
        "local": {
            "name": "Ollama (Local)",
            "available": True,  # Will be checked dynamically
            "model": settings.OLLAMA_MODEL,
            "cost": "Free"
        },
        "claude": {
            "name": "Claude (Anthropic)",
            "available": bool(settings.ANTHROPIC_API_KEY),
            "model": settings.CLAUDE_MODEL,
            "cost": "~$0.50/book"
        },
        "openai": {
            "name": "OpenAI GPT",
            "available": bool(settings.OPENAI_API_KEY),
            "model": settings.OPENAI_MODEL,
            "cost": "~$1.00/book"
        }
    }

    # Check Ollama availability
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.OLLAMA_HOST}/api/tags", timeout=2.0)
            providers["local"]["available"] = response.status_code == 200
    except Exception:
        providers["local"]["available"] = False

    return {"providers": providers, "default": settings.DEFAULT_AI_PROVIDER}


@app.post("/ai/test/{provider}")
async def test_ai_provider(provider: str):
    """Test an AI provider with a simple prompt."""
    from services.ai import get_ai_client

    try:
        client = get_ai_client(provider)
        response = await client.generate("Say 'Hello' in Arabic.")
        return {
            "provider": provider,
            "success": True,
            "response": response
        }
    except Exception as e:
        return {
            "provider": provider,
            "success": False,
            "error": str(e)
        }


# ============================================
# UTILITY ENDPOINTS
# ============================================

@app.delete("/status/{upload_id}")
async def clear_status(upload_id: str):
    """Clear processing status for an upload."""
    if upload_id in processing_status:
        del processing_status[upload_id]
        return {"message": "Status cleared"}
    raise HTTPException(status_code=404, detail="Upload not found")


@app.get("/stats")
async def get_stats():
    """Get service statistics."""
    return {
        "active_processes": len([s for s in processing_status.values()
                                 if s["status"] not in [ProcessingStatus.COMPLETED, ProcessingStatus.FAILED]]),
        "completed": len([s for s in processing_status.values()
                          if s["status"] == ProcessingStatus.COMPLETED]),
        "failed": len([s for s in processing_status.values()
                       if s["status"] == ProcessingStatus.FAILED]),
        "total": len(processing_status)
    }


# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
