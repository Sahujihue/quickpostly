// src/app/api/v1/ai/drafts/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, output, draftTitle } = body;

    if (!id) {
      return apiResponse.badRequest('Missing generation id');
    }

    const updated = await AIRepository.updateGeneration(id, {
      output,
      isDraft: true,
      templateTitle: draftTitle,
    });

    return apiResponse.success(updated, 'Draft saved successfully.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save draft';
    return apiResponse.error({ message, code: 'SAVE_DRAFT_ERROR', status: 400 });
  }
}
