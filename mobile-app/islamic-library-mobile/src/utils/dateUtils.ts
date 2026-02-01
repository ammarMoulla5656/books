/**
 * أدوات التعامل مع التواريخ
 */

import { format, formatDistance, formatRelative, isToday, isYesterday, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * تنسيق التاريخ بصيغة عربية
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ar });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * تنسيق الوقت
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

/**
 * تنسيق التاريخ والوقت
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * تنسيق نسبي (منذ كم من الوقت)
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: ar,
    });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * تنسيق ذكي للتاريخ
 * - اليوم: "اليوم في 3:30 مساءً"
 * - أمس: "أمس في 3:30 مساءً"
 * - هذا الأسبوع: "الاثنين في 3:30 مساءً"
 * - قديم: "15 يناير 2024"
 */
export const formatSmartDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `اليوم في ${formatTime(dateObj)}`;
    }

    if (isYesterday(dateObj)) {
      return `أمس في ${formatTime(dateObj)}`;
    }

    // إذا كان خلال آخر 7 أيام
    const daysDiff = Math.floor(
      (new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff < 7) {
      return formatRelative(dateObj, new Date(), { locale: ar });
    }

    // خلاف ذلك، أرجع التاريخ الكامل
    return formatDate(dateObj, 'dd MMMM yyyy');
  } catch (error) {
    console.error('Error formatting smart date:', error);
    return '';
  }
};

/**
 * الحصول على اسم اليوم بالعربية
 */
export const getDayName = (date: string | Date): string => {
  return formatDate(date, 'EEEE');
};

/**
 * الحصول على اسم الشهر بالعربية
 */
export const getMonthName = (date: string | Date): string => {
  return formatDate(date, 'MMMM');
};

/**
 * حساب الفرق بين تاريخين بالأيام
 */
export const getDaysDifference = (
  date1: string | Date,
  date2: string | Date
): number => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};

/**
 * التحقق من أن التاريخ في المستقبل
 */
export const isFutureDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
  } catch {
    return false;
  }
};

/**
 * التحقق من أن التاريخ في الماضي
 */
export const isPastDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
  } catch {
    return false;
  }
};

/**
 * الحصول على بداية اليوم
 */
export const getStartOfDay = (date?: Date): Date => {
  const d = date || new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * الحصول على نهاية اليوم
 */
export const getEndOfDay = (date?: Date): Date => {
  const d = date || new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * الحصول على آخر 7 أيام
 */
export const getLast7Days = (): Date[] => {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
};

/**
 * الحصول على آخر 30 يوم
 */
export const getLast30Days = (): Date[] => {
  const days: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
};
