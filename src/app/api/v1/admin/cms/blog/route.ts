import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const [posts, categories] = await Promise.all([
      CmsRepository.getBlogPosts(),
      CmsRepository.getBlogCategories(),
    ]);
    return apiResponse.success({ posts, categories });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Blog Data');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (body.type === 'category') {
      if (!body.name) return apiResponse.badRequest('Category name is required');
      const cat = await CmsRepository.saveBlogCategory(body);
      return apiResponse.success(cat, 'Blog category saved');
    }

    if (!body.title || !body.excerpt || !body.contentHtml) {
      return apiResponse.badRequest('Article title, excerpt, and contentHtml are required');
    }

    const saved = await CmsRepository.saveBlogPost(body);
    return apiResponse.success(saved, 'Blog article saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Blog Post');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');
    const categoryId = searchParams.get('categoryId');

    if (categoryId) {
      await CmsRepository.deleteBlogCategory(categoryId);
      return apiResponse.success({ id: categoryId }, 'Blog category deleted');
    }

    if (!postId) return apiResponse.badRequest('Missing article id');
    await CmsRepository.deleteBlogPost(postId);
    return apiResponse.success({ id: postId }, 'Article deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Blog Item');
  }
}
