/**
 * أدوات التحقق من صحة البيانات
 */

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من قوة كلمة المرور
 * - على الأقل 8 أحرف
 * - يحتوي على حرف كبير
 * - يحتوي على حرف صغير
 * - يحتوي على رقم
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * الحصول على رسالة خطأ كلمة المرور
 */
export const getPasswordError = (password: string): string | null => {
  if (password.length === 0) return 'كلمة المرور مطلوبة';
  if (password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
  if (!/[A-Z]/.test(password)) return 'يجب أن تحتوي على حرف كبير';
  if (!/[a-z]/.test(password)) return 'يجب أن تحتوي على حرف صغير';
  if (!/[0-9]/.test(password)) return 'يجب أن تحتوي على رقم';
  return null;
};

/**
 * التحقق من رقم الهاتف السعودي
 */
export const isValidSaudiPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+966|0)?5[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * التحقق من طول النص
 */
export const isValidLength = (
  text: string,
  min: number,
  max: number
): boolean => {
  const length = text.trim().length;
  return length >= min && length <= max;
};

/**
 * التحقق من الاسم
 */
export const isValidName = (name: string): boolean => {
  return isValidLength(name, 2, 50);
};

/**
 * التحقق من URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * تنظيف رقم الهاتف (إزالة المسافات والرموز)
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/\s+|-|\(|\)/g, '');
};

/**
 * تنسيق رقم الهاتف للعرض
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = sanitizePhoneNumber(phone);

  // تنسيق رقم سعودي: +966 5X XXX XXXX
  if (cleaned.startsWith('+966')) {
    return cleaned.replace(/(\+966)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }

  // تنسيق رقم محلي: 05X XXX XXXX
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  return cleaned;
};

/**
 * التحقق من حجم الملف
 */
export const isValidFileSize = (
  sizeInBytes: number,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

/**
 * التحقق من نوع الملف
 */
export const isValidFileType = (
  mimeType: string,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(mimeType);
};
