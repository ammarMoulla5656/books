/**
 * Document Processing Status API
 * GET: Get current processing status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pythonService } from '@/lib/python-service';
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/documents/[id]/status', request);
    return authCheck.error;
  }

  try {
    const { id } = await params;

    // Get from database
    const upload = await prisma.documentUpload.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // If processing is in progress, also check Python service
    let pythonStatus = null;
    if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(upload.status)) {
      try {
        pythonStatus = await pythonService.getStatus(id);

        // Update database with latest status from Python
        if (pythonStatus.status !== upload.status || pythonStatus.progress !== upload.progress) {
          await prisma.documentUpload.update({
            where: { id },
            data: {
              status: pythonStatus.status as any,
              progress: pythonStatus.progress,
              detectedTitle: pythonStatus.detectedTitle || upload.detectedTitle,
              detectedAuthor: pythonStatus.detectedAuthor || upload.detectedAuthor,
              pageCount: pythonStatus.pageCount || upload.pageCount,
              errorMessage: pythonStatus.errorMessage,
              completedAt: pythonStatus.status === 'COMPLETED' ? new Date() : null,
            },
          });
        }
      } catch (pythonError) {
        console.warn('Failed to get Python status:', pythonError);
        // Continue with database status
      }
    }

    return NextResponse.json({
      id: upload.id,
      status: pythonStatus?.status || upload.status,
      progress: pythonStatus?.progress || upload.progress,
      currentStep: pythonStatus?.currentStep,
      logs: upload.logs,
      detectedTitle: pythonStatus?.detectedTitle || upload.detectedTitle,
      detectedAuthor: pythonStatus?.detectedAuthor || upload.detectedAuthor,
      pageCount: pythonStatus?.pageCount || upload.pageCount,
      errorMessage: pythonStatus?.errorMessage || upload.errorMessage,
      createdAt: upload.createdAt,
      completedAt: upload.completedAt,
    });
  } catch (error) {
    console.error('Failed to get status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
