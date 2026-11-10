import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const [header, navItems] = await Promise.all([
      CmsRepository.getHeaderSettings(),
      CmsRepository.getNavigationItems('HEADER'),
    ]);
    return apiResponse.success({ header, navItems });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Header Settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    const updated = await CmsRepository.updateHeaderSettings(body);
    return apiResponse.success(updated, 'Header settings saved successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Header Settings');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();
    const navItem = await CmsRepository.saveNavigationItem(body);
    return apiResponse.success(navItem, 'Navigation link saved successfully', 201);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Nav Item');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing item id');
    await CmsRepository.deleteNavigationItem(id);
    return apiResponse.success({ id }, 'Navigation link removed');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Nav Item');
  }
}
