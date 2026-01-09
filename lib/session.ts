import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_SESSION_COOKIE = 'admin_session';
const USER_SESSION_COOKIE = 'user_session';
const SESSION_EXPIRY_DAYS = 30;

// Temporary in-memory session storage (until database is ready)
const activeSessions = new Map<string, { adminId: string; createdAt: Date }>();

// Admin Session Management
export async function createAdminSession(adminId: string, stayLoggedIn: boolean = false) {
  const sessionToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (stayLoggedIn ? SESSION_EXPIRY_DAYS : 1));

  // Store in memory
  activeSessions.set(sessionToken, {
    adminId,
    createdAt: new Date(),
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return sessionToken;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  // Check if session exists in memory
  const session = activeSessions.get(sessionToken);
  if (!session) {
    return null;
  }

  return sessionToken;
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionToken) {
    activeSessions.delete(sessionToken);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export function isValidAdminSession(sessionToken: string): boolean {
  return activeSessions.has(sessionToken);
}

// User Session Management (for anonymous users)
export async function getUserSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    sessionToken = uuidv4();

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
