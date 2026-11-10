// src/modules/ai/catalog.ts
// Comprehensive Catalog of AI Providers, Models, Tools & Routing Rules

import {
  AIProviderMeta,
  AIModelMeta,
  AIToolMeta,
  AIRoutingRuleDTO,
} from './types';

// ==============================================================================
// 1. AI PROVIDERS CATALOG (12 Providers across Text, Image, Video, Voice)
// ==============================================================================

export const AI_PROVIDERS_CATALOG: AIProviderMeta[] = [
  // --- TEXT PROVIDERS ---
  {
    id: 'openai',
    name: 'OpenAI',
    taskTypes: ['TEXT'],
    brandColor: '#10a37f',
    badgeText: 'GPT-4o & Reasoning',
    description: 'Industry-standard LLMs with advanced multi-step reasoning, JSON instruction adherence, and fast inference.',
    defaultEndpoint: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs',
    isTextProvider: true,
    isMediaProvider: false,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    taskTypes: ['TEXT'],
    brandColor: '#1a73e8',
    badgeText: '2M Long Context',
    description: 'Google DeepMind flagship multimodal intelligence with massive 2M token context and low-latency Flash inference.',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    docsUrl: 'https://ai.google.dev/docs',
    isTextProvider: true,
    isMediaProvider: false,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    taskTypes: ['TEXT'],
    brandColor: '#d97706',
    badgeText: 'Superior Nuance & Writing',
    description: 'Nuanced thought leadership, long-form copy, brand voice fidelity, and human-sounding copywriting.',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    docsUrl: 'https://docs.anthropic.com',
    isTextProvider: true,
    isMediaProvider: false,
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    taskTypes: ['TEXT'],
    brandColor: '#111827',
    badgeText: 'Real-time & Witty',
    description: 'Frontier conversational model with deep social context, bold humor, and witty brand engagement.',
    defaultEndpoint: 'https://api.x.ai/v1',
    docsUrl: 'https://docs.x.ai',
    isTextProvider: true,
    isMediaProvider: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    taskTypes: ['TEXT'],
    brandColor: '#4f46e5',
    badgeText: 'Cost-Efficient Reasoning',
    description: 'Ultra-low cost high-performance open-architecture models with state-of-the-art math and code reasoning.',
    defaultEndpoint: 'https://api.deepseek.com',
    docsUrl: 'https://platform.deepseek.com/docs',
    isTextProvider: true,
    isMediaProvider: false,
  },

  // --- IMAGE PROVIDERS ---
  {
    id: 'openai_image',
    name: 'OpenAI Image (DALL-E 3)',
    taskTypes: ['IMAGE'],
    brandColor: '#059669',
    badgeText: 'Prompt Adherence',
    description: 'Generates photo-realistic and stylized social media graphics with faithful prompt following and in-image typography.',
    defaultEndpoint: 'https://api.openai.com/v1/images',
    docsUrl: 'https://platform.openai.com/docs/guides/images',
    isTextProvider: false,
    isMediaProvider: true,
  },
  {
    id: 'gemini_image',
    name: 'Gemini Imagen 3',
    taskTypes: ['IMAGE'],
    brandColor: '#2563eb',
    badgeText: 'Photorealism & Design',
    description: 'Google DeepMind state-of-the-art text-to-image generator with rich detail, lighting, and commercial design fidelity.',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/imagen',
    isTextProvider: false,
    isMediaProvider: true,
  },
  {
    id: 'flux_compatible',
    name: 'Flux.1 Compatible',
    taskTypes: ['IMAGE'],
    brandColor: '#7c3aed',
    badgeText: 'Next-Gen Diffusion',
    description: 'Black Forest Labs 12B parameter rectified flow transformer for exceptional typography and visual realism.',
    defaultEndpoint: 'https://api.bfl.ml/v1',
    docsUrl: 'https://docs.bfl.ml',
    isTextProvider: false,
    isMediaProvider: true,
  },

  // --- VIDEO PROVIDERS ---
  {
    id: 'runway',
    name: 'Runway ML',
    taskTypes: ['VIDEO'],
    brandColor: '#ec4899',
    badgeText: 'Gen-3 Alpha Turbo',
    description: 'Commercial video generation engine producing fluid motion, cinematic lighting, and realistic camera dynamics.',
    defaultEndpoint: 'https://api.dev.runwayml.com/v1',
    docsUrl: 'https://docs.runwayml.com',
    isTextProvider: false,
    isMediaProvider: true,
  },
  {
    id: 'google_veo',
    name: 'Google Veo',
    taskTypes: ['VIDEO'],
    brandColor: '#0891b2',
    badgeText: '1080p High Definition',
    description: 'High-definition 1080p generative video with prompt consistency, cinematic pans, and temporal coherence.',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    docsUrl: 'https://deepmind.google/technologies/veo',
    isTextProvider: false,
    isMediaProvider: true,
  },

  // --- VOICE PROVIDERS ---
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    taskTypes: ['VOICE'],
    brandColor: '#f97316',
    badgeText: 'Hyper-Realistic Voice',
    description: 'Lifelike voice cloning and expressive text-to-speech across 29 languages with emotional inflections.',
    defaultEndpoint: 'https://api.elevenlabs.io/v1',
    docsUrl: 'https://elevenlabs.io/docs',
    isTextProvider: false,
    isMediaProvider: true,
  },
  {
    id: 'openai_voice',
    name: 'OpenAI Audio (TTS)',
    taskTypes: ['VOICE'],
    brandColor: '#0d9488',
    badgeText: 'Multi-Voice TTS-1',
    description: 'Low-latency natural conversational voice generation powered by OpenAI speech models.',
    defaultEndpoint: 'https://api.openai.com/v1/audio',
    docsUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
    isTextProvider: false,
    isMediaProvider: true,
  },
];

// ==============================================================================
// 2. AI MODELS CATALOG
// ==============================================================================

export const AI_MODELS_CATALOG: AIModelMeta[] = [
  // OpenAI Text Models
  {
    id: 'gpt-4o',
    providerId: 'openai',
    name: 'GPT-4o (Omni)',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: true,
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['chat', 'vision', 'fast', 'reasoning'],
  },
  {
    id: 'gpt-4o-mini',
    providerId: 'openai',
    name: 'GPT-4o Mini',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['chat', 'fast', 'economy'],
  },
  {
    id: 'o1-preview',
    providerId: 'openai',
    name: 'OpenAI o1 Reasoning',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.06,
    creditCost: 3,
    minSubscriptionTier: 'PROFESSIONAL',
    capabilities: ['deep-reasoning', 'complex-strategy', 'math'],
  },

  // Google Gemini Models
  {
    id: 'gemini-1.5-pro',
    providerId: 'gemini',
    name: 'Gemini 1.5 Pro',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: true,
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['2m-context', 'multimodal', 'complex-planning'],
  },
  {
    id: 'gemini-1.5-flash',
    providerId: 'gemini',
    name: 'Gemini 1.5 Flash',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 1000000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['ultra-fast', 'economy', 'high-throughput'],
  },
  {
    id: 'gemini-2.0-flash',
    providerId: 'gemini',
    name: 'Gemini 2.0 Flash',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['real-time', 'code', 'vision'],
  },

  // Anthropic Claude Models
  {
    id: 'claude-3-5-sonnet-20241022',
    providerId: 'claude',
    name: 'Claude 3.5 Sonnet',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: true,
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['nuanced-copywriting', 'brand-voice', 'long-form'],
  },
  {
    id: 'claude-3-5-haiku-20241022',
    providerId: 'claude',
    name: 'Claude 3.5 Haiku',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['fast-inference', 'concise', 'economy'],
  },

  // xAI Grok Models
  {
    id: 'grok-2-latest',
    providerId: 'grok',
    name: 'Grok 2',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: true,
    contextWindow: 131072,
    maxOutputTokens: 4096,
    costPer1kInput: 0.002,
    costPer1kOutput: 0.01,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['witty', 'social-aware', 'bold-hooks'],
  },

  // DeepSeek Models
  {
    id: 'deepseek-chat',
    providerId: 'deepseek',
    name: 'DeepSeek-V3',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: true,
    contextWindow: 64000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['ultra-low-cost', 'chat', 'general-knowledge'],
  },
  {
    id: 'deepseek-reasoner',
    providerId: 'deepseek',
    name: 'DeepSeek-R1',
    taskType: 'TEXT',
    isEnabled: true,
    isDefault: false,
    contextWindow: 64000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.00055,
    costPer1kOutput: 0.00219,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['chain-of-thought', 'reasoning', 'analytical'],
  },

  // Image Models
  {
    id: 'dall-e-3',
    providerId: 'openai_image',
    name: 'DALL-E 3 (HD)',
    taskType: 'IMAGE',
    isEnabled: true,
    isDefault: true,
    contextWindow: 1,
    maxOutputTokens: 1,
    costPer1kInput: 0.04, // $0.040 per 1024x1024
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['photorealism', 'in-image-text', 'hd'],
  },
  {
    id: 'imagen-3.0',
    providerId: 'gemini_image',
    name: 'Imagen 3 (DeepMind)',
    taskType: 'IMAGE',
    isEnabled: true,
    isDefault: false,
    contextWindow: 1,
    maxOutputTokens: 1,
    costPer1kInput: 0.03,
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['commercial-design', 'vivid-lighting', 'aspect-ratios'],
  },
  {
    id: 'flux-1-dev',
    providerId: 'flux_compatible',
    name: 'FLUX.1-Dev',
    taskType: 'IMAGE',
    isEnabled: true,
    isDefault: false,
    contextWindow: 1,
    maxOutputTokens: 1,
    costPer1kInput: 0.025,
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['sharp-typography', 'cinematic', 'artistic'],
  },

  // Video Models
  {
    id: 'gen3a_turbo',
    providerId: 'runway',
    name: 'Runway Gen-3 Alpha Turbo',
    taskType: 'VIDEO',
    isEnabled: true,
    isDefault: true,
    contextWindow: 1,
    maxOutputTokens: 1,
    costPer1kInput: 0.25, // $0.25 per 5-second video
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['high-motion', 'cinematic-lighting', '1080p'],
  },
  {
    id: 'veo-2.0',
    providerId: 'google_veo',
    name: 'Google Veo 2.0',
    taskType: 'VIDEO',
    isEnabled: true,
    isDefault: false,
    contextWindow: 1,
    maxOutputTokens: 1,
    costPer1kInput: 0.35,
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'PROFESSIONAL',
    capabilities: ['temporal-coherence', 'photorealistic-motion'],
  },

  // Voice Models
  {
    id: 'eleven_multilingual_v2',
    providerId: 'elevenlabs',
    name: 'ElevenLabs Multilingual v2',
    taskType: 'VOICE',
    isEnabled: true,
    isDefault: true,
    contextWindow: 5000,
    maxOutputTokens: 1,
    costPer1kInput: 0.03, // $0.03 per 1000 characters
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'STARTER',
    capabilities: ['emotional-inflection', '29-languages', 'cloning'],
  },
  {
    id: 'tts-1-hd',
    providerId: 'openai_voice',
    name: 'OpenAI TTS-1-HD',
    taskType: 'VOICE',
    isEnabled: true,
    isDefault: false,
    contextWindow: 4096,
    maxOutputTokens: 1,
    costPer1kInput: 0.03,
    costPer1kOutput: 0,
    creditCost: 1,
    minSubscriptionTier: 'FREE',
    capabilities: ['natural-flow', '6-voices', 'fast-tts'],
  },
];

// ==============================================================================
// 3. THE 12 AI TOOLS CATALOG
// ==============================================================================

export const AI_TOOLS_CATALOG: AIToolMeta[] = [
  {
    id: 'caption_generator',
    name: 'Caption Generator',
    slug: 'caption-generator',
    taskType: 'TEXT',
    category: 'CONTENT',
    description: 'Creates viral, platform-tailored social media captions with scroll-stopping hooks, line-breaks, and engagement CTAs.',
    systemPrompt: `You are an elite social media ghostwriter and viral caption strategist for top global creators and brands.
Your job is to generate 3 high-converting caption variations tailored to the chosen platform and audience.
Each caption must feature:
1. Hook (First 1-2 lines): Strong intrigue or pattern interrupt that prevents scrolling.
2. Value Core: 2-4 punchy, spaced bullet points delivering tangible insight.
3. Call to Action (CTA): Explicit engagement question or prompt.
4. Curated Hashtags: 3-5 relevant, non-spammy tags.
Format clearly with line-breaks. Tone should precisely reflect the user's requested tone.`,
    defaultModel: 'gpt-4o',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'MessageSquareText',
    displayOrder: 1,
  },
  {
    id: 'hashtag_generator',
    name: 'Hashtag Generator',
    slug: 'hashtag-generator',
    taskType: 'TEXT',
    category: 'OPTIMIZATION',
    description: 'Generates high-reach, niche-targeted, and trending hashtags segmented by discovery potential.',
    systemPrompt: `You are an expert social media algorithm researcher.
Analyze the user's topic and generate a structured set of 25-30 strategic hashtags organized into 4 tiers:
- Tier 1: Broad Category / High Volume (500k+ posts) - 6 tags
- Tier 2: Community / Mid Volume (50k-500k posts) - 10 tags
- Tier 3: Hyper-Niche / High Conversion (<50k posts) - 8 tags
- Tier 4: Branded / Conversation Tags - 4 tags
Include a 2-sentence rationale for the recommended tag blend and platform-specific placement advice.`,
    defaultModel: 'gemini-1.5-flash',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Hash',
    displayOrder: 2,
  },
  {
    id: 'post_ideas_generator',
    name: 'Post Ideas Generator',
    slug: 'post-ideas-generator',
    taskType: 'TEXT',
    category: 'CONTENT',
    description: 'Brainstorms 5-7 actionable, high-engagement content angles and post frameworks for brand niches.',
    systemPrompt: `You are a creative social media director.
Generate 6 distinct, ready-to-execute post concepts based on the provided niche or topic.
For each concept provide:
1. Concept Title & Format (e.g. Carousel, Short Video Script, Contrarian Take, Step-by-Step Breakdown)
2. Hook Angle: The controversial or intriguing angle that sparks debate.
3. Content Outline: 3 bullet points of what to cover.
4. Suggested Category Bucket: Evergreen, Curated News, Behind-The-Scenes, or Promotional.`,
    defaultModel: 'claude-3-5-sonnet-20241022',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Lightbulb',
    displayOrder: 3,
  },
  {
    id: 'content_writer',
    name: 'Content Writer',
    slug: 'content-writer',
    taskType: 'TEXT',
    category: 'CONTENT',
    description: 'Drafts long-form thought-leadership posts, LinkedIn essays, newsletter deep-dives, and detailed articles.',
    systemPrompt: `You are a master business essayist and senior ghostwriter.
Produce a comprehensive, deeply compelling long-form post (400-800 words) that positions the author as an undisputed domain authority.
Structure:
- Headline: Gripping executive title.
- The Problem: Why the common conventional wisdom fails.
- The Framework: A named, step-by-step mental model or operational framework.
- Case in Point: Practical real-world example.
- Key Takeaway: Direct summary advice.
Avoid corporate buzzwords, passive voice, and fluffy filler.`,
    defaultModel: 'claude-3-5-sonnet-20241022',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'PenTool',
    displayOrder: 4,
  },
  {
    id: 'content_rewriter',
    name: 'Content Rewriter',
    slug: 'content-rewriter',
    taskType: 'TEXT',
    category: 'OPTIMIZATION',
    description: 'Polishes, simplifies, and repurposes existing drafts into punchy, high-retention social copy.',
    systemPrompt: `You are a ruthlessly efficient social media editor.
Rewrite the provided draft text to maximize readability, retention, and viral shareability.
Rules:
- Eliminate redundant adjectives and passive verbs.
- Format with single-sentence paragraphs and clean whitespace.
- Preserve all core facts and intent.
- Deliver 2 distinct rewritten versions:
  Version A: Punchy & Direct (Fast reading)
  Version B: Story-Driven & Engaging (Deeper connection)`,
    defaultModel: 'gpt-4o',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'RefreshCw',
    displayOrder: 5,
  },
  {
    id: 'tone_changer',
    name: 'Tone Changer',
    slug: 'tone-changer',
    taskType: 'TEXT',
    category: 'OPTIMIZATION',
    description: 'Transforms text into specific brand voices (Executive, Witty, Conversational, Urgent, Academic).',
    systemPrompt: `You are an expert voice and tone stylist.
Analyze the input text and rewrite it completely to match the user's requested tone.
Ensure vocabulary, sentence cadence, rhythm, emotional resonance, and punctuation reflect the chosen persona precisely while maintaining the original message integrity.`,
    defaultModel: 'grok-2-latest',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Sliders',
    displayOrder: 6,
  },
  {
    id: 'ad_copy_generator',
    name: 'Ad Copy Generator',
    slug: 'ad-copy-generator',
    taskType: 'TEXT',
    category: 'MARKETING',
    description: 'Generates high-converting paid social ad copy utilizing AIDA, PAS, and BAB direct-response frameworks.',
    systemPrompt: `You are a world-class direct-response advertising copywriter.
Generate 3 distinct ad copy variations for Meta, LinkedIn, and Google Ads using proven frameworks:
Variation 1: PAS (Problem, Agitation, Solution)
Variation 2: AIDA (Attention, Interest, Desire, Action)
Variation 3: BAB (Before, After, Bridge)
For each variation include:
- Primary Text (125 words max)
- Headline (40 characters max)
- Description (30 characters max)
- Recommended Call To Action Button (e.g. Learn More, Sign Up, Get Started)`,
    defaultModel: 'gpt-4o',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Target',
    displayOrder: 7,
  },
  {
    id: 'translator',
    name: 'Translator',
    slug: 'translator',
    taskType: 'TEXT',
    category: 'OPTIMIZATION',
    description: 'Context-aware multilingual translation preserving social media colloquialisms, tone, and formatting.',
    systemPrompt: `You are a professional localization specialist and multilingual social copywriter.
Translate the input text into the target language with extreme cultural fluency and idiomatic precision.
Do NOT perform literal word-for-word translation. Adapt social slang, idioms, and marketing tone to sound native and authentic to local speakers in the target market. Preserve formatting and emojis.`,
    defaultModel: 'gemini-1.5-pro',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Globe',
    displayOrder: 8,
  },
  {
    id: 'content_planner',
    name: 'AI Content Planner',
    slug: 'content-planner',
    taskType: 'TEXT',
    category: 'CONTENT',
    description: 'Generates complete 7-day or 30-day social content calendars with publishing schedules, themes, and formats.',
    systemPrompt: `You are a Chief Social Media Strategist managing international brands.
Create a structured 7-day Content Plan based on the user's business niche and target audience.
Format as a clean markdown table with columns:
| Day | Content Bucket (Evergreen / Promo / News / BTS) | Post Hook / Theme | Platform | Recommended Slot (Time) | Format (Image/Carousel/Text/Video) |
Followed by 3 strategic tips for executing the week's publishing campaign.`,
    defaultModel: 'gemini-1.5-pro',
    creditCost: 1,
    creditType: 'TEXT_GENERATION',
    isEnabled: true,
    iconName: 'Calendar',
    displayOrder: 9,
  },
  {
    id: 'image_generator',
    name: 'AI Image Generator',
    slug: 'image-generator',
    taskType: 'IMAGE',
    category: 'MEDIA',
    description: 'Creates stunning commercial-grade visuals, hero graphics, and promotional banners for social posts.',
    systemPrompt: `Commercial social media graphic generation with photorealistic fidelity, cinematic lighting, and modern aesthetics.`,
    defaultModel: 'dall-e-3',
    creditCost: 1,
    creditType: 'IMAGE_GENERATION',
    isEnabled: true,
    iconName: 'Image',
    displayOrder: 10,
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
  },
  {
    id: 'video_generator',
    name: 'AI Video Generator',
    slug: 'video-generator',
    taskType: 'VIDEO',
    category: 'MEDIA',
    description: 'Generates dynamic short-form social video clips, product motion teasers, and cinematic reels.',
    systemPrompt: `Cinematic short video clip generator with consistent temporal motion, camera panning, and commercial aesthetics.`,
    defaultModel: 'gen3a_turbo',
    creditCost: 1,
    creditType: 'VIDEO_GENERATION',
    isEnabled: true,
    iconName: 'Video',
    displayOrder: 11,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'voiceover_generator',
    name: 'AI Voiceover',
    slug: 'voiceover-generator',
    taskType: 'VOICE',
    category: 'MEDIA',
    description: 'Produces studio-grade narration and voiceovers for reels, stories, YouTube videos, and podcasts.',
    systemPrompt: `Expressive text-to-speech audio narration with natural pauses, emotional cadence, and studio clarity.`,
    defaultModel: 'eleven_multilingual_v2',
    creditCost: 1,
    creditType: 'VOICE_GENERATION',
    isEnabled: true,
    iconName: 'Mic',
    displayOrder: 12,
    supportedVoices: [
      'Adam - Deep & Executive',
      'Rachel - Warm & Friendly',
      'Antoni - Energetic & Youthful',
      'Bella - Narrative & Elegant',
      'OpenAI Alloy - Neutral Modern',
      'OpenAI Nova - Upbeat Professional',
    ],
  },
];

// ==============================================================================
// 4. DEFAULT SMART ROUTING RULES (Automatic AI Mode)
// ==============================================================================

export const DEFAULT_ROUTING_RULES: AIRoutingRuleDTO[] = [
  {
    id: 'rule_text_auto',
    taskType: 'TEXT',
    primaryProviderId: 'gemini', // High quality, low cost & fast default
    fallbackProviderIds: ['openai', 'claude', 'deepseek'],
    maxCostThreshold: 0.03, // Never silently switch to higher cost
    autoFallbackEnabled: true,
    timeoutMs: 15000,
    retryAttempts: 2,
  },
  {
    id: 'rule_image_auto',
    taskType: 'IMAGE',
    primaryProviderId: 'openai_image',
    fallbackProviderIds: ['gemini_image', 'flux_compatible'],
    maxCostThreshold: 0.06,
    autoFallbackEnabled: true,
    timeoutMs: 25000,
    retryAttempts: 2,
  },
  {
    id: 'rule_video_auto',
    taskType: 'VIDEO',
    primaryProviderId: 'runway',
    fallbackProviderIds: ['google_veo'],
    maxCostThreshold: 0.40,
    autoFallbackEnabled: true,
    timeoutMs: 45000,
    retryAttempts: 1,
  },
  {
    id: 'rule_voice_auto',
    taskType: 'VOICE',
    primaryProviderId: 'elevenlabs',
    fallbackProviderIds: ['openai_voice'],
    maxCostThreshold: 0.05,
    autoFallbackEnabled: true,
    timeoutMs: 20000,
    retryAttempts: 2,
  },
];
