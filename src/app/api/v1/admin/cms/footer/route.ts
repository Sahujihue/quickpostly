import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const footer = await CmsRepository.getFooterSettings();
    return apiResponse.success(footer);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Footer Settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    const updated = await CmsRepository.updateFooterSettings(body);
    return apiResponse.success(updated, 'Footer configuration saved successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Footer Settings');
  }
}
