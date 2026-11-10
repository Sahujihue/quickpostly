import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const list = await CmsRepository.getAnnouncements(false);
    return apiResponse.success(list);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Announcements');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (!body.title || !body.content) {
      return apiResponse.badRequest('Announcement title and content are required');
    }

    const saved = await CmsRepository.saveAnnouncement(body);
    return apiResponse.success(saved, 'Announcement saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Announcement');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing announcement id');

    await CmsRepository.deleteAnnouncement(id);
    return apiResponse.success({ id }, 'Announcement deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Announcement');
  }
}
