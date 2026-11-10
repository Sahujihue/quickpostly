'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  Sliders,
  PanelTop,
  PanelBottom,
  FileText,
  Palette,
  BookOpen,
  MessageSquareQuote,
  HelpCircle,
  Image as ImageIcon,
  Bell,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdminCmsHubPage() {
  const modules = [
    {
      title: 'Website Builder & Reordering',
      description: 'Drag, reorder, duplicate, and toggle live visibility for all homepage sections.',
      path: '/admin/builder',
      icon: Globe,
      badge: 'Core Engine',
    },
    {
      title: 'Homepage & Hero Studio',
      description: 'Edit above-the-fold copy, highlighted slogans, primary CTA, and trust points.',
      path: '/admin/homepage',
      icon: Sliders,
      badge: 'High Conversion',
    },
    {
      title: 'Header & Navigation',
      description: 'Upload logos, add/remove navbar links, configure sticky header and CTA buttons.',
      path: '/admin/header',
      icon: PanelTop,
    },
    {
      title: 'Footer & Columns',
      description: 'Brand description, custom link columns, official social handles, and newsletter.',
      path: '/admin/footer',
      icon: PanelBottom,
    },
    {
      title: 'Custom Dynamic Pages',
      description: 'Create SEO-optimized standalone pages with revisions and rollback protection.',
      path: '/admin/pages',
      icon: FileText,
      badge: 'Versioned',
    },
    {
      title: 'Theme, Fonts & Branding',
      description: 'Manage brand color palette, fonts, taglines, and custom CSS overrides.',
      path: '/admin/theme',
      icon: Palette,
    },
    {
      title: 'Blog & Content Playbooks',
      description: 'Author growth articles, categories, tags, author personas, and read times.',
      path: '/admin/blog',
      icon: BookOpen,
      badge: 'SEO Growth',
    },
    {
      title: 'Customer Testimonials',
      description: 'Publish client quotes, star ratings, case study metrics, and featured badges.',
      path: '/admin/testimonials',
      icon: MessageSquareQuote,
    },
    {
      title: 'FAQ Management',
      description: 'Create and organize accordion questions and answers by functional categories.',
      path: '/admin/faqs',
      icon: HelpCircle,
    },
    {
      title: 'Media Library',
      description: 'Upload, search, preview, organize, and manage image assets and alt tags.',
      path: '/admin/media',
      icon: ImageIcon,
    },
    {
      title: 'Announcements & Popups',
      description: 'Configure top ribbons, promotional modals, discount triggers, and date windows.',
      path: '/admin/notifications',
      icon: Bell,
      badge: 'Live Campaigns',
    },
    {
      title: 'Global SEO & Sitemap',
      description: 'Default title, description, OG image, Twitter card, robots.txt, and sitemap.xml.',
      path: '/admin/seo',
      icon: Search,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            <span>Complete Dynamic Website CMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Super Admin full control over all website content, design, menus, pricing, and SEO without source-code edits.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Preview Live Website</span>
        </Link>
      </div>

      {/* Grid of CMS modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              href={m.path}
              className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  {m.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                      {m.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {m.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Configure Module</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
