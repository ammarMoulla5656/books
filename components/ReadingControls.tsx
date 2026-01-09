'use client';

import { useStore } from '@/lib/store';
import { FiMinus, FiPlus } from 'react-icons/fi';

export default function ReadingControls() {
  const { readingSettings, setFontSize, setLineSpacing } = useStore();

  const increaseFontSize = () => {
    if (readingSettings.fontSize < 32) {
      setFontSize(readingSettings.fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (readingSettings.fontSize > 12) {
      setFontSize(readingSettings.fontSize - 2);
    }
  };

  const increaseLineSpacing = () => {
    if (readingSettings.lineSpacing < 3) {
      setLineSpacing(readingSettings.lineSpacing + 0.2);
    }
  };

  const decreaseLineSpacing = () => {
    if (readingSettings.lineSpacing > 1) {
      setLineSpacing(readingSettings.lineSpacing - 0.2);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Font Size Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300 arabic-text">
            حجم الخط:
          </span>
          <button
            onClick={decreaseFontSize}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="تصغير الخط"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">
            {readingSettings.fontSize}px
          </span>
          <button
            onClick={increaseFontSize}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="تكبير الخط"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Line Spacing Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300 arabic-text">
            تباعد الأسطر:
          </span>
          <button
            onClick={decreaseLineSpacing}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="تقليل التباعد"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">
            {readingSettings.lineSpacing.toFixed(1)}
          </span>
          <button
            onClick={increaseLineSpacing}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="زيادة التباعد"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
