import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, action } = body;

    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('visitor_session')?.value;

    if (!sessionId) {
      // Create new session
      sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Get IP address (with fallback for localhost)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0] || 'localhost';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Log the visit
    await prisma.visitorLog.create({
      data: {
        sessionId,
        ipAddress,
        userAgent,
        page,
        action,
      },
    });

    // Update or create today's daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique sessions for today
    const uniqueSessionsToday = await prisma.visitorLog.findMany({
      where: {
        timestamp: {
          gte: today,
        },
      },
      select: {
        sessionId: true,
      },
      distinct: ['sessionId'],
    });

    // Count page views for today
    const pageViewsToday = await prisma.visitorLog.count({
      where: {
        timestamp: {
          gte: today,
        },
      },
    });

    // Update daily stats
    await prisma.dailyStats.upsert({
      where: {
        date: today,
      },
      create: {
        date: today,
        uniqueVisitors: uniqueSessionsToday.length,
        totalPageViews: pageViewsToday,
        newBooks: 0,
        newBookmarks: 0,
      },
      update: {
        uniqueVisitors: uniqueSessionsToday.length,
        totalPageViews: pageViewsToday,
      },
    });

    // Return session ID to set in cookie
    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}
