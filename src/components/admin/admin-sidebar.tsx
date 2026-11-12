'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Receipt,
  Cpu,
  Share2,
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
  Search,
  Mail,
  Bell,
  Lock,
  Activity,
  ArrowLeft,
  X,
  Tag,
  Settings,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

interface NavGroup {
  groupTitle: string;
  items: Array<{
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Core Platform',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Platform Analytics', path: '/admin/analytics', icon: Activity },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Staff Management', path: '/admin/staff', icon: ShieldCheck },
        { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
        { label: 'Plans & Pricing', path: '/admin/pricing', icon: Tag },
        { label: 'Transactions', path: '/admin/transactions', icon: Receipt },
        { label: 'Payment Gateways', path: '/admin/payments', icon: Wallet },
      ],
    },
    {
      groupTitle: 'Integrations & AI',
      items: [
        { label: 'AI Providers', path: '/admin/ai-providers', icon: Cpu },
        { label: 'Social Integrations', path: '/admin/integrations', icon: Share2 },
      ],
    },
    {
      groupTitle: 'Website Builder & CMS',
      items: [
        { label: 'Website Builder', path: '/admin/builder', icon: Globe },
        { label: 'Homepage Builder', path: '/admin/homepage', icon: Sliders },
        { label: 'Header Management', path: '/admin/header', icon: PanelTop },
        { label: 'Footer Management', path: '/admin/footer', icon: PanelBottom },
        { label: 'Custom Pages', path: '/admin/pages', icon: FileText },
        { label: 'Theme & Branding', path: '/admin/theme', icon: Palette },
      ],
    },
    {
      groupTitle: 'Content & Marketing',
      items: [
        { label: 'Blog Articles', path: '/admin/blog', icon: BookOpen },
        { label: 'Customer Reviews', path: '/admin/testimonials', icon: MessageSquareQuote },
        { label: 'FAQ Management', path: '/admin/faqs', icon: HelpCircle },
        { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
        { label: 'Notifications & Popups', path: '/admin/notifications', icon: Bell },
      ],
    },
    {
      groupTitle: 'Settings & Security',
      items: [
        { label: 'Admin Profile & Settings', path: '/admin/settings', icon: Settings },
        { label: 'SEO Settings', path: '/admin/seo', icon: Search },
        { label: 'Email & SMTP', path: '/admin/email', icon: Mail },
        { label: 'Security & Access', path: '/admin/security', icon: Lock },
        { label: 'Activity Logs', path: '/admin/logs', icon: Activity },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 transition-colors">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                QuickPostly <span className="text-amber-500 dark:text-amber-400">Admin</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Platform Control (25 Modules)</span>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Close admin sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Return */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to App Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}
