import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const theme = await CmsRepository.getThemeSettings();
    return apiResponse.success(theme);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Theme Settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    const updated = await CmsRepository.updateThemeSettings(body);
    return apiResponse.success(updated, 'Theme settings updated successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Theme Settings');
  }
}
