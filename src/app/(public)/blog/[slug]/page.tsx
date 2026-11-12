import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CmsRepository } from '@/lib/cms/repository';
import { sanitizeHtml } from '@/lib/sanitize';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Eye, Calendar, User, Share2, Sparkles } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const post = await CmsRepository.getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found | QuickPostly' };
  }
  return {
    title: `${post.metaTitle || post.title} | QuickPostly Blog`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.ogImage ? [{ url: post.ogImage }] : undefined,
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const [post, isFreePlanActive] = await Promise.all([
    CmsRepository.getBlogPostBySlug(params.slug),
    CmsRepository.isFreePlanActive(),
  ]);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  const safeContent = sanitizeHtml(post.contentHtml);
  const recentPosts = (await CmsRepository.getBlogPosts({ limit: 4, status: 'PUBLISHED' })).filter(
    (p) => p.slug !== post.slug
  );
  const ctaText = isFreePlanActive ? 'Start Free 14-Day Trial' : 'Get Started Now';
  const ctaLink = isFreePlanActive ? '/signup?plan=free-trial' : '/pricing';

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog & Playbooks</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="warning">Growth Playbook</Badge>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTimeMinutes} min read
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.views} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light">
            {post.excerpt}
          </p>

          {/* Author metadata */}
          <div className="pt-4 flex items-center justify-between border-t border-b border-slate-200 dark:border-slate-800 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</p>
                <p className="text-xs text-slate-500">{post.authorRole}</p>
              </div>
            </div>
            {post.publishedAt && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-10 shadow-lg">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body - Safe Render */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-base sm:text-lg space-y-4"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* Tags */}
        {post.tagsJson && post.tagsJson.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filed under:</span>
            {post.tagsJson.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Card */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Put these social strategies on autopilot today
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            QuickPostly helps growth teams organize categories, draft multi-network variants with AI, and recycle evergreen winners automatically.
          </p>
          <div className="pt-2">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/25 transition-transform active:scale-95"
            >
              {ctaText}
            </Link>
          </div>
        </div>

        {/* More Articles */}
        {recentPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              More Growth Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentPosts.slice(0, 2).map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors group"
                >
                  <p className="text-xs text-amber-500 font-bold mb-1">{rp.readingTimeMinutes} min read</p>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                    {rp.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
