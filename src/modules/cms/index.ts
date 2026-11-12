import { CmsRepository, CmsHeaderRecord, CmsFooterRecord, CmsBlogPostRecord, CmsAnnouncementRecord } from '@/lib/cms/repository';
import {
  NavItem,
  PricingPlanDto,
  FaqItemDto,
  ThemeSettingsDto,
  SeoSettingsDto,
  HeroSectionDto,
  FeatureItemDto,
  AiToolDto,
  SocialIntegrationDto,
  HowItWorksStepDto,
  TestimonialDto,
  CtaBannerDto,
  HomepageContentDto,
} from './types';

export const DEFAULT_HEADER_NAV: NavItem[] = [
  { id: '1', label: 'Features', path: '/#features', order: 1 },
  { id: '2', label: 'AI Studio', path: '/#ai-tools', order: 2 },
  { id: '3', label: 'Integrations', path: '/#integrations', order: 3 },
  { id: '4', label: 'Pricing', path: '/pricing', order: 4 },
  { id: '5', label: 'Blog', path: '/blog', order: 5 },
  { id: '6', label: 'About', path: '/about', order: 6 },
];

export const DEFAULT_FOOTER_PRIMARY_NAV: NavItem[] = [
  { id: '10', label: 'Platform Features', path: '/#features', order: 1 },
  { id: '11', label: 'Category Scheduling', path: '/#features', order: 2 },
  { id: '12', label: 'AI Content Studio', path: '/#ai-tools', order: 3 },
  { id: '13', label: 'Social Integrations', path: '/#integrations', order: 4 },
  { id: '14', label: 'Pricing Plans', path: '/pricing', order: 5 },
  { id: '15', label: 'About SocialHive', path: '/about', order: 6 },
  { id: '16', label: 'Contact & Sales', path: '/contact', order: 7 },
];

export const DEFAULT_FOOTER_LEGAL_NAV: NavItem[] = [
  { id: '20', label: 'Privacy Policy', path: '/privacy', order: 1 },
  { id: '21', label: 'Terms & Conditions', path: '/terms', order: 2 },
];

export const DEFAULT_HERO_CONTENT: HeroSectionDto = {
  badgeText: 'Intelligent Category Queuing + Multi-Channel AI Copilot',
  headlinePrefix: 'Put your social media on ',
  highlightedPhrase: 'intelligent autopilot',
  headlineSuffix: '',
  description:
    'Organize posts into strategic content categories, automate balanced publishing slots, recycle your highest-performing evergreen content, and manage multi-client approval workflows without daily stress.',
  primaryCtaText: 'Start Free 14-Day Trial',
  primaryCtaLink: '/signup',
  secondaryCtaText: 'Explore App Dashboard',
  secondaryCtaLink: '/dashboard',
  trustPoints: [
    'No credit card required',
    '14-day full feature trial',
    'Cancel in 1-click anytime',
    'Official social API certified',
  ],
};

export const DEFAULT_FEATURES: FeatureItemDto[] = [
  {
    id: 'feat_1',
    title: 'Category-Based Smart Queuing',
    description:
      'Organize your social calendar into purposeful buckets—Evergreen Insights, Curated Industry News, Product Promo, and Culture. Your schedule remains balanced automatically.',
    iconName: 'Layers',
    category: 'Publishing',
    badge: 'Core Engine',
  },
  {
    id: 'feat_2',
    title: 'Evergreen Content Recycling',
    description:
      'Automatically re-queue your top-performing posts with configurable expiration counters and cooldown buffers so your feeds stay consistently active without spamming.',
    iconName: 'Repeat',
    category: 'Automation',
    badge: 'High ROI',
  },
  {
    id: 'feat_3',
    title: 'Multi-Network Post Composer',
    description:
      'Craft content once and preview native styling across X, LinkedIn, Facebook, Instagram, TikTok, and Pinterest simultaneously with network-specific character count validation.',
    iconName: 'Send',
    category: 'Publishing',
  },
  {
    id: 'feat_4',
    title: 'Multi-Tenant Agency Workspaces',
    description:
      'Isolate brand accounts, content libraries, and team members per workspace. Invite client stakeholders with restricted Approver or Viewer permissions for frictionless sign-offs.',
    iconName: 'Building2',
    category: 'Agencies',
    badge: 'For Agencies',
  },
  {
    id: 'feat_5',
    title: 'Unified Social Inbox',
    description:
      'Never miss a prospect. Monitor and respond to comments, direct messages, and brand mentions across all connected accounts from a centralized, high-speed conversation feed.',
    iconName: 'MessageSquare',
    category: 'Engagement',
  },
  {
    id: 'feat_6',
    title: 'Audience & Category Analytics',
    description:
      'Gain clear insights into which content categories drive the highest engagement, follower growth, and click-through rates. Export executive-ready white-labeled PDF reports.',
    iconName: 'BarChart3',
    category: 'Analytics',
  },
];

export const DEFAULT_AI_TOOLS: AiToolDto[] = [
  {
    id: 'ai_1',
    name: 'AI Multi-Format Post Copilot',
    tag: 'Generation',
    description:
      'Transform a rough idea, article link, or bullet points into polished, platform-native social updates tailored specifically for LinkedIn, X, and Instagram.',
    capabilities: ['Hook generation', 'Article-to-post summarization', 'Emoji & spacing optimization'],
    examplePrompt: 'Announce our new AI queue optimization feature for growth marketers',
    exampleOutput: '🚀 Most social teams spend 15+ hours/week manually rescheduling posts.\n\nToday, we’re changing that with Intelligent Category Queuing...',
  },
  {
    id: 'ai_2',
    name: 'Thread & Carousel Re-purposer',
    tag: 'Repurposing',
    description:
      'Turn long-form content into punchy 5-to-10 slide carousels and high-engagement X threads that maximize dwell time and reach.',
    capabilities: ['Longform to thread', 'Slide-by-slide carousel copy', 'Call-to-action closing'],
    examplePrompt: 'Break down the 5 laws of evergreen social distribution',
    exampleOutput: '1/5 Most social posts die in 6 hours.\nHere is the exact framework top brands use to recycle winning content for 12+ months 🧵👇',
  },
  {
    id: 'ai_3',
    name: 'Brand Persona & Tone Matcher',
    tag: 'Personalization',
    description:
      'Ensure every post reflects your brand identity. Toggle between Authoritative Executive, Playful & Witty, Analytical, or Conversational voices.',
    capabilities: ['Custom voice presets', 'Reading level control', 'Jargon reduction'],
    examplePrompt: 'Adopt an analytical yet engaging tone for B2B founders',
    exampleOutput: 'Data from 25,000 published posts reveals a counterintuitive pattern: Consistency outperforms sporadic viral spikes by 4.2x in pipeline generation.',
  },
  {
    id: 'ai_4',
    name: 'Smart Hashtag & Keyword Optimizer',
    tag: 'Discovery',
    description:
      'Identify high-intent, trending keywords and relevant hashtags tailored to your niche to boost organic discovery without algorithm penalties.',
    capabilities: ['Platform-specific tag limits', 'Spam score checking', 'Niche competitor discovery'],
    examplePrompt: 'Optimal tags for B2B SaaS growth marketing on LinkedIn and Instagram',
    exampleOutput: '#SaaSGrowth #MarketingAutomation #B2BMarketing #ContentStrategy',
  },
];

export const DEFAULT_SOCIAL_INTEGRATIONS: SocialIntegrationDto[] = [
  {
    id: 'x_twitter',
    name: 'X (formerly Twitter)',
    platformKey: 'twitter',
    color: 'bg-black text-white dark:bg-slate-900',
    category: 'Microblogging',
    supportedFeatures: ['Single Posts', 'Threads (up to 25)', 'Media Uploads (4 images/video)', 'Analytics'],
    isPopular: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platformKey: 'linkedin',
    color: 'bg-[#0077b5] text-white',
    category: 'Professional Network',
    supportedFeatures: ['Personal Profiles', 'Company Pages', 'PDF Carousels', 'Polls & Articles'],
    isPopular: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    platformKey: 'facebook',
    color: 'bg-[#1877f2] text-white',
    category: 'Social Network',
    supportedFeatures: ['Brand Pages', 'Community Groups', 'Reels', 'Album Publishing'],
    isPopular: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    platformKey: 'instagram',
    color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white',
    category: 'Visual & Media',
    supportedFeatures: ['Direct Feed Publishing', 'Carousel Posts', 'Reels Auto-Publish', 'First Comment Tags'],
    isPopular: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platformKey: 'tiktok',
    color: 'bg-[#000000] text-white',
    category: 'Short Video',
    supportedFeatures: ['Video Direct Publishing', 'Trending Audio Tags', 'Auto-captioning Support'],
    isPopular: true,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    platformKey: 'pinterest',
    color: 'bg-[#e60023] text-white',
    category: 'Inspiration & E-commerce',
    supportedFeatures: ['Board Pinning', 'Rich Product Pins', 'Destination URL tracking'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platformKey: 'youtube',
    color: 'bg-[#ff0000] text-white',
    category: 'Video Platform',
    supportedFeatures: ['YouTube Shorts', 'Community Polls & Posts', 'Video Description Links'],
  },
  {
    id: 'threads',
    name: 'Threads',
    platformKey: 'threads',
    color: 'bg-slate-950 text-white',
    category: 'Conversational',
    supportedFeatures: ['Text Updates', 'Multi-Image Albums', 'Link Previews'],
  },
  {
    id: 'google_business',
    name: 'Google Business Profile',
    platformKey: 'google_business',
    color: 'bg-[#4285f4] text-white',
    category: 'Local Search & SEO',
    supportedFeatures: ['Offer Posts', 'What’s New Updates', 'Event Announcements with CTA'],
  },
];

export const DEFAULT_HOW_IT_WORKS: HowItWorksStepDto[] = [
  {
    stepNumber: '01',
    title: 'Connect Your Social Profiles',
    subtitle: 'One-Click Official OAuth',
    description:
      'Link your X, LinkedIn, Facebook, Instagram, TikTok, and Pinterest accounts with enterprise OAuth 2.0 security. No password sharing required.',
    badge: 'Quick Setup',
  },
  {
    stepNumber: '02',
    title: 'Build Strategic Content Categories',
    subtitle: 'Create Balanced Timetables',
    description:
      'Set up purposeful buckets like Evergreen Insights, Product Updates, or Industry Tips, and allocate your ideal weekly time slots for each.',
    badge: 'Category Scheduling',
  },
  {
    stepNumber: '03',
    title: 'Fill Queues with Native AI Copilot',
    subtitle: 'Draft 10x Faster',
    description:
      'Draft customized posts or let the AI Copilot generate platform-specific variants, hooks, and hashtags in seconds. Route drafts for client approval if needed.',
    badge: 'AI Powered',
  },
  {
    stepNumber: '04',
    title: 'Automate Publishing & Evergreen Recycling',
    subtitle: 'Hands-Free Consistency',
    description:
      'Sit back as SocialHive pushes your updates at peak audience times and automatically re-queues high-value evergreen content to keep growth steady.',
    badge: 'Autopilot Active',
  },
];

export const DEFAULT_CTA_BANNER: CtaBannerDto = {
  title: 'Ready to put your social media marketing on autopilot?',
  highlightText: 'Join 12,000+ creators, growth marketers, and modern agencies.',
  description:
    'Start your 14-day free trial today. No credit card required. Experience category-based scheduling, AI content generation, and multi-network automation in minutes.',
  buttonText: 'Start Free 14-Day Trial',
  buttonLink: '/signup',
  secondaryButtonText: 'View Pricing Plans',
  secondaryButtonLink: '/pricing',
};

export class CmsService {
  public static async getHeaderSettings(): Promise<CmsHeaderRecord> {
    const isFreePlanActive = await CmsRepository.isFreePlanActive();
    const header = await CmsRepository.getHeaderSettings();
    if (!isFreePlanActive) {
      return {
        ...header,
        ctaText: /trial|free/i.test(header.ctaText) ? 'Get Started' : header.ctaText,
        ctaLink: header.ctaLink === '/signup' || header.ctaLink === '/signup?plan=free-trial' ? '/pricing' : header.ctaLink,
      };
    }
    return header;
  }

  public static async getFooterSettings(): Promise<CmsFooterRecord> {
    return CmsRepository.getFooterSettings();
  }

  public static async getHeaderNavigation(): Promise<NavItem[]> {
    const items = await CmsRepository.getNavigationItems('HEADER');
    if (items.length > 0) {
      return items.map((i) => ({
        id: i.id,
        label: i.label,
        path: i.path,
        openInNewTab: i.openInNewTab,
        order: i.order,
      }));
    }
    return DEFAULT_HEADER_NAV;
  }

  public static async getFooterNavigation(): Promise<{ primary: NavItem[]; legal: NavItem[] }> {
    const [primary, legal] = await Promise.all([
      CmsRepository.getNavigationItems('FOOTER_PRIMARY'),
      CmsRepository.getNavigationItems('FOOTER_LEGAL'),
    ]);

    return {
      primary: primary.length > 0
        ? primary.map((i) => ({ id: i.id, label: i.label, path: i.path, order: i.order }))
        : DEFAULT_FOOTER_PRIMARY_NAV,
      legal: legal.length > 0
        ? legal.map((i) => ({ id: i.id, label: i.label, path: i.path, order: i.order }))
        : DEFAULT_FOOTER_LEGAL_NAV,
    };
  }

  public static async getPricingPlans(): Promise<PricingPlanDto[]> {
    const isFreeActive = await CmsRepository.isFreePlanActive();
    const plans = await CmsRepository.getPricingPlans();
    const filtered = plans.filter((p) => {
      if (!p.isActive) return false;
      if (
        !isFreeActive &&
        (p.slug === 'free-trial' ||
          p.slug === 'free_trial' ||
          p.monthlyPrice === 0 ||
          p.name.toLowerCase().includes('trial'))
      ) {
        return false;
      }
      return true;
    });

    return filtered.map((p) => {
      let ctaText = p.ctaText;
      if (!isFreeActive && /trial/i.test(ctaText)) {
        if (p.slug === 'starter') ctaText = 'Get Started';
        else if (p.slug === 'pro' || p.slug === 'professional') ctaText = 'Get Pro Growth';
        else if (p.slug === 'agency') ctaText = 'Get Agency Scale';
        else ctaText = 'Choose Plan';
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
        features: p.features,
        isPopular: p.isPopular,
        ctaText,
        ctaLink: p.ctaLink,
      };
    });
  }

  public static async getFaqs(): Promise<FaqItemDto[]> {
    const isFreePlanActive = await CmsRepository.isFreePlanActive();
    const faqs = await CmsRepository.getFaqs();
    const active = faqs.filter((f) => f.isActive);
    if (active.length > 0) {
      return active.map((f) => {
        let question = f.question.replace(/SocialHive/gi, 'QuickPostly');
        let answer = f.answer.replace(/SocialHive/gi, 'QuickPostly');
        if (!isFreePlanActive) {
          question = question.replace(
            /Is there a free trial and can I cancel anytime\?/i,
            'Can I switch or cancel my plan anytime?'
          );
          answer = answer.replace(
            /We offer an unrestricted 14-day free trial on all plans without requiring upfront contracts or credit cards\.\s*/i,
            ''
          );
        }
        return {
          id: f.id,
          question,
          answer,
          category: f.category,
          order: f.order,
        };
      });
    }
    return [];
  }

  public static async getTestimonials(): Promise<TestimonialDto[]> {
    const items = await CmsRepository.getTestimonials();
    const active = items.filter((t) => t.isActive);
    return active.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      avatarUrl: t.avatarUrl || undefined,
      rating: t.rating,
      quote: t.quote,
      metricResult: t.metricResult || '',
    }));
  }

  public static async getHomepageContent(): Promise<HomepageContentDto> {
    const isFreePlanActive = await CmsRepository.isFreePlanActive();
    const page = await CmsRepository.getPageBySlug('home');
    const [testimonials, faqs, rawPricing] = await Promise.all([
      this.getTestimonials(),
      this.getFaqs(),
      this.getPricingPlans(),
    ]);

    // If free plan is OFF, filter out any free tier from pricing
    const pricing = isFreePlanActive
      ? rawPricing
      : rawPricing.filter((p) => p.slug !== 'free-trial' && p.slug !== 'free_trial' && p.monthlyPrice > 0);

    let hero = DEFAULT_HERO_CONTENT;
    let features = DEFAULT_FEATURES;
    let aiTools = DEFAULT_AI_TOOLS;
    let integrations = DEFAULT_SOCIAL_INTEGRATIONS;
    let howItWorks = DEFAULT_HOW_IT_WORKS;
    let cta = DEFAULT_CTA_BANNER;

    if (page && page.contentJson) {
      const json = page.contentJson as unknown as Partial<HomepageContentDto>;
      if (json.hero) hero = { ...DEFAULT_HERO_CONTENT, ...json.hero };
      if (json.features) features = json.features;
      if (json.aiTools) aiTools = json.aiTools;
      if (json.integrations) integrations = json.integrations;
      if (json.howItWorks) howItWorks = json.howItWorks;
      if (json.cta) cta = { ...DEFAULT_CTA_BANNER, ...json.cta };
    }

    // Dynamic adaptation when Free Subscription / Trial is toggled OFF
    if (!isFreePlanActive) {
      // 1. Dynamic Hero adaptation
      const safeTrust = Array.isArray(hero.trustPoints) ? hero.trustPoints : DEFAULT_HERO_CONTENT.trustPoints;
      const sanitizedTrust = safeTrust
        .filter((tp) => !/14[\s-]*day/i.test(tp) && !/trial/i.test(tp) && !/credit card/i.test(tp));
      if (!sanitizedTrust.includes('Instant setup in 60s')) {
        sanitizedTrust.push('Instant setup in 60s');
      }
      if (!sanitizedTrust.includes('Cancel in 1-click anytime')) {
        sanitizedTrust.push('Cancel in 1-click anytime');
      }

      hero = {
        ...hero,
        badgeText: hero.badgeText.replace(/14[\s-]*day/gi, 'Intelligent').replace(/trial/gi, 'Platform'),
        primaryCtaText: 'Get Started Now',
        primaryCtaLink: '/pricing',
        trustPoints: Array.from(new Set(sanitizedTrust)),
      };

      // 2. Dynamic CTA Banner adaptation
      cta = {
        ...cta,
        title: cta.title.replace(/14[\s-]*day free trial/gi, 'QuickPostly Platform').replace(/free trial/gi, 'Platform'),
        description: 'Accelerate your audience growth with intelligent category scheduling.',
        buttonText: 'Get Started Today',
        buttonLink: '/pricing',
      };
    }

    return {
      hero,
      features,
      aiTools,
      integrations,
      howItWorks,
      testimonials: testimonials.length > 0 ? testimonials : [],
      faqs: faqs.length > 0 ? faqs : [],
      pricing,
      cta,
      isFreePlanActive,
    };
  }

  public static async getThemeSettings(): Promise<ThemeSettingsDto> {
    const theme = await CmsRepository.getThemeSettings();
    return {
      siteName: theme.siteName,
      tagLine: theme.tagLine,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    };
  }

  public static async getSeoSettings(): Promise<SeoSettingsDto> {
    const seo = await CmsRepository.getSeoSettings();
    return {
      defaultMetaTitle: seo.defaultMetaTitle,
      defaultMetaDescription: seo.defaultMetaDescription,
      twitterHandle: seo.twitterHandle,
    };
  }

  public static async getAnnouncements(activeOnly = true): Promise<CmsAnnouncementRecord[]> {
    return CmsRepository.getAnnouncements(activeOnly);
  }

  public static async getBlogPosts(options?: { categorySlug?: string; limit?: number }): Promise<CmsBlogPostRecord[]> {
    return CmsRepository.getBlogPosts({ ...options, status: 'PUBLISHED' });
  }

  public static async getBlogPostBySlug(slug: string): Promise<CmsBlogPostRecord | null> {
    return CmsRepository.getBlogPostBySlug(slug);
  }
}
