/**
 * Python Service Client
 * Handles communication between Next.js and the Python document processing service.
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// ============================================
// TYPES
// ============================================

export type DocumentType = 'PDF' | 'DOCX';

export type ProcessingStatus =
  | 'PENDING'
  | 'UPLOADING'
  | 'EXTRACTING_TEXT'
  | 'DETECTING_TOC'
  | 'PARSING_STRUCTURE'
  | 'SPLITTING_CONTENT'
  | 'SAVING_TO_DB'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type ProcessingStep =
  | 'UPLOAD'
  | 'TEXT_EXTRACTION'
  | 'OCR'
  | 'TOC_DETECTION'
  | 'AI_PARSING'
  | 'CONTENT_SPLITTING'
  | 'DB_SAVE';

export interface ProcessingOptions {
  useOcr?: boolean;
  useAiParsing?: boolean;
  aiProvider?: 'local' | 'claude' | 'openai';
  ocrProvider?: 'easyocr' | 'tesseract' | 'google';
}

export interface ProcessingLog {
  step: ProcessingStep;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  message: string;
  duration?: number;
  createdAt: number;
}

export interface ProcessingStatusResponse {
  uploadId: string;
  status: ProcessingStatus;
  progress: number;
  currentStep?: ProcessingStep;
  logs: ProcessingLog[];
  detectedTitle?: string;
  detectedAuthor?: string;
  pageCount?: number;
  errorMessage?: string;
  result?: ProcessingResult;
}

export interface TocItem {
  id?: string;
  title: string;
  pageNumber?: number;
  level: number;
  order: number;
  parentId?: string;
  children?: TocItem[];
}

export interface ChapterContent {
  title: string;
  order: number;
  sections: SectionContent[];
  content?: string;
}

export interface SectionContent {
  title: string;
  content: string;
  order: number;
  pageCount?: number;
}

export interface ProcessingResult {
  uploadId: string;
  extractedText: {
    text: string;
    pages: PageContent[];
    totalPages: number;
    isScanned: boolean;
    extractionMethod: string;
  };
  toc: TocItem[];
  chapters: ChapterContent[];
  detectedTitle?: string;
  detectedAuthor?: string;
}

export interface PageContent {
  pageNumber: number;
  text: string;
  confidence?: number;
  isOcr: boolean;
}

export interface AiProvider {
  name: string;
  available: boolean;
  model: string;
  cost: string;
}

// ============================================
// PYTHON SERVICE CLIENT
// ============================================

class PythonServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = PYTHON_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if Python service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Start processing a document
   */
  async processDocument(
    uploadId: string,
    filePath: string,
    options: ProcessingOptions = {}
  ): Promise<{ uploadId: string; status: ProcessingStatus; message: string }> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_id: uploadId,
        file_path: filePath,
        options: {
          use_ocr: options.useOcr ?? false,
          use_ai_parsing: options.useAiParsing ?? true,
          ai_provider: options.aiProvider ?? 'local',
          ocr_provider: options.ocrProvider ?? 'easyocr',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start processing');
    }

    return response.json();
  }

  /**
   * Get processing status
   */
  async getStatus(uploadId: string): Promise<ProcessingStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status/${uploadId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Upload not found');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get status');
    }

    const data = await response.json();
    return {
      uploadId: data.upload_id,
      status: data.status,
      progress: data.progress,
      currentStep: data.current_step,
      logs: data.logs,
      detectedTitle: data.detected_title,
      detectedAuthor: data.detected_author,
      pageCount: data.page_count,
      errorMessage: data.error_message,
      result: data.result,
    };
  }

  /**
   * Extract text from a file
   */
  async extractText(
    filePath: string,
    useOcr: boolean = false,
    ocrProvider: string = 'easyocr'
  ): Promise<{
    text: string;
    pages: PageContent[];
    totalPages: number;
    isScanned: boolean;
    extractionMethod: string;
  }> {
    const response = await fetch(`${this.baseUrl}/extract-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_path: filePath,
        use_ocr: useOcr,
        ocr_provider: ocrProvider,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to extract text');
    }

    return response.json();
  }

  /**
   * Detect table of contents
   */
  async detectToc(
    text: string,
    aiProvider: string = 'local',
    pages?: PageContent[]
  ): Promise<{
    tocItems: TocItem[];
    detectedTitle?: string;
    detectedAuthor?: string;
    confidence: number;
    provider: string;
  }> {
    const response = await fetch(`${this.baseUrl}/detect-toc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        ai_provider: aiProvider,
        pages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to detect TOC');
    }

    const data = await response.json();
    return {
      tocItems: data.toc_items,
      detectedTitle: data.detected_title,
      detectedAuthor: data.detected_author,
      confidence: data.confidence,
      provider: data.provider,
    };
  }

  /**
   * Split content by TOC
   */
  async splitContent(
    pages: PageContent[],
    tocItems: TocItem[]
  ): Promise<ChapterContent[]> {
    const response = await fetch(`${this.baseUrl}/split-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pages,
        toc_items: tocItems,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to split content');
    }

    const data = await response.json();
    return data.chapters;
  }

  /**
   * Get available AI providers
   */
  async getAiProviders(): Promise<{
    providers: Record<string, AiProvider>;
    default: string;
  }> {
    const response = await fetch(`${this.baseUrl}/ai/providers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to get AI providers');
    }

    return response.json();
  }

  /**
   * Test an AI provider
   */
  async testAiProvider(provider: string): Promise<{
    provider: string;
    success: boolean;
    response?: string;
    error?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/ai/test/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.json();
  }

  /**
   * Clear processing status
   */
  async clearStatus(uploadId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/status/${uploadId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to clear status');
    }
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    activeProcesses: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    const data = await response.json();
    return {
      activeProcesses: data.active_processes,
      completed: data.completed,
      failed: data.failed,
      total: data.total,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const pythonService = new PythonServiceClient();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Poll for processing status until complete or failed
 */
export async function pollProcessingStatus(
  uploadId: string,
  onUpdate: (status: ProcessingStatusResponse) => void,
  intervalMs: number = 1000,
  maxAttempts: number = 600 // 10 minutes max
): Promise<ProcessingStatusResponse> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await pythonService.getStatus(uploadId);
        onUpdate(status);

        if (status.status === 'COMPLETED') {
          resolve(status);
          return;
        }

        if (status.status === 'FAILED' || status.status === 'CANCELLED') {
          reject(new Error(status.errorMessage || 'Processing failed'));
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Processing timeout'));
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Get human-readable status message in Arabic
 */
export function getStatusMessage(status: ProcessingStatus): string {
  const messages: Record<ProcessingStatus, string> = {
    PENDING: 'في الانتظار...',
    UPLOADING: 'جاري رفع الملف...',
    EXTRACTING_TEXT: 'جاري استخراج النص...',
    DETECTING_TOC: 'جاري كشف الفهرس...',
    PARSING_STRUCTURE: 'جاري تحليل البنية...',
    SPLITTING_CONTENT: 'جاري تقسيم المحتوى...',
    SAVING_TO_DB: 'جاري الحفظ في قاعدة البيانات...',
    COMPLETED: 'اكتملت المعالجة',
    FAILED: 'فشلت المعالجة',
    CANCELLED: 'تم إلغاء المعالجة',
  };

  return messages[status] || status;
}

/**
 * Get step display name in Arabic
 */
export function getStepName(step: ProcessingStep): string {
  const names: Record<ProcessingStep, string> = {
    UPLOAD: 'رفع الملف',
    TEXT_EXTRACTION: 'استخراج النص',
    OCR: 'التعرف على النص (OCR)',
    TOC_DETECTION: 'كشف الفهرس',
    AI_PARSING: 'تحليل بالذكاء الاصطناعي',
    CONTENT_SPLITTING: 'تقسيم المحتوى',
    DB_SAVE: 'حفظ في قاعدة البيانات',
  };

  return names[step] || step;
}
