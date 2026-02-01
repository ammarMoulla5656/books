import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';

const ADMIN_SESSION_COOKIE = 'admin_session';
const USER_SESSION_COOKIE = 'user_session';
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_DURATION_HOURS || '24', 10);

/**
 * Generate a cryptographically secure random token
 * Much more secure than UUID v4
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate session expiration date
 */
function getExpirationDate(stayLoggedIn: boolean = false): Date {
  const expiresAt = new Date();
  const hours = stayLoggedIn ? SESSION_EXPIRY_HOURS * 30 : SESSION_EXPIRY_HOURS;
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}

// ============================================
// ADMIN SESSION MANAGEMENT
// ============================================

/**
 * Create a new admin session in the database
 * @param adminId - The admin user ID
 * @param stayLoggedIn - Whether to extend session duration
 * @returns The session token
 */
export async function createAdminSession(adminId: string, stayLoggedIn: boolean = false): Promise<string> {
  const sessionToken = generateSecureToken();
  const expiresAt = getExpirationDate(stayLoggedIn);

  // Clean up any expired sessions for this admin first
  await prisma.adminSession.deleteMany({
    where: {
      adminId,
      expiresAt: { lt: new Date() }
    }
  });

  // Create new session in database
  await prisma.adminSession.create({
    data: {
      token: sessionToken,
      adminId,
      expiresAt
    }
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  console.log(`✅ Admin session created for ${adminId}, expires at ${expiresAt.toISOString()}`);

  return sessionToken;
}

/**
 * Get the current admin session from database
 * Validates that the session exists and hasn't expired
 * @returns The admin ID if session is valid, null otherwise
 */
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  // Find session in database
  const session = await prisma.adminSession.findUnique({
    where: { token: sessionToken },
    include: { admin: true }
  });

  // Check if session exists
  if (!session) {
    console.warn('⚠️ Session token not found in database');
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    console.warn(`⚠️ Session expired at ${session.expiresAt.toISOString()}`);
    // Delete expired session
    await prisma.adminSession.delete({
      where: { id: session.id }
    });
    // Clear cookie
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return null;
  }

  // Session is valid, return admin ID
  return session.adminId;
}

/**
 * Delete an admin session (logout)
 */
export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionToken) {
    // Delete from database
    await prisma.adminSession.deleteMany({
      where: { token: sessionToken }
    });
    console.log('✅ Admin session deleted from database');
  }

  // Clear cookie
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Check if a session token is valid
 * @param sessionToken - The session token to validate
 * @returns true if valid and not expired, false otherwise
 */
export async function isValidAdminSession(sessionToken: string): Promise<boolean> {
  const session = await prisma.adminSession.findUnique({
    where: { token: sessionToken }
  });

  if (!session) {
    return false;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.adminSession.delete({
      where: { id: session.id }
    });
    return false;
  }

  return true;
}

/**
 * Renew an admin session (extend expiration)
 * Useful for "remember me" functionality
 * @param sessionToken - The session token to renew
 * @returns true if renewed successfully, false otherwise
 */
export async function renewAdminSession(sessionToken: string): Promise<boolean> {
  const session = await prisma.adminSession.findUnique({
    where: { token: sessionToken }
  });

  if (!session) {
    return false;
  }

  // Check if not already expired
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({
      where: { id: session.id }
    });
    return false;
  }

  // Extend expiration
  const newExpiresAt = getExpirationDate(false);
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { expiresAt: newExpiresAt }
  });

  console.log(`✅ Session renewed, new expiration: ${newExpiresAt.toISOString()}`);
  return true;
}

/**
 * Delete all sessions for an admin (useful when password changes)
 * @param adminId - The admin user ID
 */
export async function deleteAllAdminSessions(adminId: string): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { adminId }
  });
  console.log(`✅ All sessions deleted for admin ${adminId}`);
}

/**
 * Clean up all expired sessions in the database
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });

  if (result.count > 0) {
    console.log(`✅ Cleaned up ${result.count} expired sessions`);
  }

  return result.count;
}

/**
 * Get all active sessions for an admin
 * @param adminId - The admin user ID
 * @returns Array of active sessions
 */
export async function getAdminActiveSessions(adminId: string) {
  return prisma.adminSession.findMany({
    where: {
      adminId,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// ============================================
// USER SESSION MANAGEMENT (for anonymous users)
// ============================================

/**
 * Get or create a user session for anonymous users
 * Uses simple UUID in cookies, doesn't need database storage
 */
export async function getUserSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    sessionToken = generateSecureToken();

    // Set cookie
    cookieStore.set(USER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return sessionToken;
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize session management
 * Can be called at startup to clean up expired sessions
 */
export async function initializeSessionManagement(): Promise<void> {
  try {
    const cleaned = await cleanupExpiredSessions();
    console.log('✅ Session management initialized');
    if (cleaned > 0) {
      console.log(`   Cleaned up ${cleaned} expired sessions`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize session management:', error);
  }
}
