// src/app/api/v1/posts/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';
import { PostScheduler } from '@/lib/queue/scheduler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await SchedulingRepository.getPostById(params.id);
    if (!post) {
      return apiResponse.notFound(`Post '${params.id}' not found`);
    }
    return apiResponse.success(post);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch post';
    return apiResponse.error({ message, code: 'POST_GET_ERROR', status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const existing = await SchedulingRepository.getPostById(params.id);
    if (!existing) {
      return apiResponse.notFound(`Post '${params.id}' not found`);
    }

    const updated = await SchedulingRepository.updatePost(params.id, body);

    // If scheduledAt or timezone changed and post is scheduled, re-schedule BullMQ job
    if (body.scheduledAt && updated.status === 'SCHEDULED') {
      await PostScheduler.schedulePost(updated);
    }

    return apiResponse.success(updated, 'Post updated successfully.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update post';
    return apiResponse.error({ message, code: 'POST_UPDATE_ERROR', status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await SchedulingRepository.getPostById(params.id);
    if (!post) {
      return apiResponse.notFound(`Post '${params.id}' not found`);
    }

    // Cancel in BullMQ and mark CANCELLED in repository
    const cancelled = await PostScheduler.cancelScheduledPost(params.id);
    return apiResponse.success(cancelled, 'Post has been cancelled and removed from queue.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cancel post';
    return apiResponse.error({ message, code: 'POST_CANCEL_ERROR', status: 400 });
  }
}
