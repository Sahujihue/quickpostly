export interface NavItem {
  id: string;
  label: string;
  path: string;
  openInNewTab?: boolean;
  order: number;
  children?: NavItem[];
}

export interface PricingPlanDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  badge?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface ThemeSettingsDto {
  siteName: string;
  tagLine: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface SeoSettingsDto {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  twitterHandle: string;
}

export interface HeroSectionDto {
  badgeText: string;
  headlinePrefix: string;
  highlightedPhrase: string;
  headlineSuffix?: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  trustPoints: string[];
}

export interface FeatureItemDto {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  badge?: string;
}

export interface AiToolDto {
  id: string;
  name: string;
  tag: string;
  description: string;
  capabilities: string[];
  examplePrompt: string;
  exampleOutput: string;
}

export interface SocialIntegrationDto {
  id: string;
  name: string;
  platformKey: string;
  color: string;
  category: string;
  supportedFeatures: string[];
  isPopular?: boolean;
}

export interface HowItWorksStepDto {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export interface TestimonialDto {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating: number;
  quote: string;
  metricResult: string;
}

export interface CtaBannerDto {
  title: string;
  highlightText: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface HomepageContentDto {
  hero: HeroSectionDto;
  features: FeatureItemDto[];
  aiTools: AiToolDto[];
  integrations: SocialIntegrationDto[];
  howItWorks: HowItWorksStepDto[];
  testimonials: TestimonialDto[];
  faqs: FaqItemDto[];
  pricing: PricingPlanDto[];
  cta: CtaBannerDto;
  isFreePlanActive?: boolean;
}

