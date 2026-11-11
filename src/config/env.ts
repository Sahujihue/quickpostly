import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('QuickPostly'),
  APP_URL: z.string().url().default('https://quickpostly.com'),
  PORT: z.string().default('3000'),

  // Public variables
  NEXT_PUBLIC_APP_NAME: z.string().default('QuickPostly'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://quickpostly.com'),
  NEXT_PUBLIC_CANONICAL_URL: z.string().url().default('https://quickpostly.com'),
  NEXT_PUBLIC_WWW_URL: z.string().url().default('https://www.quickpostly.com'),
  NEXT_PUBLIC_API_URL: z.string().default('https://quickpostly.com/api'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('USD'),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().default('support@quickpostly.com'),
  NEXT_PUBLIC_BRAND_TAGLINE: z.string().default('Create Smarter. Schedule Faster. Grow Everywhere.'),
  NEXT_PUBLIC_META_TITLE: z.string().default('QuickPostly – AI Social Media Management Platform'),
  NEXT_PUBLIC_META_DESCRIPTION: z.string().default('Create AI-powered social media content, schedule posts, manage multiple accounts and grow your brand with QuickPostly.'),

  // Database & Cache
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/quickpostly_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Security
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').default('dev-secret-key-super-secure-placeholder-string-12345'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_COOKIE_NAME: z.string().default('quickpostly_session'),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
    APP_URL: process.env.APP_URL,
    PORT: process.env.PORT,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/quickpostly_db?schema=public',
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:', JSON.stringify(error.format(), null, 2));
  }
  // Provide safe fallback defaults for build time if necessary
  parsedEnv = envSchema.parse({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/socialhive_db?schema=public',
  });
}

export const env = parsedEnv;
