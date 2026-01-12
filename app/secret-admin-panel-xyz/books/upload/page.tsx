import Link from 'next/link';
import DocumentUploader from '@/components/admin/DocumentUploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/secret-admin-panel-xyz/books"
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              رفع كتاب جديد من ملف
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              قم برفع ملف PDF أو DOCX أو ABX وسيتم استخراج المحتوى تلقائياً
            </p>
          </div>
        </div>

        {/* Uploader Component */}
        <DocumentUploader />

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            كيف تعمل هذه الميزة؟
          </h3>
          <ol className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>قم برفع ملف PDF أو DOCX أو ABX يحتوي على الكتاب</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>سيتم استخراج النص تلقائياً (أو باستخدام OCR للكتب المصورة)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>سيتم كشف الفهرس وتقسيم المحتوى إلى فصول وأقسام</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>راجع النتيجة وقم بالتعديلات اللازمة قبل الحفظ</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
