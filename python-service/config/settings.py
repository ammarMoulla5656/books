"""
Application Settings
Centralized configuration management for the document processing service.
"""

from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ============================================
    # APPLICATION
    # ============================================
    APP_NAME: str = "Document Processing Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ============================================
    # SERVER
    # ============================================
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ============================================
    # PATHS
    # ============================================
    BASE_DIR: Path = Path(__file__).parent.parent
    UPLOAD_DIR: Path = Path(__file__).parent.parent.parent / "uploads" / "documents"
    TEMP_DIR: Path = Path(__file__).parent.parent / "temp"

    # ============================================
    # DATABASE (Same as Next.js)
    # ============================================
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/islamic_library"

    # ============================================
    # AI PROVIDERS
    # ============================================
    # Default AI provider: local, claude, openai
    DEFAULT_AI_PROVIDER: str = "local"

    # Ollama (Local AI)
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"

    # Claude API
    ANTHROPIC_API_KEY: Optional[str] = None
    CLAUDE_MODEL: str = "claude-3-haiku-20240307"

    # OpenAI API
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Google Cloud Vision (OCR)
    GOOGLE_CLOUD_KEY: Optional[str] = None

    # ============================================
    # OCR SETTINGS
    # ============================================
    # Tesseract path (Windows)
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    # EasyOCR settings
    EASYOCR_LANGUAGES: list = ["ar", "en"]
    EASYOCR_GPU: bool = False  # Set to True if GPU available

    # ============================================
    # PROCESSING SETTINGS
    # ============================================
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx"]

    # OCR confidence threshold (0-1)
    OCR_CONFIDENCE_THRESHOLD: float = 0.5

    # Text extraction settings
    MIN_TEXT_LENGTH_FOR_OCR: int = 100  # Minimum characters to consider PDF as text-based

    # TOC detection settings
    TOC_MAX_PAGES_TO_SCAN: int = 20  # First N pages to scan for TOC

    # ============================================
    # NEXT.JS SERVICE
    # ============================================
    NEXTJS_URL: str = "http://localhost:3000"
    NEXTJS_API_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


# Ensure directories exist
def ensure_directories():
    """Create necessary directories if they don't exist."""
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)


ensure_directories()
