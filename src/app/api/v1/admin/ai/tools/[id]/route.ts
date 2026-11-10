// src/app/api/v1/admin/ai/tools/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await AIRepository.updateTool(params.id, body);
    return apiResponse.success(updated, `Tool '${updated.name}' updated.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update tool';
    return apiResponse.error({ message, code: 'ADMIN_TOOL_UPDATE_ERROR', status: 400 });
  }
}
