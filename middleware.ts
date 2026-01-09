import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if path is admin panel
  if (path.startsWith('/secret-admin-panel-xyz')) {
    // Allow login page
    if (path === '/secret-admin-panel-xyz') {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      // Redirect to login
      return NextResponse.redirect(new URL('/secret-admin-panel-xyz', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/secret-admin-panel-xyz/:path*',
};
