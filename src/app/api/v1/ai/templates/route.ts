// src/app/api/v1/ai/templates/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, templateTitle } = body;

    if (!id || !templateTitle) {
      return apiResponse.badRequest('Missing generation id or templateTitle');
    }

    const updated = await AIRepository.updateGeneration(id, {
      isTemplate: true,
      templateTitle,
    });

    return apiResponse.success(updated, 'Saved as reusable AI template.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save template';
    return apiResponse.error({ message, code: 'SAVE_TEMPLATE_ERROR', status: 400 });
  }
}
