import React from 'react';
import Link from 'next/link';
import { CmsRepository } from '@/lib/cms/repository';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Calendar, ArrowRight, Eye, User } from 'lucide-react';

export const metadata = {
  title: 'Blog & Social Growth Playbooks | QuickPostly',
  description: 'Actionable strategies on category queuing, evergreen recycling, multi-network automation, and agency scaling with QuickPostly.',
};

export default async function PublicBlogPage() {
  const [posts, categories] = await Promise.all([
    CmsRepository.getBlogPosts({ status: 'PUBLISHED' }),
    CmsRepository.getBlogCategories(),
  ]);

  const featured = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Growth Playbooks & Research</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Master the Art of <span className="text-amber-500">Evergreen Socials</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Proven distribution playbooks, multi-network AI workflows, and agency operations from leading creators and SaaS teams.
          </p>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs font-semibold text-slate-500">Topics:</span>
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Post */}
        {featured && (
          <div className="mb-12 sm:mb-16">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-all hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 sm:p-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Featured Story</Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{featured.authorName}</p>
                        <p className="text-[11px] text-slate-500">{featured.authorRole}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                      Read Playbook <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {featured.featuredImage && (
                  <div className="lg:col-span-5 aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={featured.featuredImage}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gridPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-all hover:shadow-lg"
            >
              {post.featuredImage && (
                <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTimeMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views} views
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{post.authorName}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    Read &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
