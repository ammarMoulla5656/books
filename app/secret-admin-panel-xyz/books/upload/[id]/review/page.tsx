import Link from 'next/link';
import TocEditor from '@/components/admin/TocEditor';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/secret-admin-panel-xyz/books/upload/${id}/progress`}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              مراجعة فهرس الكتاب
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              راجع الفهرس المستخرج وقم بالتعديلات اللازمة قبل إنشاء الكتاب
            </p>
          </div>
        </div>

        {/* Editor Component */}
        <TocEditor uploadId={id} />
      </div>
    </div>
  );
}
