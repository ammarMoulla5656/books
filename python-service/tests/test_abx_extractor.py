"""
Tests for ABX Extractor
"""

import pytest
import json
import zipfile
import tempfile
from pathlib import Path
from services.text_extractor.abx_extractor import ABXExtractor


@pytest.fixture
def abx_extractor():
    """Create ABX extractor instance."""
    return ABXExtractor()


@pytest.fixture
def temp_abx_zip():
    """Create a temporary ABX ZIP file for testing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        abx_path = Path(temp_dir) / "test_book.abx"

        with zipfile.ZipFile(abx_path, 'w') as zf:
            # Add metadata
            metadata = {
                "title": "كتاب الاختبار",
                "author": "محمد علي",
                "year": 2024
            }
            zf.writestr('metadata.json', json.dumps(metadata, ensure_ascii=False))

            # Add chapters
            zf.writestr('chapters/01_intro.txt', "مقدمة الكتاب\n\nهذا نص تجريبي لفصل المقدمة")
            zf.writestr('chapters/02_chapter1.txt', "الفصل الأول\n\nمحتوى الفصل الأول من الكتاب")
            zf.writestr('chapters/03_chapter2.txt', "الفصل الثاني\n\nمحتوى الفصل الثاني من الكتاب")

        yield abx_path


@pytest.fixture
def temp_abx_text():
    """Create a temporary ABX text file for testing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        abx_path = Path(temp_dir) / "test_book.abx"

        content = """---
{
  "title": "كتاب نصي",
  "author": "أحمد محمد",
  "year": 2024
}
---

# الفصل الأول

هذا محتوى الفصل الأول من الكتاب النصي.

# الفصل الثاني

هذا محتوى الفصل الثاني من الكتاب النصي.
"""

        with open(abx_path, 'w', encoding='utf-8') as f:
            f.write(content)

        yield abx_path


@pytest.mark.asyncio
async def test_extract_zip_abx(abx_extractor, temp_abx_zip):
    """Test extracting text from ZIP-based ABX file."""
    result = await abx_extractor.extract(str(temp_abx_zip))

    assert result is not None
    assert result.total_pages == 3  # 3 chapters
    assert len(result.pages) == 3
    assert "مقدمة الكتاب" in result.text
    assert result.extraction_method == "abx_zip"
    assert result.is_scanned is False


@pytest.mark.asyncio
async def test_extract_text_abx(abx_extractor, temp_abx_text):
    """Test extracting text from plain text ABX file."""
    result = await abx_extractor.extract(str(temp_abx_text))

    assert result is not None
    assert result.total_pages > 0
    assert "الفصل الأول" in result.text
    assert result.extraction_method == "abx_text"
    assert result.is_scanned is False


@pytest.mark.asyncio
async def test_extract_nonexistent_file(abx_extractor):
    """Test extraction of non-existent file."""
    with pytest.raises(FileNotFoundError):
        await abx_extractor.extract("/nonexistent/path/file.abx")


@pytest.mark.asyncio
async def test_split_pages(abx_extractor):
    """Test page splitting functionality."""
    text = "line1\nline2\nline3\n" * 100  # Create 300 lines

    pages = abx_extractor._split_into_pages(text, lines_per_page=50)

    assert len(pages) == 6  # 300 lines / 50 lines per page = 6 pages
    assert all(page.page_number == i + 1 for i, page in enumerate(pages))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
