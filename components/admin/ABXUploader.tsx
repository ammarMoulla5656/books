'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

/**
 * مكون رفع ملفات ABX مع السحب والإفلات
 * مشابه لمكتبة أهل البيت
 */

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  progress?: number;
}

export default function ABXUploader() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
  });

  // معالجة السحب
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // تأكد من أننا خرجنا من منطقة الإفلات بالكامل
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // معالجة الإفلات
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const abxFile = files.find(f => f.name.toLowerCase().endsWith('.abx'));

    if (abxFile) {
      setSelectedFile(abxFile);
      setUploadStatus({
        status: 'idle',
        message: '',
      });
    } else {
      setUploadStatus({
        status: 'error',
        message: 'يرجى اختيار ملف ABX فقط',
      });
    }
  }, []);

  // معالجة اختيار الملف
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.abx')) {
        setSelectedFile(file);
        setUploadStatus({
          status: 'idle',
          message: '',
        });
      } else {
        setUploadStatus({
          status: 'error',
          message: 'يرجى اختيار ملف ABX فقط',
        });
      }
    }
  };

  // إلغاء الملف المحدد
  const handleCancelFile = () => {
    setSelectedFile(null);
    setUploadStatus({
      status: 'idle',
      message: '',
    });
  };

  // رفع الملف
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus({
        status: 'uploading',
        message: 'جاري رفع الملف...',
        progress: 0,
      });

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/books/abx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل رفع الملف');
      }

      setUploadStatus({
        status: 'processing',
        message: 'جاري معالجة الكتاب...',
        progress: 50,
      });

      const result = await response.json();

      setUploadStatus({
        status: 'success',
        message: 'تم رفع الكتاب بنجاح!',
        progress: 100,
      });

      // إعادة التوجيه بعد ثانيتين
      setTimeout(() => {
        router.push(`/books/${result.book.id}`);
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء الرفع',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d7377] to-[#14a38b] p-6 text-white">
          <h2 className="text-2xl font-bold font-arabic mb-2">رفع كتاب ABX</h2>
          <p className="text-sm opacity-90 font-arabic">
            قم بسحب ملف ABX وإفلاته هنا أو اضغط لاختيار الملف
          </p>
        </div>

        {/* Drop Zone */}
        <div className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center
              transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-[#0d7377] bg-[#0d7377]/5 scale-[1.02]'
                : 'border-gray-300 hover:border-[#0d7377] hover:bg-gray-50'
              }
              ${selectedFile ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <input
              type="file"
              accept=".abx"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
            />

            {!selectedFile ? (
              <div className="flex flex-col items-center gap-4">
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${isDragging ? 'bg-[#0d7377] scale-110' : 'bg-gray-100'}
                `}>
                  <FiUpload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-700 font-arabic mb-1">
                    {isDragging ? 'أفلت الملف هنا' : 'اسحب ملف ABX وأفلته هنا'}
                  </p>
                  <p className="text-sm text-gray-500 font-arabic">
                    أو اضغط لاختيار ملف من جهازك
                  </p>
                </div>

                <div className="mt-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 font-arabic">
                    الملفات المدعومة: .abx فقط
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <FiFile className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 font-arabic">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 font-arabic">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCancelFile}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
                >
                  <FiX className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {uploadStatus.message && (
            <div className={`
              mt-4 p-4 rounded-lg flex items-start gap-3
              ${uploadStatus.status === 'error' ? 'bg-red-50 border border-red-200' : ''}
              ${uploadStatus.status === 'success' ? 'bg-green-50 border border-green-200' : ''}
              ${uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? 'bg-blue-50 border border-blue-200' : ''}
            `}>
              {uploadStatus.status === 'error' && <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              {uploadStatus.status === 'success' && <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
                <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}

              <div className="flex-1">
                <p className={`
                  font-semibold font-arabic
                  ${uploadStatus.status === 'error' ? 'text-red-700' : ''}
                  ${uploadStatus.status === 'success' ? 'text-green-700' : ''}
                  ${uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? 'text-blue-700' : ''}
                `}>
                  {uploadStatus.message}
                </p>

                {uploadStatus.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadStatus.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && uploadStatus.status !== 'success' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
                className="flex-1 bg-gradient-to-r from-[#0d7377] to-[#14a38b] text-white px-6 py-3 rounded-lg font-semibold font-arabic hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    رفع الكتاب
                  </>
                )}
              </button>

              <button
                onClick={handleCancelFile}
                disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
                className="px-6 py-3 rounded-lg font-semibold font-arabic border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 font-arabic mb-3">إرشادات:</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-arabic">
            <li className="flex items-start gap-2">
              <span className="text-[#0d7377] mt-1">•</span>
              <span>يجب أن يكون الملف بصيغة ABX (Advanced Book eXchange)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0d7377] mt-1">•</span>
              <span>الحد الأقصى لحجم الملف: 100 ميجابايت</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0d7377] mt-1">•</span>
              <span>سيتم استخراج الكتاب وفهرسته تلقائياً</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0d7377] mt-1">•</span>
              <span>يمكنك سحب وإفلات الملف مباشرة في المربع أعلاه</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
