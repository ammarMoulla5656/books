#!/usr/bin/env ts-node

/**
 * Generate Secure Environment Variables Script
 *
 * This script helps generate secure random values for environment variables.
 * Use this when setting up a new environment or rotating secrets.
 *
 * Usage:
 *   npm run generate-secrets
 *   or
 *   npx ts-node scripts/generate-env-secrets.ts
 */

import * as crypto from 'crypto';
import * as readline from 'readline';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Generate a secure random password
 */
function generatePassword(length: number = 24): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Generate a secure random secret (longer)
 */
function generateSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Generate a hex secret
 */
function generateHexSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Print a section header
 */
function printHeader(text: string): void {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

/**
 * Print a variable with its value
 */
function printVariable(name: string, value: string, warning?: string): void {
  console.log(`${colors.bright}${colors.green}${name}${colors.reset}="${value}"`);
  if (warning) {
    console.log(`${colors.yellow}⚠️  ${warning}${colors.reset}`);
  }
  console.log();
}

/**
 * Print a warning
 */
function printWarning(text: string): void {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

/**
 * Print an info message
 */
function printInfo(text: string): void {
  console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`);
}

/**
 * Print a success message
 */
function printSuccess(text: string): void {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

/**
 * Ask user a yes/no question
 */
async function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.clear();

  printHeader('🔐 Secure Environment Variables Generator');

  printWarning('This script will generate secure random values for your .env file.');
  printWarning('NEVER commit these values to Git!');
  printWarning('Store them securely (password manager, secrets manager, etc.)');
  console.log();

  const shouldContinue = await askYesNo('Continue?');
  if (!shouldContinue) {
    console.log('Aborted.');
    process.exit(0);
  }

  // Generate DATABASE_URL password
  printHeader('1️⃣  Database Configuration');
  const dbPassword = generatePassword(32);
  printInfo('Generated a strong 32-character password for your database.');
  printVariable(
    'DATABASE_URL',
    `postgresql://postgres:${dbPassword}@localhost:5432/islamic_library`,
    'Replace "postgres", "localhost:5432", and "islamic_library" with your actual values'
  );

  // Generate ADMIN_INITIAL_PASSWORD
  printHeader('2️⃣  Admin Configuration');
  const adminPassword = generatePassword(32);
  printInfo('Generated a strong 32-character password for the admin account.');
  printVariable('ADMIN_INITIAL_PASSWORD', adminPassword, 'Save this! You will need it for first login');

  // Generate SESSION_SECRET
  printHeader('3️⃣  Session Configuration');
  const sessionSecret = generateSecret(64);
  printInfo('Generated a 64-character secret for session encryption.');
  printVariable('SESSION_SECRET', sessionSecret);

  // Generate NEXTAUTH_SECRET
  printHeader('4️⃣  NextAuth Configuration');
  const nextAuthSecret = generateSecret(64);
  printInfo('Generated a 64-character secret for NextAuth.');
  printVariable('NEXTAUTH_SECRET', nextAuthSecret);

  // Generate CRON_SECRET
  printHeader('5️⃣  Cron Secret');
  const cronSecret = generateHexSecret(32);
  printInfo('Generated a hex secret for cron job authentication.');
  printVariable('CRON_SECRET', cronSecret);

  // Other configuration
  printHeader('6️⃣  Other Configuration');
  printInfo('These values depend on your setup:');
  console.log();
  printVariable('PYTHON_SERVICE_URL', 'http://localhost:5000', 'Update if your Python service runs elsewhere');
  printVariable('NEXTAUTH_URL', 'http://localhost:3000', 'Update to your domain in production');
  printVariable('NEXT_PUBLIC_ADMIN_SECRET_PATH', `admin-${generateHexSecret(8).slice(0, 16)}`, 'A secret path for your admin panel');

  // Summary
  printHeader('📋 Summary');
  printSuccess('All secrets generated successfully!');
  console.log();
  printInfo('Next steps:');
  console.log('  1. Copy the values above to your .env file');
  console.log('  2. Verify .env is in .gitignore (it should be)');
  console.log('  3. NEVER commit .env to Git');
  console.log('  4. Store these values securely (password manager, etc.)');
  console.log('  5. Run your application: npm run dev');
  console.log();

  printHeader('🔐 Security Reminders');
  printWarning('Database Password: Change it in PostgreSQL first!');
  console.log('  psql -U postgres');
  console.log(`  ALTER USER postgres WITH PASSWORD '${dbPassword}';`);
  console.log();

  printWarning('Admin Password: Save it securely! You will need it for first login.');
  console.log();

  printWarning('Session Secrets: If you change these, all users will be logged out.');
  console.log();

  printInfo('For production, consider using a secrets manager:');
  console.log('  - AWS Secrets Manager');
  console.log('  - Azure Key Vault');
  console.log('  - HashiCorp Vault');
  console.log('  - Docker Secrets');
  console.log();

  printHeader('📚 Documentation');
  console.log('For more information, see:');
  console.log('  - docs/security/ENV_SETUP.md');
  console.log('  - docs/security/SECURITY_FIX_PLAN.md');
  console.log('  - .env.example');
  console.log();

  printSuccess('Done! 🎉');
}

// Run the script
main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
