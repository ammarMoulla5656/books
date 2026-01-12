'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingOptions {
  useOcr: boolean;
  useAiParsing: boolean;
  aiProvider: 'local' | 'claude' | 'openai';
}

export default function DocumentUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<ProcessingOptions>({
    useOcr: false,
    useAiParsing: true,
    aiProvider: 'local',
  });

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  // Validate file
  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-abx',
    ];

    const allowedExtensions = ['.pdf', '.docx', '.abx'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    const isValidType = allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      setError('نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو DOCX أو ABX.');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      setError('حجم الملف كبير جداً. الحد الأقصى هو 100 ميجابايت.');
      return;
    }

    setFile(selectedFile);

    // Auto-disable AI processing for ABX files
    if (fileExtension === '.abx') {
      setOptions({
        useOcr: false,
        useAiParsing: false,
        aiProvider: 'local',
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      // Check if ABX file - use direct upload endpoint
      const isABX = file.name.endsWith('.abx');
      const endpoint = isABX ? '/api/admin/books/abx' : '/api/admin/documents';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل رفع الملف');
      }

      if (isABX) {
        // For ABX files, show success and redirect to books list
        alert(`✅ تم رفع الكتاب بنجاح!\n\nالعنوان: ${data.book.title}\nالمؤلف: ${data.book.author}\nالصفحات: ${data.book.pages}`);
        router.push('/secret-admin-panel-xyz/books');
      } else {
        // For PDF/DOCX, redirect to progress page
        router.push(`/secret-admin-panel-xyz/books/upload/${data.uploadId}/progress`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الرفع');
      setIsUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.abx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center
            ${file ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {file ? (
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Text */}
          {file ? (
            <div>
              <p className="text-lg font-medium text-emerald-600">{file.name}</p>
              <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                اسحب الملف هنا أو اضغط للاختيار
              </p>
              <p className="text-sm text-gray-500 mt-2">
                يدعم: PDF, DOCX, ABX | الحد الأقصى: 100MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ABX File Notice */}
      {file && file.name.endsWith('.abx') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 arabic-text">
                ملف ABX - رفع مباشر
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 arabic-text">
                سيتم رفع هذا الملف مباشرة بدون معالجة AI لأنه بتنسيق جاهز ومنسق مسبقاً
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Options - Only show for non-ABX files */}
      {file && !file.name.endsWith('.abx') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            خيارات المعالجة
          </h3>

          <div className="space-y-4">
            {/* OCR Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.useOcr}
                onChange={(e) => setOptions({ ...options, useOcr: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  استخدام OCR للصفحات المصورة
                </span>
                <p className="text-sm text-gray-500">
                  تفعيل هذا الخيار إذا كان الكتاب عبارة عن صور
                </p>
              </div>
            </label>

            {/* AI Parsing Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.useAiParsing}
                onChange={(e) => setOptions({ ...options, useAiParsing: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  استخدام الذكاء الاصطناعي لفهم البنية
                </span>
                <p className="text-sm text-gray-500">
                  يساعد في كشف الفهرس وتقسيم المحتوى بدقة أعلى
                </p>
              </div>
            </label>

            {/* AI Provider Selection */}
            {options.useAiParsing && (
              <div className="mr-8 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  مزود الذكاء الاصطناعي:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="local"
                      checked={options.aiProvider === 'local'}
                      onChange={() => setOptions({ ...options, aiProvider: 'local' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">محلي (Ollama) - مجاني</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="claude"
                      checked={options.aiProvider === 'claude'}
                      onChange={() => setOptions({ ...options, aiProvider: 'claude' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">Claude API - دقة أعلى</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="openai"
                      checked={options.aiProvider === 'openai'}
                      onChange={() => setOptions({ ...options, aiProvider: 'openai' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">OpenAI GPT-4</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-200
          ${file && !isUploading
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            جاري الرفع...
          </span>
        ) : (
          'بدء الرفع والمعالجة'
        )}
      </button>
    </div>
  );
}
