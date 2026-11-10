// src/app/api/v1/posts/categories/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const categories = await SchedulingRepository.getCategories(workspaceId);
    return apiResponse.success(categories);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories';
    return apiResponse.error({ message, code: 'CATEGORIES_FETCH_ERROR', status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, name, color, description, isEvergreen, timeSlots } = body;

    if (!name || !name.trim()) {
      return apiResponse.badRequest('Category name is required.');
    }

    const category = await SchedulingRepository.createCategory({
      workspaceId: workspaceId || 'ws_peak_scale',
      name,
      color: color || '#6366f1',
      description,
      isEvergreen: !!isEvergreen,
      timeSlots: timeSlots || [],
      order: 0,
      isPaused: false,
    });

    return apiResponse.success(category, 'Category created successfully.', 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create category';
    return apiResponse.error({ message, code: 'CATEGORY_CREATE_ERROR', status: 400 });
  }
}
