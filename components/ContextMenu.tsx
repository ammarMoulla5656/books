'use client';

import { useState, useEffect, useRef } from 'react';
import { FiCopy, FiSearch, FiBookmark, FiShare2, FiFlag } from 'react-icons/fi';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  selectedText: string;
}

interface MenuAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

export default function ContextMenu({ x, y, onClose, selectedText }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSearch = () => {
    const searchQuery = encodeURIComponent(selectedText);
    window.open(`/search?q=${searchQuery}`, '_blank');
    onClose();
  };

  const handleBookmark = () => {
    // Get or create bookmarks from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('textBookmarks') || '[]');
    bookmarks.push({
      text: selectedText,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    });
    localStorage.setItem('textBookmarks', JSON.stringify(bookmarks));
    alert('✅ تم حفظ النص في العلامات المرجعية');
    onClose();
  };

  const handleShare = async () => {
    const shareText = `"${selectedText}"\n\nمن: المكتبة الإسلامية\n${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نص من المكتبة الإسلامية',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying
      await navigator.clipboard.writeText(shareText);
      alert('تم نسخ النص للمشاركة');
    }
    onClose();
  };

  const handleReport = () => {
    const issue = prompt('يرجى وصف المشكلة في هذا النص:');
    if (issue) {
      // Store report in localStorage for now
      const reports = JSON.parse(localStorage.getItem('textReports') || '[]');
      reports.push({
        text: selectedText,
        issue,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('textReports', JSON.stringify(reports));
      alert('✅ شكراً! تم إرسال البلاغ');
    }
    onClose();
  };

  const menuActions: MenuAction[] = [
    {
      icon: <FiCopy className="w-4 h-4" />,
      label: copied ? 'تم النسخ ✓' : 'نسخ النص',
      action: handleCopy,
    },
    {
      icon: <FiSearch className="w-4 h-4" />,
      label: 'البحث عن هذا النص',
      action: handleSearch,
    },
    {
      icon: <FiBookmark className="w-4 h-4" />,
      label: 'حفظ في العلامات',
      action: handleBookmark,
    },
    {
      icon: <FiShare2 className="w-4 h-4" />,
      label: 'مشاركة',
      action: handleShare,
    },
    {
      icon: <FiFlag className="w-4 h-4" />,
      label: 'الإبلاغ عن مشكلة',
      action: handleReport,
    },
  ];

  // Ensure menu stays within viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - (menuActions.length * 45 + 20));

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-[#1a2028] shadow-2xl rounded-xl border-2 border-[#d4af37]/30 overflow-hidden animate-fadeIn"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        minWidth: '200px',
      }}
    >
      {/* Selected text preview */}
      <div className="px-4 py-2 bg-[#f5f1e8] dark:bg-[#0d1419] border-b border-[#d4af37]/20">
        <p className="text-xs text-[#2d7a54] dark:text-[#d4af37]/70 arabic-text truncate" title={selectedText}>
          {selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}
        </p>
      </div>

      {/* Menu actions */}
      <div className="py-1">
        {menuActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="w-full px-4 py-2.5 text-right flex items-center gap-3 hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-colors text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
          >
            <span className="text-[#d4af37]">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
