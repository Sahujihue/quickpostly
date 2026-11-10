import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const faqs = await CmsRepository.getFaqs();
    return apiResponse.success(faqs);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get FAQs');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (!body.question || !body.answer) {
      return apiResponse.badRequest('FAQ question and answer are required');
    }

    const saved = await CmsRepository.saveFaq(body);
    return apiResponse.success(saved, 'FAQ item saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save FAQ');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing FAQ id');

    await CmsRepository.deleteFaq(id);
    return apiResponse.success({ id }, 'FAQ item deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete FAQ');
  }
}
