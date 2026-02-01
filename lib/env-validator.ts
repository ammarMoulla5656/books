/**
 * Environment Variables Validator
 *
 * This module validates that all required environment variables are set
 * and have secure values before the application starts.
 *
 * Security checks:
 * - Ensures DATABASE_URL doesn't use default/weak passwords
 * - Validates that secrets are properly set
 * - Checks for insecure configurations
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * List of insecure/default passwords to reject
 */
const INSECURE_PASSWORDS = [
  'password',
  'admin',
  'postgres',
  '123456',
  'iioopp00', // The old exposed password
  'Admin@123456',
  'admin123',
  'root',
  'test',
  'demo',
];

/**
 * Validates DATABASE_URL
 */
function validateDatabaseUrl(url: string | undefined): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url) {
    errors.push('DATABASE_URL is not set');
    return { errors, warnings };
  }

  // Check if it's a valid PostgreSQL URL
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Extract password from URL (postgresql://user:password@host:port/db)
  const passwordMatch = url.match(/postgresql:\/\/[^:]+:([^@]+)@/);
  if (passwordMatch) {
    const password = passwordMatch[1];

    // Check for insecure passwords
    if (INSECURE_PASSWORDS.includes(password.toLowerCase())) {
      errors.push(`DATABASE_URL uses an insecure password: "${password}". Please use a strong random password.`);
    }

    // Check password strength
    if (password.length < 12) {
      warnings.push('DATABASE_URL password is shorter than 12 characters. Consider using a longer password.');
    }
  }

  // Check for localhost in production
  if (process.env.NODE_ENV === 'production' && url.includes('localhost')) {
    warnings.push('DATABASE_URL points to localhost in production environment');
  }

  return { errors, warnings };
}

/**
 * Validates admin password
 */
function validateAdminPassword(password: string | undefined): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('ADMIN_INITIAL_PASSWORD is not set');
    return { errors, warnings };
  }

  // Check for default/insecure values
  if (
    password === 'generate-secure-random-password-here' ||
    password === 'GENERATE_STRONG_RANDOM_PASSWORD_HERE'
  ) {
    errors.push('ADMIN_INITIAL_PASSWORD is still set to the default example value. Generate a real password.');
  }

  if (INSECURE_PASSWORDS.includes(password.toLowerCase())) {
    errors.push(`ADMIN_INITIAL_PASSWORD uses an insecure password: "${password}". Please use a strong random password.`);
  }

  // Check password strength
  if (password.length < 16) {
    warnings.push('ADMIN_INITIAL_PASSWORD should be at least 16 characters long');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
    warnings.push('ADMIN_INITIAL_PASSWORD should contain uppercase, lowercase, numbers, and special characters');
  }

  return { errors, warnings };
}

/**
 * Validates session secret
 */
function validateSessionSecret(secret: string | undefined): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!secret) {
    errors.push('SESSION_SECRET is not set');
    return { errors, warnings };
  }

  if (
    secret === 'another-random-secret-here' ||
    secret === 'GENERATE_RANDOM_SECRET_KEY_HERE' ||
    secret === 'generate-a-long-random-secret-here'
  ) {
    errors.push('SESSION_SECRET is still set to the default example value. Generate a real secret.');
  }

  if (secret.length < 32) {
    warnings.push('SESSION_SECRET should be at least 32 characters long');
  }

  return { errors, warnings };
}

/**
 * Validates Python service URL
 */
function validatePythonServiceUrl(url: string | undefined): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url) {
    warnings.push('PYTHON_SERVICE_URL is not set. ABX file processing may not work.');
    return { errors, warnings };
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    errors.push('PYTHON_SERVICE_URL must be a valid HTTP(S) URL');
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate DATABASE_URL
  const dbValidation = validateDatabaseUrl(process.env.DATABASE_URL);
  errors.push(...dbValidation.errors);
  warnings.push(...dbValidation.warnings);

  // Validate ADMIN_INITIAL_PASSWORD
  const adminPasswordValidation = validateAdminPassword(process.env.ADMIN_INITIAL_PASSWORD);
  errors.push(...adminPasswordValidation.errors);
  warnings.push(...adminPasswordValidation.warnings);

  // Validate SESSION_SECRET
  const sessionSecretValidation = validateSessionSecret(process.env.SESSION_SECRET);
  errors.push(...sessionSecretValidation.errors);
  warnings.push(...sessionSecretValidation.warnings);

  // Validate PYTHON_SERVICE_URL
  const pythonServiceValidation = validatePythonServiceUrl(process.env.PYTHON_SERVICE_URL);
  errors.push(...pythonServiceValidation.errors);
  warnings.push(...pythonServiceValidation.warnings);

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DEBUG === 'true') {
      warnings.push('DEBUG mode is enabled in production');
    }
    if (process.env.DISABLE_AUTH === 'true') {
      errors.push('DISABLE_AUTH is enabled in production - this is extremely dangerous!');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates environment and logs results
 * Throws an error if validation fails
 */
export function validateEnvironmentOrExit(): void {
  console.log('🔍 Validating environment variables...');

  const result = validateEnvironmentVariables();

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    result.warnings.forEach((warning, index) => {
      console.warn(`  ${index + 1}. ${warning}`);
    });
  }

  // Log errors and exit if validation fails
  if (!result.isValid) {
    console.error('\n❌ Environment Validation Failed:');
    result.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.error('\n💡 Please check your .env file and fix the issues above.');
    console.error('📖 See .env.example for reference.\n');

    // In development, we can be more lenient
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with invalid configuration. Fix these issues before deploying to production.\n');
    }
  } else {
    console.log('✅ Environment validation passed\n');
  }
}

/**
 * Generate a secure random password
 * This is a helper function for development/setup scripts
 */
export function generateSecurePassword(length: number = 24): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Generate a secure random secret
 */
export function generateSecureSecret(length: number = 64): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64');
}
