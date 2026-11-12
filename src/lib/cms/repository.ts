import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { sanitizeHtml } from '../sanitize';
import { getStoreFilePath, safeWriteJson } from '../storage-dir';

export interface CmsHeaderRecord {
  id: string;
  logoText: string;
  logoLight: string | null;
  logoDark: string | null;
  logoMobile: string | null;
  isSticky: boolean;
  showThemeToggle: boolean;
  showCtaButton: boolean;
  ctaText: string;
  ctaLink: string;
  showSignInButton: boolean;
  signInText: string;
  customCss: string | null;
  updatedAt: string;
}

export interface CmsFooterColumn {
  id: string;
  title: string;
  links: Array<{ label: string; url: string; openInNewTab?: boolean }>;
}

export interface CmsFooterRecord {
  id: string;
  brandDescription: string;
  copyrightText: string;
  columnsJson: CmsFooterColumn[];
  socialLinksJson: Record<string, string>;
  contactInfoJson: {
    supportEmail?: string;
    salesEmail?: string;
    phone?: string;
    address?: string;
  };
  newsletterTitle: string;
  newsletterSubtitle: string;
  showNewsletter: boolean;
  showSocialLinks: boolean;
  updatedAt: string;
}

export interface CmsNavigationItemRecord {
  id: string;
  menuLocation: 'HEADER' | 'FOOTER_PRIMARY' | 'FOOTER_LEGAL';
  label: string;
  path: string;
  openInNewTab: boolean;
  order: number;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSectionRecord {
  id: string;
  pageId: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  order: number;
  isVisible: boolean;
  contentJson: Record<string, unknown>;
  updatedAt: string;
}

export interface CmsPageRecord {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isSystemPage: boolean;
  contentJson: Record<string, unknown> | null;
  customCss: string | null;
  customJs: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections?: CmsSectionRecord[];
}

export interface CmsPageRevisionRecord {
  id: string;
  pageId: string;
  title: string;
  contentJson: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
}

export interface CmsPricingPlanRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  badge: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  limitsJson: Record<string, unknown> | null;
  isPopular: boolean;
  isActive: boolean;
  ctaText: string;
  ctaLink: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsTestimonialRecord {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string | null;
  rating: number;
  quote: string;
  metricResult: string | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsFaqItemRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogCategoryRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  featuredImage: string | null;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  categoryId: string | null;
  tagsJson: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  readingTimeMinutes: number;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  scheduledPublishAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsMediaItemRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export interface CmsAnnouncementRecord {
  id: string;
  title: string;
  content: string;
  type: 'BAR' | 'POPUP' | 'BANNER';
  position: 'TOP' | 'BOTTOM' | 'CENTER';
  ctaText: string | null;
  ctaLink: string | null;
  bgColor: string;
  textColor: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  targetAudience: 'ALL' | 'GUESTS' | 'USERS';
  createdAt: string;
  updatedAt: string;
}

export interface CmsThemeSettingRecord {
  id: string;
  siteName: string;
  tagLine: string;
  logoLight: string | null;
  logoDark: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  customCss: string | null;
  updatedAt: string;
}

export interface CmsSeoSettingRecord {
  id: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string | null;
  twitterCardType: string;
  twitterHandle: string;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
  robotsTxt: string | null;
  sitemapEnabled: boolean;
  updatedAt: string;
}

export interface CmsEmailSettingRecord {
  id: string;
  provider: 'SMTP' | 'RESEND' | 'SENDGRID' | 'POSTMARK';
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpSecure: boolean;
  updatedAt: string;
}

export interface CmsSecuritySettingRecord {
  id: string;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  enforce2FAForAdmin: boolean;
  sessionTimeoutHours: number;
  allowedIps: string | null;
  blockedIps: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  updatedAt: string;
}

interface LocalCmsStore {
  header: CmsHeaderRecord;
  footer: CmsFooterRecord;
  navItems: CmsNavigationItemRecord[];
  pages: CmsPageRecord[];
  sections: CmsSectionRecord[];
  revisions: CmsPageRevisionRecord[];
  pricingPlans: CmsPricingPlanRecord[];
  testimonials: CmsTestimonialRecord[];
  faqs: CmsFaqItemRecord[];
  blogCategories: CmsBlogCategoryRecord[];
  blogPosts: CmsBlogPostRecord[];
  mediaItems: CmsMediaItemRecord[];
  announcements: CmsAnnouncementRecord[];
  theme: CmsThemeSettingRecord;
  seo: CmsSeoSettingRecord;
  email: CmsEmailSettingRecord;
  security: CmsSecuritySettingRecord;
}

const STORE_FILE = getStoreFilePath('cms_store.json');

let memoryStore: LocalCmsStore | null = null;

function getInitialStore(): LocalCmsStore {
  const now = new Date().toISOString();

  return {
    header: {
      id: 'active_header',
      logoText: 'QuickPostly',
      logoLight: null,
      logoDark: null,
      logoMobile: null,
      isSticky: true,
      showThemeToggle: true,
      showCtaButton: true,
      ctaText: 'Start Free Trial',
      ctaLink: '/signup',
      showSignInButton: true,
      signInText: 'Sign In',
      customCss: null,
      updatedAt: now,
    },
    footer: {
      id: 'active_footer',
      brandDescription:
        'AI-Powered Social Media Management SaaS engineered for creators, modern agencies, and fast-growing businesses.',
      copyrightText: '© 2026 QuickPostly. All rights reserved. Create Smarter. Schedule Faster. Grow Everywhere.',
      columnsJson: [
        {
          id: 'col_product',
          title: 'Product',
          links: [
            { label: 'Category Scheduling', url: '/#features' },
            { label: 'AI Post Copilot', url: '/#ai-tools' },
            { label: 'Evergreen Recycling', url: '/#features' },
            { label: 'Social Inbox', url: '/#features' },
            { label: 'Pricing Plans', url: '/pricing' },
          ],
        },
        {
          id: 'col_resources',
          title: 'Resources',
          links: [
            { label: 'Knowledge Base & Blog', url: '/blog' },
            { label: 'Platform Status', url: '/api/health' },
            { label: 'Supported Integrations', url: '/#integrations' },
            { label: 'Agency White-Label', url: '/pricing' },
          ],
        },
        {
          id: 'col_company',
          title: 'Company',
          links: [
            { label: 'About QuickPostly', url: '/about' },
            { label: 'Contact Sales', url: '/contact' },
            { label: 'Privacy Policy', url: '/privacy' },
            { label: 'Terms of Service', url: '/terms' },
          ],
        },
      ],
      socialLinksJson: {
        twitter: 'https://twitter.com/QuickPostly',
        linkedin: 'https://linkedin.com/company/quickpostly',
        facebook: 'https://facebook.com/quickpostly',
        instagram: 'https://instagram.com/quickpostly',
        youtube: 'https://youtube.com/@quickpostly',
      },
      contactInfoJson: {
        supportEmail: 'support@quickpostly.com',
        salesEmail: 'sales@quickpostly.com',
        phone: '+1 (800) 555-0199',
        address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
      },
      newsletterTitle: 'Subscribe to Social Growth Weekly',
      newsletterSubtitle: 'Join 24,000+ marketers receiving evergreen distribution tactics every Tuesday.',
      showNewsletter: true,
      showSocialLinks: true,
      updatedAt: now,
    },
    navItems: [
      { id: 'nav_1', menuLocation: 'HEADER', label: 'Features', path: '/#features', openInNewTab: false, order: 1, parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'nav_2', menuLocation: 'HEADER', label: 'AI Studio', path: '/#ai-tools', openInNewTab: false, order: 2, parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'nav_3', menuLocation: 'HEADER', label: 'Integrations', path: '/#integrations', openInNewTab: false, order: 3, parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'nav_4', menuLocation: 'HEADER', label: 'Pricing', path: '/pricing', openInNewTab: false, order: 4, parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'nav_5', menuLocation: 'HEADER', label: 'Blog', path: '/blog', openInNewTab: false, order: 5, parentId: null, isActive: true, createdAt: now, updatedAt: now },
      { id: 'nav_6', menuLocation: 'HEADER', label: 'About', path: '/about', openInNewTab: false, order: 6, parentId: null, isActive: true, createdAt: now, updatedAt: now },
    ],
    pages: [
      {
        id: 'page_home',
        slug: 'home',
        title: 'Home - Intelligent Social Media Automation',
        metaTitle: 'QuickPostly – AI Social Media Management Platform',
        metaDescription: 'Put your social media on intelligent autopilot with category-based smart queuing and multi-network AI copilot.',
        ogImage: '/images/og-home.png',
        canonicalUrl: 'https://quickpostly.com',
        status: 'PUBLISHED',
        isSystemPage: true,
        contentJson: null,
        customCss: null,
        customJs: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'page_about',
        slug: 'about',
        title: 'About QuickPostly',
        metaTitle: 'About Us | QuickPostly SaaS',
        metaDescription: 'Learn about QuickPostly mission to help creators and businesses master social publishing with category-based automation.',
        ogImage: null,
        canonicalUrl: 'https://quickpostly.com/about',
        status: 'PUBLISHED',
        isSystemPage: true,
        contentJson: null,
        customCss: null,
        customJs: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'page_pricing',
        slug: 'pricing',
        title: 'Pricing & Plans',
        metaTitle: 'Transparent Pricing for Growth | QuickPostly',
        metaDescription: 'Explore flexible pricing plans for solo creators, fast-growing brands, and multi-client marketing agencies.',
        ogImage: null,
        canonicalUrl: 'https://quickpostly.com/pricing',
        status: 'PUBLISHED',
        isSystemPage: true,
        contentJson: null,
        customCss: null,
        customJs: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'page_privacy',
        slug: 'privacy',
        title: 'Privacy Policy',
        metaTitle: 'Privacy Policy | QuickPostly',
        metaDescription: 'Learn how QuickPostly collects, protects, and handles your data and social media tokens.',
        ogImage: null,
        canonicalUrl: 'https://quickpostly.com/privacy',
        status: 'PUBLISHED',
        isSystemPage: true,
        contentJson: {
          bodyHtml: `<h2>1. Introduction & Scope</h2>
<p>QuickPostly Technologies Inc. ("QuickPostly", "we", "us", or "our") is committed to protecting your privacy and ensuring transparency regarding how we handle your personal data. This Privacy Policy governs the collection, use, and disclosure of information obtained when you access or use our websites, APIs, and SaaS platform.</p>

<h2>2. Information We Collect</h2>
<ul>
  <li><strong>Account Information:</strong> Name, email address, password hash, company name, and billing details.</li>
  <li><strong>Social Media Profile Data & Tokens:</strong> Secure OAuth access tokens for X, LinkedIn, Facebook, Instagram, Pinterest, and TikTok.</li>
  <li><strong>User Content & Media:</strong> Post copy, hashtags, images, and videos uploaded to your queues.</li>
  <li><strong>Telemetry & Usage Data:</strong> IP addresses, browser types, and diagnostics for platform reliability.</li>
</ul>

<h2>3. How We Use Your Data</h2>
<p>We use your information exclusively to deliver category scheduling, authenticate users, execute AI drafting, and ensure API rate limit compliance.</p>

<h2>4. Social Network API Compliance</h2>
<p>QuickPostly adheres strictly to the Developer Terms and API policies of all connected social networks. We never sell your social tokens or follower analytics to data brokers.</p>

<h2>5. Security & Data Retention</h2>
<p>We employ AES-256 encryption for stored tokens and TLS 1.3 encryption in transit. OAuth tokens are immediately revoked upon account deletion.</p>

<h2>6. Contact Privacy Team</h2>
<p>Questions regarding our privacy practices? Contact us at <a href="mailto:support@quickpostly.com">support@quickpostly.com</a>.</p>`,
        },
        customCss: null,
        customJs: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'page_terms',
        slug: 'terms',
        title: 'Terms and Conditions',
        metaTitle: 'Terms and Conditions | QuickPostly',
        metaDescription: 'Terms of service, subscription policies, and legal agreements for QuickPostly SaaS.',
        ogImage: null,
        canonicalUrl: 'https://quickpostly.com/terms',
        status: 'PUBLISHED',
        isSystemPage: true,
        contentJson: {
          bodyHtml: `<h2>1. Agreement to Terms</h2>
<p>By accessing or creating an account on QuickPostly ("Service"), operated by QuickPostly Technologies Inc., you agree to be bound by these Terms and Conditions.</p>

<h2>2. User Accounts & Workspaces</h2>
<p>You must provide accurate information during registration. You are responsible for safeguarding your login credentials and maintaining the confidentiality of your workspace API keys.</p>

<h2>3. Acceptable Use Policy</h2>
<p>You agree not to use QuickPostly to violate third-party API policies, publish malicious content or unsolicited spam, or abuse automated queue frequencies.</p>

<h2>4. Subscriptions, Billing & Cancellations</h2>
<p>QuickPostly provides subscription services billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time from your billing dashboard.</p>

<h2>5. Intellectual Property & User Content</h2>
<p>You retain 100% full ownership of all text, media, graphics, and video content you schedule through QuickPostly.</p>

<h2>6. Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, QuickPostly Technologies Inc. shall not be liable for indirect damages resulting from third-party social media API downtime.</p>`,
        },
        customCss: null,
        customJs: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ],
    sections: [
      { id: 'sec_hero', pageId: 'page_home', sectionKey: 'hero', title: 'Hero Header', subtitle: 'Intelligent Category Queuing', order: 1, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_features', pageId: 'page_home', sectionKey: 'features', title: 'Core Features', subtitle: 'Publishing Engine', order: 2, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_ai', pageId: 'page_home', sectionKey: 'ai-tools', title: 'AI Copilot Suite', subtitle: 'Multi-network generation', order: 3, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_integrations', pageId: 'page_home', sectionKey: 'integrations', title: 'Official Integrations', subtitle: 'Certified API connections', order: 4, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_how', pageId: 'page_home', sectionKey: 'how-it-works', title: 'How It Works', subtitle: 'Four simple steps to autopilot', order: 5, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_pricing', pageId: 'page_home', sectionKey: 'pricing', title: 'Pricing Section', subtitle: 'Affordable commercial tiers', order: 6, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_testimonials', pageId: 'page_home', sectionKey: 'testimonials', title: 'Customer Reviews', subtitle: 'Verified social ROI', order: 7, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_faqs', pageId: 'page_home', sectionKey: 'faqs', title: 'Frequently Asked Questions', subtitle: 'Common platform questions', order: 8, isVisible: true, contentJson: {}, updatedAt: now },
      { id: 'sec_cta', pageId: 'page_home', sectionKey: 'cta', title: 'Closing Call To Action', subtitle: 'Free trial banner', order: 9, isVisible: true, contentJson: {}, updatedAt: now },
    ],
    revisions: [],
    pricingPlans: [
      {
        id: 'plan_free_trial',
        slug: 'free-trial',
        name: 'Free Trial',
        description: '14-day fully featured sandbox trial for exploring QuickPostly automation.',
        badge: '14 Days Free',
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',
        features: [
          '3 Social Media Profiles',
          '30 Scheduled Queue Slots',
          '25 AI Copilot Text Generations',
          '5 AI Social Image Credits',
          'Basic Performance Analytics (14 Days)',
          'Evergreen Category Recycling',
          'Single User Workspace',
        ],
        limitsJson: { maxSocialAccounts: 3, maxScheduledPosts: 30, aiGenerationsMonthly: 25, aiImageCreditsMonthly: 5, aiVideoCreditsMonthly: 0, maxTeamMembers: 1, maxWorkspaces: 1, maxClients: 0, storageMb: 500, analyticsRetentionDays: 14, hasSocialInbox: false },
        isPopular: false,
        isActive: true,
        ctaText: 'Start 14-Day Free Trial',
        ctaLink: '/signup?plan=free-trial',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'plan_starter',
        slug: 'starter',
        name: 'Starter',
        description: 'Perfect for content creators, solo entrepreneurs, and fast-growing individuals.',
        badge: 'Essential',
        monthlyPrice: 29,
        annualPrice: 24,
        currency: 'USD',
        features: [
          '5 Connected Social Accounts',
          '150 Scheduled Posts in Queue',
          '75 AI Text Generations / month',
          '15 AI Graphic Credits / month',
          '2 AI Video Clip Credits / month',
          '2 Team Member Seats',
          '1 Client Brand Portal',
          '2 GB Cloud Asset Storage',
          '30-Day Historical Analytics',
        ],
        limitsJson: { maxSocialAccounts: 5, maxScheduledPosts: 150, aiGenerationsMonthly: 75, aiImageCreditsMonthly: 15, aiVideoCreditsMonthly: 2, maxTeamMembers: 2, maxWorkspaces: 1, maxClients: 1, storageMb: 2048, analyticsRetentionDays: 30, hasSocialInbox: false },
        isPopular: false,
        isActive: true,
        ctaText: 'Get Started',
        ctaLink: '/signup?plan=starter',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'plan_professional',
        slug: 'professional',
        name: 'Professional',
        description: 'Engineered for high-performing brands, social marketers, and thriving teams.',
        badge: 'Most Popular',
        monthlyPrice: 79,
        annualPrice: 65,
        currency: 'USD',
        features: [
          '15 Connected Social Accounts',
          '750 Scheduled Posts in Queue',
          '300 AI Copilot Generations / mo',
          '60 AI Graphic Credits / mo',
          '15 AI Video Clip Credits / mo',
          '5 Team Member Seats',
          '3 Isolated Workspaces',
          '5 Dedicated Client Portals',
          'Unified Social Inbox (Comments & DMs)',
          '10 GB Cloud Asset Storage',
          '90-Day Advanced ROI Analytics',
        ],
        limitsJson: { maxSocialAccounts: 15, maxScheduledPosts: 750, aiGenerationsMonthly: 300, aiImageCreditsMonthly: 60, aiVideoCreditsMonthly: 15, maxTeamMembers: 5, maxWorkspaces: 3, maxClients: 5, storageMb: 10240, analyticsRetentionDays: 90, hasSocialInbox: true },
        isPopular: true,
        isActive: true,
        ctaText: 'Get Professional',
        ctaLink: '/signup?plan=professional',
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'plan_business',
        slug: 'business',
        name: 'Business',
        description: 'Engineered for scaling enterprises, multi-brand ventures, and high-frequency publishers.',
        badge: 'Best Value',
        monthlyPrice: 149,
        annualPrice: 119,
        currency: 'USD',
        features: [
          '35 Connected Social Accounts',
          '2,500 Scheduled Posts in Queue',
          '800 AI Generations / mo',
          '200 AI Graphic Credits / mo',
          '40 AI Video Clip Credits / mo',
          '15 Team Member Seats',
          '10 Isolated Workspaces',
          '15 Client Brand Portals',
          'Priority Multi-Network Inbox',
          'Client Review & Approval Workflows',
          '50 GB Cloud Asset Storage',
          '180-Day Analytics & CSV Export',
        ],
        limitsJson: { maxSocialAccounts: 35, maxScheduledPosts: 2500, aiGenerationsMonthly: 800, aiImageCreditsMonthly: 200, aiVideoCreditsMonthly: 40, maxTeamMembers: 15, maxWorkspaces: 10, maxClients: 15, storageMb: 51200, analyticsRetentionDays: 180, hasSocialInbox: true },
        isPopular: false,
        isActive: true,
        ctaText: 'Choose Business',
        ctaLink: '/signup?plan=business',
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'plan_agency',
        slug: 'agency',
        name: 'Agency',
        description: 'Unlimited agency scalability with white-label portals, client approvals, and bespoke quotas.',
        badge: 'Agency Scale',
        monthlyPrice: 299,
        annualPrice: 239,
        currency: 'USD',
        features: [
          '100 Connected Social Accounts',
          '10,000 Scheduled Posts in Queue',
          '2,500 AI Copilot Generations / mo',
          '600 AI Graphic Credits / mo',
          '120 AI Video Clip Credits / mo',
          '50 Team Member Seats',
          '30 Isolated Workspaces',
          '50 White-Label Client Portals',
          'Real-Time Omnichannel Social Inbox',
          'Custom Multi-Stage Approvals',
          '250 GB Cloud Asset Storage',
          '365-Day Historical Analytics & White-Label Reports',
          'Dedicated Slack Support & Account Executive',
        ],
        limitsJson: { maxSocialAccounts: 100, maxScheduledPosts: 10000, aiGenerationsMonthly: 2500, aiImageCreditsMonthly: 600, aiVideoCreditsMonthly: 120, maxTeamMembers: 50, maxWorkspaces: 30, maxClients: 50, storageMb: 256000, analyticsRetentionDays: 365, hasSocialInbox: true },
        isPopular: false,
        isActive: true,
        ctaText: 'Scale With Agency',
        ctaLink: '/signup?plan=agency',
        order: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
    testimonials: [
      {
        id: 'test_1',
        name: 'Elena Rostova',
        role: 'VP of Growth',
        company: 'NexaScale SaaS',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        quote: 'SocialHive reduced our team’s social content creation and scheduling time by 65%. The category-based queuing ensures our audience receives a healthy mix of educational insights and product announcements without daily manual spreadsheet planning.',
        metricResult: '+340% Reach in 90 Days',
        order: 1,
        isActive: true,
        isFeatured: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_2',
        name: 'Marcus Vance',
        role: 'Head of Social Marketing',
        company: 'OmniBrand Collective',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        quote: 'The evergreen recycling engine is a pure revenue driver. Our best-performing case studies and thought-leadership posts continue to generate inbound enterprise demo inquiries months after their initial creation.',
        metricResult: '18 hrs saved every week',
        order: 2,
        isActive: true,
        isFeatured: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test_3',
        name: 'Chloe Tremblay',
        role: 'Managing Director',
        company: 'Pulse Digital Agency',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        quote: 'Managing 16 client brands used to be a logistical nightmare of spreadsheets and missed approvals. SocialHive gives each client an isolated workspace with clear approval roles, saving us hundreds of hours monthly.',
        metricResult: '99.4% On-Time Publishing',
        order: 3,
        isActive: true,
        isFeatured: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    faqs: [
      {
        id: 'faq_1',
        category: 'Platform',
        question: 'How is SocialHive different from ordinary social media schedulers?',
        answer: 'Unlike generic chronological schedulers that require you to pick a time for every single post, SocialHive implements category-based content queuing. You organize posts by purpose (e.g. Evergreen, Curated, Promotional, Educational), and our scheduling engine automatically slots them into your optimized weekly timetable.',
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'faq_2',
        category: 'Features',
        question: 'What social media channels does SocialHive support?',
        answer: 'SocialHive connects directly to X (Twitter), LinkedIn Personal Profiles & Company Pages, Facebook Pages & Groups, Instagram Business & Creator accounts, Pinterest, TikTok, YouTube Community & Shorts, Threads, and Google Business Profiles.',
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'faq_3',
        category: 'Agencies',
        question: 'Can I manage multiple clients with custom approval flows?',
        answer: 'Yes! Our Agency tier gives you isolated workspaces for each client brand. You can invite client stakeholders with restricted "Viewer" or "Approver" roles, allowing them to review, comment on, and approve draft schedules before publication.',
        order: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'faq_4',
        category: 'Billing',
        question: 'Is there a free trial and can I cancel anytime?',
        answer: 'We offer an unrestricted 14-day free trial on all plans without requiring upfront contracts or credit cards. You can upgrade, downgrade, or cancel your subscription at any time directly through your workspace settings.',
        order: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'faq_5',
        category: 'Security',
        question: 'How does QuickPostly protect our social media credentials?',
        answer: 'QuickPostly never stores your actual account passwords. We utilize official OAuth 2.0 API integrations certified by Meta, LinkedIn, X, and Google, with bank-grade encryption at rest and in transit.',
        order: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    blogCategories: [
      { id: 'cat_strategy', slug: 'strategy', name: 'Social Strategy', description: 'Growth playbooks and distribution frameworks.', order: 1, createdAt: now, updatedAt: now },
      { id: 'cat_ai', slug: 'ai-automation', name: 'AI & Automation', description: 'Leveraging AI for high-speed multi-channel publishing.', order: 2, createdAt: now, updatedAt: now },
      { id: 'cat_agency', slug: 'agency-growth', name: 'Agency Operations', description: 'Scaling workflows, approvals, and client retention.', order: 3, createdAt: now, updatedAt: now },
    ],
    blogPosts: [
      {
        id: 'post_1',
        slug: 'category-based-social-queuing-guide',
        title: 'Why Category-Based Social Queuing Beats Chronological Scheduling',
        excerpt: 'Discover why top growth teams are abandoning manual calendar dates in favor of automated evergreen queues.',
        contentHtml: '<p>Scheduling individual social posts one by one is one of the highest friction activities in modern marketing. When a post fails to publish or a campaign priority shifts, manual calendars fall apart.</p><h2>The Core Principle of Content Queues</h2><p>By categorizing your content into predictable pillars—such as <strong>Evergreen Insights</strong>, <strong>Industry Highlights</strong>, and <strong>Product Demos</strong>—you establish a resilient publishing rhythm that runs on autopilot without daily oversight.</p><blockquote>Category scheduling decouples content ideation from publishing mechanics.</blockquote><p>Once you implement automated buffer recycling, evergreen content keeps generating qualified inbound pipeline indefinitely.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        authorName: 'Alex Mercer',
        authorAvatar: null,
        authorRole: 'Head of Content Strategy',
        categoryId: 'cat_strategy',
        tagsJson: ['Strategy', 'Automation', 'Evergreen'],
        status: 'PUBLISHED',
        readingTimeMinutes: 5,
        views: 1420,
        metaTitle: 'Category-Based Social Queuing Guide | SocialHive',
        metaDescription: 'Discover why top growth teams are abandoning manual calendar dates in favor of automated evergreen queues.',
        ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        scheduledPublishAt: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'post_2',
        slug: 'mastering-multi-network-ai-repurposing',
        title: 'Mastering Multi-Network AI Repurposing: From Longform to Viral Threads',
        excerpt: 'A step-by-step breakdown of how to transform a single blog post into 10 platform-tailored updates.',
        contentHtml: '<p>Every high-value blog post or customer case study contains at least a dozen distinct insights. Instead of sharing a bare link that gets algorithmically suppressed, top creators break it down into native visual carousels and concise threads.</p><h2>Adapting Voice for Each Platform</h2><ul><li><strong>LinkedIn:</strong> Focus on professional takeaways, operational lessons, and data proof-points.</li><li><strong>X (Twitter):</strong> Craft compelling opening hooks and crisp numbered threads.</li><li><strong>Instagram:</strong> Transform key takeaways into carousel slides with high readability.</li></ul>',
        featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        authorName: 'Elena Rostova',
        authorAvatar: null,
        authorRole: 'VP of Growth',
        categoryId: 'cat_ai',
        tagsJson: ['AI', 'Repurposing', 'Multi-Network'],
        status: 'PUBLISHED',
        readingTimeMinutes: 4,
        views: 980,
        metaTitle: 'Mastering Multi-Network AI Repurposing | SocialHive',
        metaDescription: 'Step-by-step framework to repurpose longform content into high-converting social updates.',
        ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        scheduledPublishAt: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'post_3',
        slug: 'agency-client-approval-workflows-that-scale',
        title: 'Eliminating the Feedback Loop: Agency Approval Workflows That Scale',
        excerpt: 'How to manage multi-client content approvals without endless email threads and missed deadlines.',
        contentHtml: '<p>When managing dozens of client brands, the single greatest bottleneck is client approvals. Traditional agencies drown in Google Docs, spreadsheet comment threads, and emergency Slack messages.</p><h2>Isolated Brand Workspaces with Role-Based Approvals</h2><p>By giving each client their own branded workspace with a designated <em>Approver</em> seat, clients can preview posts in their exact native format and give single-click approvals.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        authorName: 'Chloe Tremblay',
        authorAvatar: null,
        authorRole: 'Managing Director, Pulse Agency',
        categoryId: 'cat_agency',
        tagsJson: ['Agencies', 'Workflows', 'Productivity'],
        status: 'PUBLISHED',
        readingTimeMinutes: 6,
        views: 740,
        metaTitle: 'Agency Client Approval Workflows That Scale | SocialHive',
        metaDescription: 'How to manage multi-client content approvals without endless email threads and missed deadlines.',
        ogImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        scheduledPublishAt: null,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ],
    mediaItems: [
      {
        id: 'med_1',
        fileName: 'socialhive-dashboard-preview.png',
        fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/png',
        fileSize: 420000,
        width: 1920,
        height: 1080,
        altText: 'SocialHive Dashboard User Interface Preview',
        folder: 'product',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'med_2',
        fileName: 'ai-post-composer-modal.png',
        fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/png',
        fileSize: 310000,
        width: 1400,
        height: 900,
        altText: 'AI Multi-Platform Post Composer and Hook Generator',
        folder: 'features',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'med_3',
        fileName: 'agency-workspace-switcher.png',
        fileUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/png',
        fileSize: 285000,
        width: 1200,
        height: 800,
        altText: 'Multi-Tenant Agency Workspace Switcher',
        folder: 'agencies',
        createdAt: now,
        updatedAt: now,
      },
    ],
    announcements: [
      {
        id: 'ann_1',
        title: 'Spring Growth Special',
        content: '🎉 Spring Offer: Save 25% on Pro & Agency Annual plans with code SPRING25 at checkout!',
        type: 'BAR',
        position: 'TOP',
        ctaText: 'Claim Discount',
        ctaLink: '/pricing',
        bgColor: '#f59e0b',
        textColor: '#0f172a',
        startDate: null,
        endDate: null,
        isActive: true,
        targetAudience: 'ALL',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ann_2',
        title: 'Welcome to SocialHive 2.0',
        content: 'Experience our newly launched AI Thread Repurposer and Unified Social Inbox.',
        type: 'POPUP',
        position: 'CENTER',
        ctaText: 'See What’s New',
        ctaLink: '/blog/mastering-multi-network-ai-repurposing',
        bgColor: '#1e293b',
        textColor: '#ffffff',
        startDate: null,
        endDate: null,
        isActive: false,
        targetAudience: 'GUESTS',
        createdAt: now,
        updatedAt: now,
      },
    ],
    theme: {
      id: 'active_theme',
      siteName: 'QuickPostly',
      tagLine: 'Create Smarter. Schedule Faster. Grow Everywhere.',
      logoLight: null,
      logoDark: null,
      favicon: null,
      primaryColor: '#f59e0b',
      secondaryColor: '#0f172a',
      accentColor: '#6366f1',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      customCss: null,
      updatedAt: now,
    },
    seo: {
      id: 'active_seo',
      defaultMetaTitle: 'QuickPostly – AI Social Media Management Platform',
      defaultMetaDescription:
        'Create AI-powered social media content, schedule posts, manage multiple accounts and grow your brand with QuickPostly.',
      defaultOgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      twitterCardType: 'summary_large_image',
      twitterHandle: '@QuickPostly',
      googleAnalyticsId: 'G-QP7890ABCD',
      googleTagManagerId: null,
      facebookPixelId: null,
      robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nSitemap: https://quickpostly.com/sitemap.xml',
      sitemapEnabled: true,
      updatedAt: now,
    },
    email: {
      id: 'active_email',
      provider: 'SMTP',
      fromName: 'QuickPostly Notifications',
      fromEmail: 'notifications@quickpostly.com',
      replyToEmail: 'support@quickpostly.com',
      smtpHost: 'smtp.mailtrap.io',
      smtpPort: 587,
      smtpUser: 'quickpostly_smtp_dev',
      smtpPassword: 'dev_smtp_password_secure',
      smtpSecure: true,
      updatedAt: now,
    },
    security: {
      id: 'active_security',
      maxLoginAttempts: 5,
      lockoutMinutes: 15,
      enforce2FAForAdmin: true,
      sessionTimeoutHours: 168,
      allowedIps: null,
      blockedIps: null,
      maintenanceMode: false,
      maintenanceMessage:
        'QuickPostly is undergoing scheduled platform upgrades. We will be back online shortly.',
      updatedAt: now,
    },
  };
}

function ensureStoreInitialized(): LocalCmsStore {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(data) as LocalCmsStore;

      // Ensure Free Trial plan is always included in pricingPlans
      const initial = getInitialStore();
      const hasFree = memoryStore.pricingPlans?.some(
        (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
      );
      if (!hasFree && initial.pricingPlans?.length > 0) {
        const freeInit = initial.pricingPlans.find(
          (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
        );
        if (freeInit) {
          memoryStore.pricingPlans.unshift(freeInit);
          persistStore(memoryStore);
        }
      }

      // Ensure system pages like Privacy Policy and Terms and Conditions are present in pages
      let pagesModified = false;
      if (!memoryStore.pages) memoryStore.pages = [];
      for (const initPage of initial.pages) {
        const exists = memoryStore.pages.some((p) => p.slug === initPage.slug);
        if (!exists) {
          memoryStore.pages.push(initPage);
          pagesModified = true;
        }
      }
      if (pagesModified) {
        persistStore(memoryStore);
      }
    } else {
      memoryStore = getInitialStore();
      safeWriteJson(STORE_FILE, memoryStore);
    }
  } catch (err) {
    logger.error('Failed reading CMS local store, falling back to memory store', err);
    memoryStore = getInitialStore();
  }

  return memoryStore;
}

function persistStore(store: LocalCmsStore): void {
  safeWriteJson(STORE_FILE, store);
}

export class CmsRepository {
  // ===================== HEADER =====================
  public static async getHeaderSettings(): Promise<CmsHeaderRecord> {
    try {
      const header = await prisma.cmsHeaderSetting.findUnique({ where: { id: 'active_header' } });
      if (header) {
        return {
          id: header.id,
          logoText: header.logoText,
          logoLight: header.logoLight,
          logoDark: header.logoDark,
          logoMobile: header.logoMobile,
          isSticky: header.isSticky,
          showThemeToggle: header.showThemeToggle,
          showCtaButton: header.showCtaButton,
          ctaText: header.ctaText,
          ctaLink: header.ctaLink,
          showSignInButton: true,
          signInText: header.signInText,
          customCss: null,
          updatedAt: header.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.header;
  }

  public static async updateHeaderSettings(data: Partial<CmsHeaderRecord>): Promise<CmsHeaderRecord> {
    const now = new Date().toISOString();
    const store = ensureStoreInitialized();
    store.header = {
      ...store.header,
      ...data,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsHeaderSetting.upsert({
        where: { id: 'active_header' },
        create: {
          id: 'active_header',
          logoText: store.header.logoText,
          logoLight: store.header.logoLight,
          logoDark: store.header.logoDark,
          logoMobile: store.header.logoMobile,
          isSticky: store.header.isSticky,
          showThemeToggle: store.header.showThemeToggle,
          showCtaButton: store.header.showCtaButton,
          ctaText: store.header.ctaText,
          ctaLink: store.header.ctaLink,
          signInText: store.header.signInText,
          signInLink: '/login',
        },
        update: {
          logoText: store.header.logoText,
          logoLight: store.header.logoLight,
          logoDark: store.header.logoDark,
          logoMobile: store.header.logoMobile,
          isSticky: store.header.isSticky,
          showThemeToggle: store.header.showThemeToggle,
          showCtaButton: store.header.showCtaButton,
          ctaText: store.header.ctaText,
          ctaLink: store.header.ctaLink,
          signInText: store.header.signInText,
        },
      });
    } catch {
      // synced to store
    }

    return store.header;
  }

  // ===================== FOOTER =====================
  public static async getFooterSettings(): Promise<CmsFooterRecord> {
    try {
      const footer = await prisma.cmsFooterSetting.findUnique({ where: { id: 'active_footer' } });
      if (footer) {
        return {
          id: footer.id,
          brandDescription: footer.brandDescription,
          copyrightText: footer.copyrightText,
          columnsJson: (footer.columnsJson as unknown as CmsFooterColumn[]) || [],
          socialLinksJson: {
            twitter: footer.twitterUrl || '',
            linkedin: footer.linkedinUrl || '',
            facebook: footer.facebookUrl || '',
            instagram: footer.instagramUrl || '',
            youtube: footer.youtubeUrl || '',
          },
          contactInfoJson: {
            supportEmail: footer.contactEmail || undefined,
            phone: footer.contactPhone || undefined,
            address: footer.contactAddress || undefined,
          },
          newsletterTitle: footer.newsletterTitle,
          newsletterSubtitle: footer.newsletterSubtitle,
          showNewsletter: footer.newsletterEnabled,
          showSocialLinks: footer.showSocialLinks,
          updatedAt: footer.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.footer;
  }

  public static async updateFooterSettings(data: Partial<CmsFooterRecord>): Promise<CmsFooterRecord> {
    const now = new Date().toISOString();
    const store = ensureStoreInitialized();
    store.footer = {
      ...store.footer,
      ...data,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsFooterSetting.upsert({
        where: { id: 'active_footer' },
        create: {
          id: 'active_footer',
          brandDescription: store.footer.brandDescription,
          copyrightText: store.footer.copyrightText,
          contactEmail: store.footer.contactInfoJson?.supportEmail || null,
          contactPhone: store.footer.contactInfoJson?.phone || null,
          contactAddress: store.footer.contactInfoJson?.address || null,
          newsletterTitle: store.footer.newsletterTitle,
          newsletterSubtitle: store.footer.newsletterSubtitle,
          newsletterEnabled: store.footer.showNewsletter,
          showSocialLinks: store.footer.showSocialLinks,
          twitterUrl: store.footer.socialLinksJson?.twitter || null,
          linkedinUrl: store.footer.socialLinksJson?.linkedin || null,
          facebookUrl: store.footer.socialLinksJson?.facebook || null,
          instagramUrl: store.footer.socialLinksJson?.instagram || null,
          youtubeUrl: store.footer.socialLinksJson?.youtube || null,
          columnsJson: store.footer.columnsJson as object,
        },
        update: {
          brandDescription: store.footer.brandDescription,
          copyrightText: store.footer.copyrightText,
          contactEmail: store.footer.contactInfoJson?.supportEmail || null,
          contactPhone: store.footer.contactInfoJson?.phone || null,
          contactAddress: store.footer.contactInfoJson?.address || null,
          newsletterTitle: store.footer.newsletterTitle,
          newsletterSubtitle: store.footer.newsletterSubtitle,
          newsletterEnabled: store.footer.showNewsletter,
          showSocialLinks: store.footer.showSocialLinks,
          twitterUrl: store.footer.socialLinksJson?.twitter || null,
          linkedinUrl: store.footer.socialLinksJson?.linkedin || null,
          facebookUrl: store.footer.socialLinksJson?.facebook || null,
          instagramUrl: store.footer.socialLinksJson?.instagram || null,
          youtubeUrl: store.footer.socialLinksJson?.youtube || null,
          columnsJson: store.footer.columnsJson as object,
        },
      });
    } catch {
      // fallback
    }

    return store.footer;
  }

  // ===================== NAVIGATION =====================
  public static async getNavigationItems(location?: 'HEADER' | 'FOOTER_PRIMARY' | 'FOOTER_LEGAL'): Promise<CmsNavigationItemRecord[]> {
    try {
      const items = await prisma.cmsNavigationItem.findMany({
        where: location ? { menuLocation: location, isActive: true } : undefined,
        orderBy: { order: 'asc' },
      });
      if (items.length > 0) {
        return items.map((i) => ({
          id: i.id,
          menuLocation: i.menuLocation as CmsNavigationItemRecord['menuLocation'],
          label: i.label,
          path: i.path,
          openInNewTab: i.openInNewTab,
          order: i.order,
          parentId: i.parentId,
          isActive: i.isActive,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    const filtered = location
      ? store.navItems.filter((i) => i.menuLocation === location && i.isActive)
      : store.navItems;
    return filtered.sort((a, b) => a.order - b.order);
  }

  public static async saveNavigationItem(item: Partial<CmsNavigationItemRecord> & { label: string; path: string }): Promise<CmsNavigationItemRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    let record: CmsNavigationItemRecord;

    if (item.id) {
      const idx = store.navItems.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        store.navItems[idx] = {
          ...store.navItems[idx],
          ...item,
          updatedAt: now,
        };
        record = store.navItems[idx];
      } else {
        record = {
          id: item.id,
          menuLocation: item.menuLocation || 'HEADER',
          label: item.label,
          path: item.path,
          openInNewTab: item.openInNewTab ?? false,
          order: item.order ?? store.navItems.length + 1,
          parentId: item.parentId || null,
          isActive: item.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        };
        store.navItems.push(record);
      }
    } else {
      record = {
        id: `nav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        menuLocation: item.menuLocation || 'HEADER',
        label: item.label,
        path: item.path,
        openInNewTab: item.openInNewTab ?? false,
        order: item.order ?? store.navItems.length + 1,
        parentId: item.parentId || null,
        isActive: item.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      store.navItems.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsNavigationItem.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          menuLocation: record.menuLocation,
          label: record.label,
          path: record.path,
          openInNewTab: record.openInNewTab,
          order: record.order,
          parentId: record.parentId,
          isActive: record.isActive,
        },
        update: {
          menuLocation: record.menuLocation,
          label: record.label,
          path: record.path,
          openInNewTab: record.openInNewTab,
          order: record.order,
          parentId: record.parentId,
          isActive: record.isActive,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteNavigationItem(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.navItems = store.navItems.filter((i) => i.id !== id);
    persistStore(store);

    try {
      await prisma.cmsNavigationItem.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== SECTIONS & BUILDER =====================
  public static async getSections(pageId = 'page_home'): Promise<CmsSectionRecord[]> {
    try {
      const sections = await prisma.cmsSection.findMany({
        where: { pageId },
        orderBy: { order: 'asc' },
      });
      if (sections.length > 0) {
        return sections.map((s) => ({
          id: s.id,
          pageId: s.pageId,
          sectionKey: s.sectionKey,
          title: s.title || '',
          subtitle: s.subtitle || '',
          order: s.order,
          isVisible: s.isVisible,
          contentJson: (s.contentJson as Record<string, unknown>) || {},
          updatedAt: s.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.sections
      .filter((s) => s.pageId === pageId)
      .sort((a, b) => a.order - b.order);
  }

  public static async updateSection(id: string, updates: Partial<CmsSectionRecord>): Promise<CmsSectionRecord | null> {
    const store = ensureStoreInitialized();
    const idx = store.sections.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    store.sections[idx] = {
      ...store.sections[idx],
      ...updates,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsSection.update({
        where: { id },
        data: {
          title: updates.title,
          subtitle: updates.subtitle,
          order: updates.order,
          isVisible: updates.isVisible,
          contentJson: updates.contentJson as object,
        },
      });
    } catch {
      // local
    }

    return store.sections[idx];
  }

  public static async reorderSections(sectionOrders: Array<{ id: string; order: number }>): Promise<CmsSectionRecord[]> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();

    for (const item of sectionOrders) {
      const idx = store.sections.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        store.sections[idx].order = item.order;
        store.sections[idx].updatedAt = now;
      }
    }
    persistStore(store);

    try {
      for (const item of sectionOrders) {
        await prisma.cmsSection.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    } catch {
      // local
    }

    return store.sections.sort((a, b) => a.order - b.order);
  }

  public static async duplicateSection(id: string): Promise<CmsSectionRecord | null> {
    const store = ensureStoreInitialized();
    const target = store.sections.find((s) => s.id === id);
    if (!target) return null;

    const now = new Date().toISOString();
    const newSection: CmsSectionRecord = {
      ...target,
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${target.title} (Copy)`,
      order: target.order + 1,
      updatedAt: now,
    };

    store.sections.push(newSection);
    persistStore(store);
    return newSection;
  }

  public static async deleteSection(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.sections = store.sections.filter((s) => s.id !== id);
    persistStore(store);

    try {
      await prisma.cmsSection.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== PAGES & REVISIONS =====================
  public static async getPages(): Promise<CmsPageRecord[]> {
    try {
      const pages = await prisma.cmsPage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (pages.length > 0) {
        return pages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          ogImage: p.ogImage,
          canonicalUrl: p.canonicalUrl,
          status: p.status as CmsPageRecord['status'],
          isSystemPage: p.isSystemPage,
          contentJson: (p.contentJson as Record<string, unknown>) || null,
          customCss: p.customCss,
          customJs: p.customJs,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.pages;
  }

  public static async getPageBySlug(slug: string): Promise<CmsPageRecord | null> {
    try {
      const page = await prisma.cmsPage.findUnique({
        where: { slug },
        include: { sections: { orderBy: { order: 'asc' } } },
      });
      if (page) {
        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          ogImage: page.ogImage,
          canonicalUrl: page.canonicalUrl,
          status: page.status as CmsPageRecord['status'],
          isSystemPage: page.isSystemPage,
          contentJson: (page.contentJson as Record<string, unknown>) || null,
          customCss: page.customCss,
          customJs: page.customJs,
          publishedAt: page.publishedAt ? page.publishedAt.toISOString() : null,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString(),
          sections: page.sections.map((s) => ({
            id: s.id,
            pageId: s.pageId,
            sectionKey: s.sectionKey,
            title: s.title || '',
            subtitle: s.subtitle || '',
            order: s.order,
            isVisible: s.isVisible,
            contentJson: (s.contentJson as Record<string, unknown>) || {},
            updatedAt: s.updatedAt.toISOString(),
          })),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    const page = store.pages.find((p) => p.slug === slug);
    if (!page) return null;
    return {
      ...page,
      sections: store.sections.filter((s) => s.pageId === page.id).sort((a, b) => a.order - b.order),
    };
  }

  public static async savePage(data: Partial<CmsPageRecord> & { slug: string; title: string }): Promise<CmsPageRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    let record: CmsPageRecord;

    const existingIdx = store.pages.findIndex((p) => p.slug === data.slug || (data.id && p.id === data.id));

    if (existingIdx >= 0) {
      const prev = store.pages[existingIdx];
      if (prev.contentJson) {
        store.revisions.unshift({
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          pageId: prev.id,
          title: prev.title,
          contentJson: prev.contentJson,
          createdBy: 'Super Admin',
          createdAt: now,
        });
      }

      store.pages[existingIdx] = {
        ...prev,
        ...data,
        updatedAt: now,
        publishedAt: data.status === 'PUBLISHED' ? (prev.publishedAt || now) : prev.publishedAt,
      };
      record = store.pages[existingIdx];
    } else {
      record = {
        id: data.id || `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        slug: data.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        title: data.title,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
        status: data.status || 'PUBLISHED',
        isSystemPage: data.isSystemPage ?? false,
        contentJson: data.contentJson || null,
        customCss: data.customCss || null,
        customJs: null,
        publishedAt: data.status === 'PUBLISHED' ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      store.pages.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsPage.upsert({
        where: { slug: record.slug },
        create: {
          id: record.id,
          slug: record.slug,
          title: record.title,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          ogImage: record.ogImage,
          canonicalUrl: record.canonicalUrl,
          status: record.status,
          isSystemPage: record.isSystemPage,
          contentJson: record.contentJson as object,
          customCss: record.customCss,
          publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
        },
        update: {
          title: record.title,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          ogImage: record.ogImage,
          canonicalUrl: record.canonicalUrl,
          status: record.status,
          contentJson: record.contentJson as object,
          customCss: record.customCss,
          publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deletePage(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    const target = store.pages.find((p) => p.id === id);
    if (!target || target.isSystemPage) {
      return false;
    }
    store.pages = store.pages.filter((p) => p.id !== id);
    store.sections = store.sections.filter((s) => s.pageId !== id);
    persistStore(store);

    try {
      await prisma.cmsPage.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  public static async getPageRevisions(pageId: string): Promise<CmsPageRevisionRecord[]> {
    const store = ensureStoreInitialized();
    return store.revisions.filter((r) => r.pageId === pageId).slice(0, 20);
  }

  public static async rollbackPageRevision(revisionId: string): Promise<CmsPageRecord | null> {
    const store = ensureStoreInitialized();
    const rev = store.revisions.find((r) => r.id === revisionId);
    if (!rev) return null;

    const pageIdx = store.pages.findIndex((p) => p.id === rev.pageId);
    if (pageIdx === -1) return null;

    const now = new Date().toISOString();
    store.pages[pageIdx].contentJson = rev.contentJson;
    store.pages[pageIdx].title = rev.title;
    store.pages[pageIdx].updatedAt = now;
    persistStore(store);

    return store.pages[pageIdx];
  }

  // ===================== PRICING PLANS =====================
  public static async getPricingPlans(): Promise<CmsPricingPlanRecord[]> {
    const store = ensureStoreInitialized();
    try {
      const plans = await prisma.cmsPricingPlan.findMany({
        orderBy: { order: 'asc' },
      });
      if (plans.length > 0) {
        return plans.map((p) => {
          // If store or memory flag has explicit isActive state, merge it
          const storeMatch = store.pricingPlans.find((sp) => sp.id === p.id || sp.slug === p.slug);
          let isActive = storeMatch ? storeMatch.isActive : p.isActive;
          if (p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0) {
            if (typeof (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__ === 'boolean') {
              isActive = (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__;
            }
          }
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description,
            badge: p.badge,
            monthlyPrice: p.monthlyPrice,
            annualPrice: p.annualPrice,
            currency: p.currency,
            features: Array.isArray(p.features) ? (p.features as string[]) : [],
            limitsJson: (p.limitsJson as Record<string, unknown>) || null,
            isPopular: p.isPopular,
            isActive,
            ctaText: p.ctaText,
            ctaLink: p.ctaLink,
            order: p.order,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        });
      }
    } catch {
      // fallback
    }
    return store.pricingPlans.sort((a, b) => a.order - b.order);
  }

  public static async savePricingPlan(data: Partial<CmsPricingPlanRecord> & { name: string; monthlyPrice: number; annualPrice: number }): Promise<CmsPricingPlanRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
    let record: CmsPricingPlanRecord;

    const idx = store.pricingPlans.findIndex((p) => p.id === data.id || p.slug === slug);
    if (idx >= 0) {
      store.pricingPlans[idx] = {
        ...store.pricingPlans[idx],
        ...data,
        slug,
        updatedAt: now,
      };
      record = store.pricingPlans[idx];
    } else {
      record = {
        id: data.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slug,
        name: data.name,
        description: data.description || '',
        badge: data.badge || null,
        monthlyPrice: data.monthlyPrice,
        annualPrice: data.annualPrice,
        currency: data.currency || 'USD',
        features: data.features || [],
        limitsJson: data.limitsJson || null,
        isPopular: data.isPopular ?? false,
        isActive: data.isActive ?? true,
        ctaText: data.ctaText || 'Get Started',
        ctaLink: data.ctaLink || `/signup?plan=${slug}`,
        order: data.order ?? store.pricingPlans.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      store.pricingPlans.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsPricingPlan.upsert({
        where: { slug: record.slug },
        create: {
          id: record.id,
          slug: record.slug,
          name: record.name,
          description: record.description,
          badge: record.badge,
          monthlyPrice: record.monthlyPrice,
          annualPrice: record.annualPrice,
          currency: record.currency,
          features: record.features as object,
          limitsJson: record.limitsJson as object,
          isPopular: record.isPopular,
          isActive: record.isActive,
          ctaText: record.ctaText,
          ctaLink: record.ctaLink,
          order: record.order,
        },
        update: {
          name: record.name,
          description: record.description,
          badge: record.badge,
          monthlyPrice: record.monthlyPrice,
          annualPrice: record.annualPrice,
          currency: record.currency,
          features: record.features as object,
          limitsJson: record.limitsJson as object,
          isPopular: record.isPopular,
          isActive: record.isActive,
          ctaText: record.ctaText,
          ctaLink: record.ctaLink,
          order: record.order,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deletePricingPlan(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.pricingPlans = store.pricingPlans.filter((p) => p.id !== id);
    persistStore(store);

    try {
      await prisma.cmsPricingPlan.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  public static async togglePricingPlanActive(
    identifier: string,
    forceState?: boolean
  ): Promise<CmsPricingPlanRecord | null> {
    const store = ensureStoreInitialized();
    const cleanId = identifier.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const idx = store.pricingPlans.findIndex(
      (p) =>
        p.id === identifier ||
        p.slug === identifier ||
        p.slug === cleanId ||
        p.slug.replace(/_/g, '-') === identifier.replace(/_/g, '-') ||
        ((identifier.toLowerCase().includes('free') || identifier.toLowerCase().includes('trial')) &&
          (p.slug.includes('free') || p.slug.includes('trial') || p.monthlyPrice === 0))
    );
    if (idx < 0) return null;

    const newState = forceState !== undefined ? forceState : !store.pricingPlans[idx].isActive;
    store.pricingPlans[idx].isActive = newState;
    store.pricingPlans[idx].updatedAt = new Date().toISOString();

    const isFree =
      store.pricingPlans[idx].slug.includes('free') ||
      store.pricingPlans[idx].slug.includes('trial') ||
      store.pricingPlans[idx].monthlyPrice === 0;

    if (isFree) {
      (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__ = newState;
    }

    const updated = store.pricingPlans[idx];
    persistStore(store);

    try {
      await prisma.cmsPricingPlan.updateMany({
        where: {
          OR: [
            { id: updated.id },
            { slug: updated.slug },
            { slug: 'free-trial' },
            { slug: 'free_trial' },
            { monthlyPrice: 0 },
          ],
        },
        data: { isActive: newState },
      });
    } catch {
      // local fallback
    }

    return updated;
  }

  public static async isFreePlanActive(): Promise<boolean> {
    // 1. Check memory flag first (set dynamically by admin toggle)
    if (typeof (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__ === 'boolean') {
      return (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__;
    }

    // 2. Check memory / file store
    try {
      const store = ensureStoreInitialized();
      const freePlan = store.pricingPlans.find(
        (p) =>
          p.slug === 'free-trial' ||
          p.slug === 'free_trial' ||
          p.id === 'plan_free_trial' ||
          p.monthlyPrice === 0
      );
      if (freePlan && typeof freePlan.isActive === 'boolean') {
        return freePlan.isActive;
      }
    } catch {
      // fallback
    }

    // 3. Fallback to request cookie
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get('quickpostly_free_plan_active')?.value;
      if (cookieVal !== undefined) {
        return cookieVal === 'true' || cookieVal === '1';
      }
    } catch {
      // Outside request context
    }

    return true;
  }

  // ===================== TESTIMONIALS =====================
  public static async getTestimonials(): Promise<CmsTestimonialRecord[]> {
    try {
      const items = await prisma.cmsTestimonial.findMany({
        orderBy: { order: 'asc' },
      });
      if (items.length > 0) {
        return items.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          company: t.company,
          avatarUrl: t.avatarUrl,
          rating: t.rating,
          quote: t.quote,
          metricResult: t.metricResult,
          order: t.order,
          isActive: t.isActive,
          isFeatured: t.isFeatured,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.testimonials.sort((a, b) => a.order - b.order);
  }

  public static async saveTestimonial(data: Partial<CmsTestimonialRecord> & { name: string; quote: string }): Promise<CmsTestimonialRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    let record: CmsTestimonialRecord;

    const idx = data.id ? store.testimonials.findIndex((t) => t.id === data.id) : -1;
    if (idx >= 0) {
      store.testimonials[idx] = {
        ...store.testimonials[idx],
        ...data,
        updatedAt: now,
      };
      record = store.testimonials[idx];
    } else {
      record = {
        id: data.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: data.name,
        role: data.role || 'Verified Customer',
        company: data.company || 'Global Enterprise',
        avatarUrl: data.avatarUrl || null,
        rating: data.rating ?? 5,
        quote: data.quote,
        metricResult: data.metricResult || null,
        order: data.order ?? store.testimonials.length + 1,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        createdAt: now,
        updatedAt: now,
      };
      store.testimonials.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsTestimonial.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          name: record.name,
          role: record.role,
          company: record.company,
          avatarUrl: record.avatarUrl,
          rating: record.rating,
          quote: record.quote,
          metricResult: record.metricResult,
          order: record.order,
          isActive: record.isActive,
          isFeatured: record.isFeatured,
        },
        update: {
          name: record.name,
          role: record.role,
          company: record.company,
          avatarUrl: record.avatarUrl,
          rating: record.rating,
          quote: record.quote,
          metricResult: record.metricResult,
          order: record.order,
          isActive: record.isActive,
          isFeatured: record.isFeatured,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteTestimonial(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.testimonials = store.testimonials.filter((t) => t.id !== id);
    persistStore(store);

    try {
      await prisma.cmsTestimonial.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== FAQS =====================
  public static async getFaqs(): Promise<CmsFaqItemRecord[]> {
    try {
      const items = await prisma.cmsFaqItem.findMany({
        orderBy: { order: 'asc' },
      });
      if (items.length > 0) {
        return items.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category,
          order: f.order,
          isActive: f.isActive,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.faqs.sort((a, b) => a.order - b.order);
  }

  public static async saveFaq(data: Partial<CmsFaqItemRecord> & { question: string; answer: string }): Promise<CmsFaqItemRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    let record: CmsFaqItemRecord;

    const idx = data.id ? store.faqs.findIndex((f) => f.id === data.id) : -1;
    if (idx >= 0) {
      store.faqs[idx] = {
        ...store.faqs[idx],
        ...data,
        updatedAt: now,
      };
      record = store.faqs[idx];
    } else {
      record = {
        id: data.id || `faq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        question: data.question,
        answer: data.answer,
        category: data.category || 'General',
        order: data.order ?? store.faqs.length + 1,
        isActive: data.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      store.faqs.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsFaqItem.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          question: record.question,
          answer: record.answer,
          category: record.category,
          order: record.order,
          isActive: record.isActive,
        },
        update: {
          question: record.question,
          answer: record.answer,
          category: record.category,
          order: record.order,
          isActive: record.isActive,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteFaq(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.faqs = store.faqs.filter((f) => f.id !== id);
    persistStore(store);

    try {
      await prisma.cmsFaqItem.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== BLOG & CATEGORIES =====================
  public static async getBlogCategories(): Promise<CmsBlogCategoryRecord[]> {
    try {
      const cats = await prisma.cmsBlogCategory.findMany({
        orderBy: { order: 'asc' },
      });
      if (cats.length > 0) {
        return cats.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          order: c.order,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.blogCategories.sort((a, b) => a.order - b.order);
  }

  public static async saveBlogCategory(data: Partial<CmsBlogCategoryRecord> & { name: string }): Promise<CmsBlogCategoryRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]/g, '-');
    let record: CmsBlogCategoryRecord;

    const idx = store.blogCategories.findIndex((c) => c.id === data.id || c.slug === slug);
    if (idx >= 0) {
      store.blogCategories[idx] = {
        ...store.blogCategories[idx],
        ...data,
        slug,
        updatedAt: now,
      };
      record = store.blogCategories[idx];
    } else {
      record = {
        id: data.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slug,
        name: data.name,
        description: data.description || null,
        order: data.order ?? store.blogCategories.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      store.blogCategories.push(record);
    }
    persistStore(store);

    try {
      await prisma.cmsBlogCategory.upsert({
        where: { slug: record.slug },
        create: {
          id: record.id,
          slug: record.slug,
          name: record.name,
          description: record.description,
          order: record.order,
        },
        update: {
          name: record.name,
          description: record.description,
          order: record.order,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteBlogCategory(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.blogCategories = store.blogCategories.filter((c) => c.id !== id);
    persistStore(store);

    try {
      await prisma.cmsBlogCategory.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  public static async getBlogPosts(options?: { categorySlug?: string; status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'; limit?: number }): Promise<CmsBlogPostRecord[]> {
    try {
      const posts = await prisma.cmsBlogPost.findMany({
        where: {
          status: options?.status,
          category: options?.categorySlug ? { slug: options.categorySlug } : undefined,
        },
        take: options?.limit,
        orderBy: { publishedAt: 'desc' },
      });
      if (posts.length > 0) {
        return posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          contentHtml: p.contentHtml,
          featuredImage: p.featuredImage,
          authorName: p.authorName,
          authorAvatar: p.authorAvatar,
          authorRole: p.authorRole,
          categoryId: p.categoryId,
          tagsJson: (p.tagsJson as unknown as string[]) || [],
          status: p.status as CmsBlogPostRecord['status'],
          readingTimeMinutes: p.readingTimeMinutes,
          views: p.views,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          ogImage: p.ogImage,
          scheduledPublishAt: p.scheduledPublishAt ? p.scheduledPublishAt.toISOString() : null,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    let list = [...store.blogPosts];
    if (options?.status) {
      list = list.filter((p) => p.status === options.status);
    }
    if (options?.categorySlug) {
      const cat = store.blogCategories.find((c) => c.slug === options.categorySlug);
      if (cat) list = list.filter((p) => p.categoryId === cat.id);
    }
    list.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    return options?.limit ? list.slice(0, options.limit) : list;
  }

  public static async getBlogPostBySlug(slug: string): Promise<CmsBlogPostRecord | null> {
    try {
      const post = await prisma.cmsBlogPost.findUnique({ where: { slug } });
      if (post) {
        prisma.cmsBlogPost.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          contentHtml: post.contentHtml,
          featuredImage: post.featuredImage,
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          authorRole: post.authorRole,
          categoryId: post.categoryId,
          tagsJson: (post.tagsJson as unknown as string[]) || [],
          status: post.status as CmsBlogPostRecord['status'],
          readingTimeMinutes: post.readingTimeMinutes,
          views: post.views + 1,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          ogImage: post.ogImage,
          scheduledPublishAt: post.scheduledPublishAt ? post.scheduledPublishAt.toISOString() : null,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    const post = store.blogPosts.find((p) => p.slug === slug);
    if (post) {
      post.views += 1;
      persistStore(store);
      return post;
    }
    return null;
  }

  public static async saveBlogPost(data: Partial<CmsBlogPostRecord> & { title: string; excerpt: string; contentHtml: string }): Promise<CmsBlogPostRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    const slug = (data.slug || data.title).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const safeHtml = sanitizeHtml(data.contentHtml);
    let record: CmsBlogPostRecord;

    const idx = store.blogPosts.findIndex((p) => p.id === data.id || p.slug === slug);
    if (idx >= 0) {
      store.blogPosts[idx] = {
        ...store.blogPosts[idx],
        ...data,
        slug,
        contentHtml: safeHtml,
        updatedAt: now,
        publishedAt: data.status === 'PUBLISHED' ? (store.blogPosts[idx].publishedAt || now) : store.blogPosts[idx].publishedAt,
      };
      record = store.blogPosts[idx];
    } else {
      record = {
        id: data.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slug,
        title: data.title,
        excerpt: data.excerpt,
        contentHtml: safeHtml,
        featuredImage: data.featuredImage || null,
        authorName: data.authorName || 'SocialHive Editorial',
        authorAvatar: data.authorAvatar || null,
        authorRole: data.authorRole || 'Growth Strategist',
        categoryId: data.categoryId || null,
        tagsJson: data.tagsJson || ['Social Media', 'Marketing'],
        status: data.status || 'PUBLISHED',
        readingTimeMinutes: Math.max(1, Math.ceil(safeHtml.split(/\s+/).length / 200)),
        views: 0,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        ogImage: data.ogImage || data.featuredImage || null,
        scheduledPublishAt: data.scheduledPublishAt || null,
        publishedAt: data.status === 'PUBLISHED' ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      store.blogPosts.unshift(record);
    }
    persistStore(store);

    try {
      await prisma.cmsBlogPost.upsert({
        where: { slug: record.slug },
        create: {
          id: record.id,
          slug: record.slug,
          title: record.title,
          excerpt: record.excerpt,
          contentHtml: record.contentHtml,
          featuredImage: record.featuredImage,
          authorName: record.authorName,
          authorAvatar: record.authorAvatar,
          authorRole: record.authorRole,
          categoryId: record.categoryId,
          tagsJson: record.tagsJson as object,
          status: record.status,
          readingTimeMinutes: record.readingTimeMinutes,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          ogImage: record.ogImage,
          scheduledPublishAt: record.scheduledPublishAt ? new Date(record.scheduledPublishAt) : null,
          publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
        },
        update: {
          title: record.title,
          excerpt: record.excerpt,
          contentHtml: record.contentHtml,
          featuredImage: record.featuredImage,
          authorName: record.authorName,
          authorAvatar: record.authorAvatar,
          authorRole: record.authorRole,
          categoryId: record.categoryId,
          tagsJson: record.tagsJson as object,
          status: record.status,
          readingTimeMinutes: record.readingTimeMinutes,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          ogImage: record.ogImage,
          scheduledPublishAt: record.scheduledPublishAt ? new Date(record.scheduledPublishAt) : null,
          publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteBlogPost(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.blogPosts = store.blogPosts.filter((p) => p.id !== id);
    persistStore(store);

    try {
      await prisma.cmsBlogPost.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== MEDIA LIBRARY =====================
  public static async getMediaItems(query?: string): Promise<CmsMediaItemRecord[]> {
    try {
      const items = await prisma.cmsMediaItem.findMany({
        where: query
          ? {
              OR: [
                { fileName: { contains: query, mode: 'insensitive' } },
                { altText: { contains: query, mode: 'insensitive' } },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (items.length > 0) {
        return items.map((m) => ({
          id: m.id,
          fileName: m.fileName,
          fileUrl: m.fileUrl,
          mimeType: m.mimeType,
          fileSize: m.fileSize,
          width: m.width,
          height: m.height,
          altText: m.altText,
          folder: m.folder,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    if (!query) return store.mediaItems;
    const q = query.toLowerCase();
    return store.mediaItems.filter(
      (m) => m.fileName.toLowerCase().includes(q) || (m.altText && m.altText.toLowerCase().includes(q))
    );
  }

  public static async saveMediaItem(data: { fileName: string; fileUrl: string; mimeType: string; fileSize: number; width?: number; height?: number; altText?: string; folder?: string }): Promise<CmsMediaItemRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    const record: CmsMediaItemRecord = {
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      width: data.width || 1200,
      height: data.height || 800,
      altText: data.altText || data.fileName,
      folder: data.folder || 'uploads',
      createdAt: now,
      updatedAt: now,
    };
    store.mediaItems.unshift(record);
    persistStore(store);

    try {
      await prisma.cmsMediaItem.create({
        data: {
          id: record.id,
          fileName: record.fileName,
          fileUrl: record.fileUrl,
          mimeType: record.mimeType,
          fileSize: record.fileSize,
          width: record.width,
          height: record.height,
          altText: record.altText,
          folder: record.folder,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async updateMediaItem(id: string, updates: { fileName?: string; altText?: string; folder?: string }): Promise<CmsMediaItemRecord | null> {
    const store = ensureStoreInitialized();
    const idx = store.mediaItems.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    store.mediaItems[idx] = {
      ...store.mediaItems[idx],
      ...updates,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsMediaItem.update({
        where: { id },
        data: updates,
      });
    } catch {
      // local
    }

    return store.mediaItems[idx];
  }

  public static async deleteMediaItem(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.mediaItems = store.mediaItems.filter((m) => m.id !== id);
    persistStore(store);

    try {
      await prisma.cmsMediaItem.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== ANNOUNCEMENTS & POPUPS =====================
  public static async getAnnouncements(activeOnly = false): Promise<CmsAnnouncementRecord[]> {
    try {
      const items = await prisma.cmsAnnouncement.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (items.length > 0) {
        return items.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          type: a.type as CmsAnnouncementRecord['type'],
          position: a.position as CmsAnnouncementRecord['position'],
          ctaText: a.ctaText,
          ctaLink: a.ctaLink,
          bgColor: a.bgColor,
          textColor: a.textColor,
          startDate: a.startDate ? a.startDate.toISOString() : null,
          endDate: a.endDate ? a.endDate.toISOString() : null,
          isActive: a.isActive,
          targetAudience: a.targetAudience as CmsAnnouncementRecord['targetAudience'],
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    if (activeOnly) {
      const now = new Date();
      return store.announcements.filter((a) => {
        if (!a.isActive) return false;
        if (a.startDate && new Date(a.startDate) > now) return false;
        if (a.endDate && new Date(a.endDate) < now) return false;
        return true;
      });
    }
    return store.announcements;
  }

  public static async saveAnnouncement(data: Partial<CmsAnnouncementRecord> & { title: string; content: string }): Promise<CmsAnnouncementRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    let record: CmsAnnouncementRecord;

    const idx = data.id ? store.announcements.findIndex((a) => a.id === data.id) : -1;
    if (idx >= 0) {
      store.announcements[idx] = {
        ...store.announcements[idx],
        ...data,
        updatedAt: now,
      };
      record = store.announcements[idx];
    } else {
      record = {
        id: data.id || `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title,
        content: data.content,
        type: data.type || 'BAR',
        position: data.position || 'TOP',
        ctaText: data.ctaText || null,
        ctaLink: data.ctaLink || null,
        bgColor: data.bgColor || '#f59e0b',
        textColor: data.textColor || '#0f172a',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        isActive: data.isActive ?? true,
        targetAudience: data.targetAudience || 'ALL',
        createdAt: now,
        updatedAt: now,
      };
      store.announcements.unshift(record);
    }
    persistStore(store);

    try {
      await prisma.cmsAnnouncement.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          title: record.title,
          content: record.content,
          type: record.type,
          position: record.position,
          ctaText: record.ctaText,
          ctaLink: record.ctaLink,
          bgColor: record.bgColor,
          textColor: record.textColor,
          startDate: record.startDate ? new Date(record.startDate) : null,
          endDate: record.endDate ? new Date(record.endDate) : null,
          isActive: record.isActive,
          targetAudience: record.targetAudience,
        },
        update: {
          title: record.title,
          content: record.content,
          type: record.type,
          position: record.position,
          ctaText: record.ctaText,
          ctaLink: record.ctaLink,
          bgColor: record.bgColor,
          textColor: record.textColor,
          startDate: record.startDate ? new Date(record.startDate) : null,
          endDate: record.endDate ? new Date(record.endDate) : null,
          isActive: record.isActive,
          targetAudience: record.targetAudience,
        },
      });
    } catch {
      // local
    }

    return record;
  }

  public static async deleteAnnouncement(id: string): Promise<boolean> {
    const store = ensureStoreInitialized();
    store.announcements = store.announcements.filter((a) => a.id !== id);
    persistStore(store);

    try {
      await prisma.cmsAnnouncement.delete({ where: { id } });
    } catch {
      // local
    }
    return true;
  }

  // ===================== THEME & BRANDING =====================
  public static async getThemeSettings(): Promise<CmsThemeSettingRecord> {
    try {
      const theme = await prisma.cmsThemeSetting.findUnique({ where: { id: 'active_theme' } });
      if (theme) {
        return {
          id: theme.id,
          siteName: theme.siteName,
          tagLine: theme.tagLine || 'Data-Driven Social Media Management & Smart Queuing',
          logoLight: theme.logoLight,
          logoDark: theme.logoDark,
          favicon: theme.favicon,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          fontHeading: theme.fontHeading,
          fontBody: theme.fontBody,
          customCss: theme.customCss,
          updatedAt: theme.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.theme;
  }

  public static async updateThemeSettings(data: Partial<CmsThemeSettingRecord>): Promise<CmsThemeSettingRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    store.theme = {
      ...store.theme,
      ...data,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsThemeSetting.upsert({
        where: { id: 'active_theme' },
        create: {
          id: 'active_theme',
          siteName: store.theme.siteName,
          tagLine: store.theme.tagLine,
          logoLight: store.theme.logoLight,
          logoDark: store.theme.logoDark,
          favicon: store.theme.favicon,
          primaryColor: store.theme.primaryColor,
          secondaryColor: store.theme.secondaryColor,
          accentColor: store.theme.accentColor,
          fontHeading: store.theme.fontHeading,
          fontBody: store.theme.fontBody,
          customCss: store.theme.customCss,
        },
        update: {
          siteName: store.theme.siteName,
          tagLine: store.theme.tagLine,
          logoLight: store.theme.logoLight,
          logoDark: store.theme.logoDark,
          favicon: store.theme.favicon,
          primaryColor: store.theme.primaryColor,
          secondaryColor: store.theme.secondaryColor,
          accentColor: store.theme.accentColor,
          fontHeading: store.theme.fontHeading,
          fontBody: store.theme.fontBody,
          customCss: store.theme.customCss,
        },
      });
    } catch {
      // local
    }

    return store.theme;
  }

  // ===================== SEO =====================
  public static async getSeoSettings(): Promise<CmsSeoSettingRecord> {
    try {
      const seo = await prisma.cmsSeoSetting.findUnique({ where: { id: 'active_seo' } });
      if (seo) {
        return {
          id: seo.id,
          defaultMetaTitle: seo.defaultMetaTitle,
          defaultMetaDescription: seo.defaultMetaDescription,
          defaultOgImage: seo.defaultOgImage,
          twitterCardType: seo.twitterCardType,
          twitterHandle: seo.twitterHandle || '@SocialHiveHQ',
          googleAnalyticsId: seo.googleAnalyticsId,
          googleTagManagerId: seo.googleTagManagerId,
          facebookPixelId: seo.facebookPixelId,
          robotsTxt: seo.robotsTxt,
          sitemapEnabled: seo.sitemapEnabled,
          updatedAt: seo.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.seo;
  }

  public static async updateSeoSettings(data: Partial<CmsSeoSettingRecord>): Promise<CmsSeoSettingRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    store.seo = {
      ...store.seo,
      ...data,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsSeoSetting.upsert({
        where: { id: 'active_seo' },
        create: {
          id: 'active_seo',
          defaultMetaTitle: store.seo.defaultMetaTitle,
          defaultMetaDescription: store.seo.defaultMetaDescription,
          defaultOgImage: store.seo.defaultOgImage,
          twitterCardType: store.seo.twitterCardType,
          twitterHandle: store.seo.twitterHandle,
          googleAnalyticsId: store.seo.googleAnalyticsId,
          googleTagManagerId: store.seo.googleTagManagerId,
          facebookPixelId: store.seo.facebookPixelId,
          robotsTxt: store.seo.robotsTxt,
          sitemapEnabled: store.seo.sitemapEnabled,
        },
        update: {
          defaultMetaTitle: store.seo.defaultMetaTitle,
          defaultMetaDescription: store.seo.defaultMetaDescription,
          defaultOgImage: store.seo.defaultOgImage,
          twitterCardType: store.seo.twitterCardType,
          twitterHandle: store.seo.twitterHandle,
          googleAnalyticsId: store.seo.googleAnalyticsId,
          googleTagManagerId: store.seo.googleTagManagerId,
          facebookPixelId: store.seo.facebookPixelId,
          robotsTxt: store.seo.robotsTxt,
          sitemapEnabled: store.seo.sitemapEnabled,
        },
      });
    } catch {
      // local
    }

    return store.seo;
  }

  // ===================== EMAIL & SMTP =====================
  public static async getEmailSettings(): Promise<CmsEmailSettingRecord> {
    try {
      const email = await prisma.cmsEmailSetting.findUnique({ where: { id: 'active_email' } });
      if (email) {
        return {
          id: email.id,
          provider: email.provider as CmsEmailSettingRecord['provider'],
          fromName: email.fromName,
          fromEmail: email.fromEmail,
          replyToEmail: email.replyToEmail,
          smtpHost: email.smtpHost,
          smtpPort: email.smtpPort,
          smtpUser: email.smtpUser,
          smtpPassword: email.smtpPassword,
          smtpSecure: email.smtpSecure,
          updatedAt: email.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.email;
  }

  public static async updateEmailSettings(data: Partial<CmsEmailSettingRecord>): Promise<CmsEmailSettingRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    store.email = {
      ...store.email,
      ...data,
      updatedAt: now,
    };
    persistStore(store);

    try {
      await prisma.cmsEmailSetting.upsert({
        where: { id: 'active_email' },
        create: {
          id: 'active_email',
          provider: store.email.provider,
          fromName: store.email.fromName,
          fromEmail: store.email.fromEmail,
          replyToEmail: store.email.replyToEmail,
          smtpHost: store.email.smtpHost,
          smtpPort: store.email.smtpPort,
          smtpUser: store.email.smtpUser,
          smtpPassword: store.email.smtpPassword,
          smtpSecure: store.email.smtpSecure,
        },
        update: {
          provider: store.email.provider,
          fromName: store.email.fromName,
          fromEmail: store.email.fromEmail,
          replyToEmail: store.email.replyToEmail,
          smtpHost: store.email.smtpHost,
          smtpPort: store.email.smtpPort,
          smtpUser: store.email.smtpUser,
          smtpPassword: store.email.smtpPassword,
          smtpSecure: store.email.smtpSecure,
        },
      });
    } catch {
      // local
    }

    return store.email;
  }

  // ===================== SECURITY =====================
  public static async getSecuritySettings(): Promise<CmsSecuritySettingRecord> {
    try {
      const security = await prisma.cmsSecuritySetting.findUnique({ where: { id: 'active_security' } });
      if (security) {
        return {
          id: security.id,
          maxLoginAttempts: security.maxLoginAttempts,
          lockoutMinutes: security.lockoutMinutes,
          enforce2FAForAdmin: security.enforce2FAForAdmin,
          sessionTimeoutHours: security.sessionTimeoutHours,
          allowedIps: security.allowedIps,
          blockedIps: security.blockedIps,
          maintenanceMode: security.maintenanceMode,
          maintenanceMessage: security.maintenanceMessage,
          updatedAt: security.updatedAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    const store = ensureStoreInitialized();
    return store.security;
  }

  public static async updateSecuritySettings(data: Partial<CmsSecuritySettingRecord>): Promise<CmsSecuritySettingRecord> {
    const store = ensureStoreInitialized();
    const now = new Date().toISOString();
    store.security = {
      ...store.security,
      ...data,
      updatedAt: now,
    };

    if (data.maintenanceMode !== undefined) {
      (globalThis as any).__QUICKPOSTLY_MAINTENANCE_MODE__ = Boolean(data.maintenanceMode);
    }
    if (data.maintenanceMessage !== undefined) {
      (globalThis as any).__QUICKPOSTLY_MAINTENANCE_MESSAGE__ = data.maintenanceMessage;
    }

    persistStore(store);

    try {
      await prisma.cmsSecuritySetting.upsert({
        where: { id: 'active_security' },
        create: {
          id: 'active_security',
          maxLoginAttempts: store.security.maxLoginAttempts,
          lockoutMinutes: store.security.lockoutMinutes,
          enforce2FAForAdmin: store.security.enforce2FAForAdmin,
          sessionTimeoutHours: store.security.sessionTimeoutHours,
          allowedIps: store.security.allowedIps,
          blockedIps: store.security.blockedIps,
          maintenanceMode: store.security.maintenanceMode,
          maintenanceMessage: store.security.maintenanceMessage,
        },
        update: {
          maxLoginAttempts: store.security.maxLoginAttempts,
          lockoutMinutes: store.security.lockoutMinutes,
          enforce2FAForAdmin: store.security.enforce2FAForAdmin,
          sessionTimeoutHours: store.security.sessionTimeoutHours,
          allowedIps: store.security.allowedIps,
          blockedIps: store.security.blockedIps,
          maintenanceMode: store.security.maintenanceMode,
          maintenanceMessage: store.security.maintenanceMessage,
        },
      });
    } catch {
      // local
    }

    return store.security;
  }

  public static async isMaintenanceMode(): Promise<{ enabled: boolean; message: string | null }> {
    // 1. Check request cookie from Next.js headers if in SSR context
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get('quickpostly_maintenance_mode')?.value;
      if (cookieVal !== undefined) {
        const store = ensureStoreInitialized();
        return {
          enabled: cookieVal === 'true' || cookieVal === '1',
          message:
            store.security?.maintenanceMessage ||
            'QuickPostly is undergoing scheduled platform upgrades. We will be back online shortly.',
        };
      }
    } catch {
      // Outside request context
    }

    // 2. Check global memory flag
    if (typeof (globalThis as any).__QUICKPOSTLY_MAINTENANCE_MODE__ === 'boolean') {
      return {
        enabled: (globalThis as any).__QUICKPOSTLY_MAINTENANCE_MODE__,
        message:
          (globalThis as any).__QUICKPOSTLY_MAINTENANCE_MESSAGE__ ||
          'QuickPostly is undergoing scheduled platform upgrades. We will be back online shortly.',
      };
    }

    // 3. Check memory / file store
    try {
      const store = ensureStoreInitialized();
      if (store.security) {
        return {
          enabled: Boolean(store.security.maintenanceMode),
          message:
            store.security.maintenanceMessage ||
            'QuickPostly is undergoing scheduled platform upgrades. We will be back online shortly.',
        };
      }
    } catch {
      // fallback
    }

    return {
      enabled: false,
      message: null,
    };
  }
}
