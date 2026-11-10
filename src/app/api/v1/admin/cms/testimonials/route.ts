import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const items = await CmsRepository.getTestimonials();
    return apiResponse.success(items);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Testimonials');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (!body.name || !body.quote) {
      return apiResponse.badRequest('Customer name and quote are required');
    }

    const saved = await CmsRepository.saveTestimonial(body);
    return apiResponse.success(saved, 'Testimonial saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Testimonial');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing testimonial id');

    await CmsRepository.deleteTestimonial(id);
    return apiResponse.success({ id }, 'Testimonial deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Testimonial');
  }
}
