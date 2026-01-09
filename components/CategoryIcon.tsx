'use client';

import { FiBook, FiStar, FiHeart, FiMessageSquare, FiBookOpen } from 'react-icons/fi';

interface CategoryIconProps {
  icon?: string;
  className?: string;
}

export default function CategoryIcon({ icon, className = 'w-6 h-6' }: CategoryIconProps) {
  const getIcon = () => {
    switch (icon) {
      case 'book':
        return <FiBook className={className} />;
      case 'star':
        return <FiStar className={className} />;
      case 'heart':
        return <FiHeart className={className} />;
      case 'message':
        return <FiMessageSquare className={className} />;
      case 'bookmark':
        return <FiBookOpen className={className} />;
      default:
        return <FiBook className={className} />;
    }
  };

  return getIcon();
}
