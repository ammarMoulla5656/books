/**
 * Session Cleanup Utility
 *
 * This file provides utilities to clean up expired sessions.
 * It should be run periodically using a cron job or scheduled task.
 */

import { cleanupExpiredSessions } from './session';

/**
 * Main cleanup function
 * Can be called from cron jobs, API routes, or scheduled tasks
 */
export async function runSessionCleanup(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    console.log('🧹 Starting session cleanup...');
    const deletedCount = await cleanupExpiredSessions();

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error('❌ Session cleanup failed:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Schedule automatic cleanup
 * This runs cleanup every hour
 */
export function scheduleSessionCleanup(): void {
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  setInterval(async () => {
    await runSessionCleanup();
  }, CLEANUP_INTERVAL);

  console.log(`✅ Session cleanup scheduled (every ${CLEANUP_INTERVAL / 1000 / 60} minutes)`);
}

/**
 * Run cleanup immediately (for scripts)
 */
if (require.main === module) {
  runSessionCleanup()
    .then((result) => {
      if (result.success) {
        console.log(`✅ Cleanup completed: ${result.deletedCount} sessions deleted`);
        process.exit(0);
      } else {
        console.error(`❌ Cleanup failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
