import React from 'react';
import { notFound } from 'next/navigation';
import { CmsRepository } from '@/lib/cms/repository';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const page = await CmsRepository.getPageBySlug(params.slug);
  if (!page) {
    return { title: 'Page Not Found | QuickPostly' };
  }
  return {
    title: page.metaTitle || `${page.title} | QuickPostly`,
    description: page.metaDescription || undefined,
    openGraph: page.ogImage ? { images: [{ url: page.ogImage }] } : undefined,
  };
}

export default async function DynamicCustomPage({ params }: Props) {
  const page = await CmsRepository.getPageBySlug(params.slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  const rawHtml = (page.contentJson?.bodyHtml as string) || '';
  const safeHtml = sanitizeHtml(rawHtml);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              {page.metaDescription}
            </p>
          )}
        </div>

        {safeHtml ? (
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-base sm:text-lg space-y-4"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {page.title}
            </h3>
            <p className="text-sm text-slate-500">
              This dynamic page is active and configured via the QuickPostly Administration Panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
