import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const revisionsFor = searchParams.get('revisionsFor');

    if (revisionsFor) {
      const revs = await CmsRepository.getPageRevisions(revisionsFor);
      return apiResponse.success(revs);
    }

    const slug = searchParams.get('slug');
    if (slug) {
      const page = await CmsRepository.getPageBySlug(slug);
      if (!page) return apiResponse.notFound('Page not found');
      return apiResponse.success(page);
    }

    const pages = await CmsRepository.getPages();
    return apiResponse.success(pages);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Pages');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (body.action === 'rollback' && body.revisionId) {
      const restored = await CmsRepository.rollbackPageRevision(body.revisionId);
      if (!restored) return apiResponse.badRequest('Revision not found');
      return apiResponse.success(restored, 'Page restored to previous revision');
    }

    if (!body.title || !body.slug) {
      return apiResponse.badRequest('Page title and slug are required');
    }

    const saved = await CmsRepository.savePage(body);
    return apiResponse.success(saved, 'Page saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Page');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing page id');

    const ok = await CmsRepository.deletePage(id);
    if (!ok) {
      return apiResponse.badRequest('Cannot delete system pages (home, pricing, about)');
    }
    return apiResponse.success({ id }, 'Page deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Page');
  }
}
