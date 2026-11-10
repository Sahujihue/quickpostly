import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const items = await CmsRepository.getMediaItems(q);
    return apiResponse.success(items);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Media Library');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (!body.fileName || !body.fileUrl) {
      return apiResponse.badRequest('File name and URL are required');
    }

    const saved = await CmsRepository.saveMediaItem({
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      mimeType: body.mimeType || 'image/png',
      fileSize: body.fileSize || 102400,
      width: body.width,
      height: body.height,
      altText: body.altText,
      folder: body.folder,
    });

    return apiResponse.success(saved, 'Media asset registered successfully', 201);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Media Asset');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();
    if (!body.id) return apiResponse.badRequest('Missing media id');

    const updated = await CmsRepository.updateMediaItem(body.id, {
      fileName: body.fileName,
      altText: body.altText,
      folder: body.folder,
    });
    return apiResponse.success(updated, 'Media asset updated successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Media Asset');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing media id');

    await CmsRepository.deleteMediaItem(id);
    return apiResponse.success({ id }, 'Media item deleted safely');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Media Asset');
  }
}
