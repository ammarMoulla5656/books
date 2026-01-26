/**
 * Secure Password Generator
 * Generates cryptographically secure random passwords
 */

import crypto from 'crypto';

export interface PasswordRequirements {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
}

/**
 * Generate a cryptographically secure random password
 * @param requirements Password requirements
 * @returns Generated password
 */
export function generateSecurePassword(
  requirements: PasswordRequirements = {}
): string {
  const {
    length = 32,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
  } = requirements;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  const guaranteedChars: string[] = [];

  if (includeUppercase) {
    charset += uppercase;
    guaranteedChars.push(uppercase[crypto.randomInt(uppercase.length)]);
  }
  if (includeLowercase) {
    charset += lowercase;
    guaranteedChars.push(lowercase[crypto.randomInt(lowercase.length)]);
  }
  if (includeNumbers) {
    charset += numbers;
    guaranteedChars.push(numbers[crypto.randomInt(numbers.length)]);
  }
  if (includeSpecialChars) {
    charset += specialChars;
    guaranteedChars.push(specialChars[crypto.randomInt(specialChars.length)]);
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  // Generate remaining random characters
  const remainingLength = length - guaranteedChars.length;
  const randomChars: string[] = [];

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = crypto.randomInt(charset.length);
    randomChars.push(charset[randomIndex]);
  }

  // Combine and shuffle all characters
  const allChars = [...guaranteedChars, ...randomChars];

  // Fisher-Yates shuffle
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('');
}

/**
 * Generate a secure admin password
 * Default requirements for admin passwords
 */
export function generateAdminPassword(): string {
  return generateSecurePassword({
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: true,
  });
}

/**
 * Get admin password from environment or generate one
 * SECURITY: This should only be called during initialization
 */
export function getOrGenerateAdminPassword(): string {
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (envPassword && envPassword.length >= 12) {
    return envPassword;
  }

  // Log warning if generating password
  console.warn('⚠️  WARNING: ADMIN_INITIAL_PASSWORD not set in environment variables');
  console.warn('⚠️  Generating a random password. This will only work once!');

  const generatedPassword = generateAdminPassword();

  console.warn('⚠️  Generated admin password (SAVE THIS IMMEDIATELY):');
  console.warn(`⚠️  ${generatedPassword}`);
  console.warn('⚠️  Add this to your .env file as ADMIN_INITIAL_PASSWORD');

  return generatedPassword;
}
