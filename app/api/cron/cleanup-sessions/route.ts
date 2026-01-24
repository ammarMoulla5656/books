import { NextRequest, NextResponse } from 'next/server';
import { runSessionCleanup } from '@/lib/session-cleanup';

/**
 * API Route for Session Cleanup
 *
 * This endpoint can be called by:
 * 1. Cron jobs (e.g., Vercel Cron, AWS CloudWatch, etc.)
 * 2. Manual admin requests
 * 3. Scheduled tasks
 *
 * Security: Uses a secret token to prevent unauthorized access
 *
 * Example cron setup (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-sessions",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, require authentication
    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Run cleanup
    const result = await runSessionCleanup();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} expired sessions`,
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Session cleanup endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
