/**
 * وظائف مساعدة عامة
 */

/**
 * تأخير التنفيذ لفترة محددة
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
};

/**
 * اختصار النص
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * إنشاء initials من الاسم
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * إنشاء لون عشوائي من اسم
 */
export const getColorFromName = (name: string): string => {
  const colors = [
    '#1a472a', '#2d5f3f', '#d4af37', '#8b4513',
    '#2e8b57', '#6b8e23', '#556b2f', '#8fbc8f',
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * خلط مصفوفة عشوائياً
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * تجميع مصفوفة حسب مفتاح
 */
export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * إزالة التكرارات من مصفوفة
 */
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * حساب نسبة مئوية
 */
export const calculatePercentage = (
  current: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * تحويل دقائق إلى ساعات ودقائق
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }

  return `${hours} ساعة و ${remainingMinutes} دقيقة`;
};

/**
 * تنسيق رقم كبير (1000 -> 1K)
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

/**
 * debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * التحقق من وجود اتصال بالإنترنت
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // سيتم استخدام expo-clipboard لاحقاً
    // await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * share content
 */
export const shareContent = async (
  message: string,
  url?: string
): Promise<boolean> => {
  try {
    // سيتم استخدام expo-sharing لاحقاً
    // await Share.share({ message, url });
    return true;
  } catch {
    return false;
  }
};
