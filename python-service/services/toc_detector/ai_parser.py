"""
AI TOC Parser
Uses LLMs (Ollama, Claude, OpenAI) to understand and parse complex table of contents.
"""

import json
import logging
from typing import List, Optional
import re

from models import TocItem, AiTocParseResult
from config import settings

logger = logging.getLogger(__name__)


# ============================================
# PROMPTS
# ============================================

TOC_EXTRACTION_PROMPT = """أنت مساعد متخصص في تحليل الكتب العربية والإسلامية. مهمتك هي استخراج فهرس المحتويات من النص التالي.

المطلوب:
1. استخرج جميع عناوين الفصول والأقسام
2. حدد رقم الصفحة لكل عنوان (إن وجد)
3. حدد مستوى كل عنوان:
   - المستوى 1: الأقسام الرئيسية (كتاب، باب، جزء، مقصد)
   - المستوى 2: الفصول (فصل، مبحث)
   - المستوى 3: الأقسام الفرعية (مسألة، مطلب، فرع)

أعد النتيجة بتنسيق JSON كالتالي:
{
  "title": "عنوان الكتاب إن وجد",
  "author": "اسم المؤلف إن وجد",
  "toc": [
    {"title": "عنوان القسم", "page": رقم_الصفحة_أو_null, "level": رقم_المستوى},
    ...
  ]
}

النص:
---
{text}
---

أعد فقط JSON بدون أي شرح إضافي."""


STRUCTURE_ANALYSIS_PROMPT = """حلل بنية الكتاب التالي واستخرج الفهرس:

{text}

أعد JSON بالتنسيق:
{{"toc": [{{"title": "...", "page": null, "level": 1}}, ...]}}"""


class AiTocParser:
    """
    Parse table of contents using AI language models.
    """

    def __init__(self, provider: str = "local"):
        """
        Initialize AI parser.

        Args:
            provider: AI provider (local, claude, openai)
        """
        self.provider = provider

    async def parse(self, text: str, pages: Optional[List[dict]] = None) -> AiTocParseResult:
        """
        Parse TOC from text using AI.

        Args:
            text: Document text (or TOC section)
            pages: Optional list of page contents for context

        Returns:
            AiTocParseResult with parsed TOC
        """
        # Truncate text if too long
        max_chars = 10000 if self.provider == "local" else 50000
        if len(text) > max_chars:
            text = text[:max_chars]

        logger.info(f"Parsing TOC with AI provider: {self.provider}")

        try:
            if self.provider == "local":
                response = await self._parse_with_ollama(text)
            elif self.provider == "claude":
                response = await self._parse_with_claude(text)
            elif self.provider == "openai":
                response = await self._parse_with_openai(text)
            else:
                logger.warning(f"Unknown provider {self.provider}, falling back to local")
                response = await self._parse_with_ollama(text)

            # Parse response
            result = self._parse_response(response)
            result.provider = self.provider

            return result

        except Exception as e:
            logger.error(f"AI parsing failed: {e}")
            return AiTocParseResult(
                toc_items=[],
                confidence=0.0,
                provider=self.provider
            )

    async def _parse_with_ollama(self, text: str) -> str:
        """Parse using Ollama (local LLM)."""
        try:
            import ollama

            prompt = TOC_EXTRACTION_PROMPT.format(text=text)

            response = ollama.generate(
                model=settings.OLLAMA_MODEL,
                prompt=prompt,
                options={
                    "temperature": 0.1,
                    "num_predict": 4000,
                }
            )

            return response['response']

        except Exception as e:
            logger.error(f"Ollama error: {e}")
            raise

    async def _parse_with_claude(self, text: str) -> str:
        """Parse using Claude API."""
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("Anthropic API key not configured")

        try:
            import anthropic

            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

            prompt = TOC_EXTRACTION_PROMPT.format(text=text)

            message = client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return message.content[0].text

        except Exception as e:
            logger.error(f"Claude API error: {e}")
            raise

    async def _parse_with_openai(self, text: str) -> str:
        """Parse using OpenAI API."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")

        try:
            import openai

            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

            prompt = TOC_EXTRACTION_PROMPT.format(text=text)

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "أنت مساعد متخصص في تحليل الكتب العربية. أجب بتنسيق JSON فقط."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=4000,
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    def _parse_response(self, response: str) -> AiTocParseResult:
        """Parse AI response into structured result."""

        # Clean response - extract JSON
        response = response.strip()

        # Try to find JSON in response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            response = json_match.group()

        try:
            data = json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.debug(f"Response was: {response[:500]}")
            return AiTocParseResult(
                toc_items=[],
                confidence=0.0,
                provider=self.provider
            )

        # Extract TOC items
        toc_items = []
        raw_toc = data.get('toc', [])

        for i, item in enumerate(raw_toc):
            if isinstance(item, dict):
                toc_items.append(TocItem(
                    title=item.get('title', ''),
                    page_number=item.get('page'),
                    level=item.get('level', 2),
                    order=i + 1
                ))

        # Build hierarchy
        toc_items = self._build_hierarchy(toc_items)

        return AiTocParseResult(
            toc_items=toc_items,
            detected_title=data.get('title'),
            detected_author=data.get('author'),
            confidence=0.8 if toc_items else 0.0,
            provider=self.provider
        )

    def _build_hierarchy(self, items: List[TocItem]) -> List[TocItem]:
        """Build parent-child relationships."""
        if not items:
            return items

        level_stack = {}

        for item in items:
            level = item.level

            # Find parent
            parent_level = level - 1
            while parent_level >= 1:
                if parent_level in level_stack:
                    parent = level_stack[parent_level]
                    item.parent_id = parent.id
                    parent.children.append(item)
                    break
                parent_level -= 1

            level_stack[level] = item

            for l in list(level_stack.keys()):
                if l > level:
                    del level_stack[l]

        return [item for item in items if item.parent_id is None]


# ============================================
# AI CLIENT FACTORY
# ============================================

class AiClient:
    """Simple AI client for testing and general queries."""

    def __init__(self, provider: str):
        self.provider = provider

    async def generate(self, prompt: str) -> str:
        """Generate response from AI."""
        if self.provider == "local":
            return await self._generate_ollama(prompt)
        elif self.provider == "claude":
            return await self._generate_claude(prompt)
        elif self.provider == "openai":
            return await self._generate_openai(prompt)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    async def _generate_ollama(self, prompt: str) -> str:
        import ollama
        response = ollama.generate(
            model=settings.OLLAMA_MODEL,
            prompt=prompt
        )
        return response['response']

    async def _generate_claude(self, prompt: str) -> str:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text

    async def _generate_openai(self, prompt: str) -> str:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content


def get_ai_client(provider: str) -> AiClient:
    """Get AI client for the specified provider."""
    return AiClient(provider)
