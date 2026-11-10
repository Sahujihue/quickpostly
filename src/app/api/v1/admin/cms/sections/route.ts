import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('pageId') || 'page_home';
    const sections = await CmsRepository.getSections(pageId);
    return apiResponse.success(sections);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Sections');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    // Check if this is a reorder batch
    if (Array.isArray(body.orders)) {
      const updated = await CmsRepository.reorderSections(body.orders);
      return apiResponse.success(updated, 'Sections reordered successfully');
    }

    if (!body.id) {
      return apiResponse.badRequest('Section id is required for update');
    }

    const updated = await CmsRepository.updateSection(body.id, body);
    return apiResponse.success(updated, 'Section updated successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Section');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (body.action === 'duplicate' && body.id) {
      const duplicated = await CmsRepository.duplicateSection(body.id);
      return apiResponse.success(duplicated, 'Section duplicated successfully', 201);
    }

    return apiResponse.badRequest('Invalid action');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Section Action');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing section id');

    await CmsRepository.deleteSection(id);
    return apiResponse.success({ id }, 'Section deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Section');
  }
}
