/**
 * Admin Authentication Middleware
 * Provides authentication checks for admin API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from './session';

/**
 * Verify admin authentication
 * Returns admin session token if authenticated, null otherwise
 */
export async function verifyAdminAuth(): Promise<string | null> {
  try {
    const sessionToken = await getAdminSession();
    return sessionToken;
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized. Admin authentication required.') {
  return NextResponse.json(
    {
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    },
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Cookie',
      },
    }
  );
}

/**
 * Middleware wrapper for admin routes
 * Usage:
 *
 * export async function POST(request: NextRequest) {
 *   const authCheck = await requireAdminAuth();
 *   if (authCheck.error) return authCheck.error;
 *
 *   // Your route logic here
 * }
 */
export async function requireAdminAuth(): Promise<{
  session: string | null;
  error: NextResponse | null
}> {
  const session = await verifyAdminAuth();

  if (!session) {
    return {
      session: null,
      error: unauthorizedResponse(),
    };
  }

  return {
    session,
    error: null,
  };
}

/**
 * Check if request has admin authentication (non-blocking)
 * Returns true if authenticated, false otherwise
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await verifyAdminAuth();
  return session !== null;
}

/**
 * Log unauthorized access attempts
 */
export function logUnauthorizedAccess(
  endpoint: string,
  request: NextRequest,
  reason: string = 'No valid session'
) {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  console.warn(`[SECURITY] Unauthorized admin access attempt:`, {
    endpoint,
    ip,
    reason,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || 'unknown',
  });
}
