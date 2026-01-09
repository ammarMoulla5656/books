import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const sessionToken = await getAdminSession();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'غير مصرح', authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      sessionToken,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ', authenticated: false },
      { status: 500 }
    );
  }
}
