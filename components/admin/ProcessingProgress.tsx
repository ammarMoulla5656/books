'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStatusMessage, getStepName, type ProcessingStatus, type ProcessingStep } from '@/lib/python-service';

interface ProcessingLog {
  step: ProcessingStep;
  status: string;
  message: string;
  duration?: number;
  createdAt: string;
}

interface StatusResponse {
  id: string;
  status: ProcessingStatus;
  progress: number;
  currentStep?: ProcessingStep;
  logs: ProcessingLog[];
  detectedTitle?: string;
  detectedAuthor?: string;
  pageCount?: number;
  errorMessage?: string;
}

export default function ProcessingProgress({ uploadId }: { uploadId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/admin/documents/${uploadId}/status`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'فشل جلب الحالة');
        }

        setStatus(data);

        // Stop polling if completed or failed
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
        clearInterval(intervalId);
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 1500);

    return () => clearInterval(intervalId);
  }, [uploadId]);

  // Get step icon
  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'COMPLETED':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        );
      case 'FAILED':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">حدث خطأ</h3>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push('/secret-admin-panel-xyz/books/upload')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          العودة للرفع
        </button>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="w-8 h-8 text-emerald-600 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {getStatusMessage(status.status)}
          </h3>
          <span className="text-2xl font-bold text-emerald-600">{status.progress}%</span>
        </div>

        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status.status === 'FAILED' ? 'bg-red-500' :
              status.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {/* Processing Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          مراحل المعالجة
        </h3>

        <div className="space-y-4">
          {status.logs.map((log, index) => (
            <div key={index} className="flex items-start gap-4">
              {getStepIcon(log.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {getStepName(log.step)}
                  </span>
                  {log.duration && (
                    <span className="text-sm text-gray-500">
                      {(log.duration / 1000).toFixed(1)} ثانية
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Info */}
      {(status.detectedTitle || status.detectedAuthor || status.pageCount) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            معلومات الكتاب المكتشفة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {status.detectedTitle && (
              <div>
                <span className="text-sm text-gray-500">العنوان</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{status.detectedTitle}</p>
              </div>
            )}
            {status.detectedAuthor && (
              <div>
                <span className="text-sm text-gray-500">المؤلف</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{status.detectedAuthor}</p>
              </div>
            )}
            {status.pageCount && (
              <div>
                <span className="text-sm text-gray-500">عدد الصفحات</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{status.pageCount}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {status.errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">خطأ في المعالجة</h3>
          <p className="text-red-500">{status.errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {status.status === 'COMPLETED' && (
          <button
            onClick={() => router.push(`/secret-admin-panel-xyz/books/upload/${uploadId}/review`)}
            className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
          >
            مراجعة الفهرس وإنشاء الكتاب
          </button>
        )}

        {status.status === 'FAILED' && (
          <button
            onClick={() => router.push('/secret-admin-panel-xyz/books/upload')}
            className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
          >
            المحاولة مرة أخرى
          </button>
        )}

        <button
          onClick={() => router.push('/secret-admin-panel-xyz/books')}
          className="py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          العودة للكتب
        </button>
      </div>
    </div>
  );
}
