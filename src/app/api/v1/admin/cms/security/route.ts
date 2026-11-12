import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const security = await CmsRepository.getSecuritySettings();
    return apiResponse.success(security);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Security Settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const updated = await CmsRepository.updateSecuritySettings(body);
    const response = apiResponse.success(updated, 'Security policies updated successfully');

    if (body.maintenanceMode !== undefined) {
      response.cookies.set('quickpostly_maintenance_mode', String(Boolean(updated.maintenanceMode)), {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Security Settings');
  }
}
