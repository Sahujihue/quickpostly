# QuickPostly — AI-Powered Social Media Management SaaS Platform

> **Create Smarter. Schedule Faster. Grow Everywhere.**
> Official Domain: [https://quickpostly.com](https://quickpostly.com)
>
> A commercial-grade, multi-tenant Social Media Management SaaS platform built with Next.js 14 App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, and Redis + BullMQ queue architecture.

---

## 🚀 Key Architectural Pillars

1. **Category-Based Content Queuing (SocialBee & Buffer Inspired)**
   - Content categorized into purposeful buckets: *Evergreen Insights*, *Curated Industry News*, *Promotional*, *Culture & Behind The Scenes*.
   - Intelligent recurrent time slots ensure consistent content delivery without daily manual scheduling.
   - Evergreen recycling engine with configurable cooldown buffers and expiration counters.

2. **Advanced Multi-AI Content Studio (Part 7)**
   - Text Generation: OpenAI (GPT-4o), Google Gemini, Anthropic Claude, xAI Grok, DeepSeek.
   - Image & Video: DALL-E, Gemini Vision, Runway / Video APIs.
   - Voiceover: ElevenLabs, OpenAI Audio.
   - Dual routing mode: Automatic AI (least-cost, high-capability fallback routing) and Manual Selection.

3. **Multi-Payment Gateway Architecture (Part 6)**
   - Indian Gateways: Razorpay, Cashfree, PayU, PhonePe, CCAvenue (UPI, UPI QR, Net Banking, Wallets, RuPay).
   - International Gateways: Stripe, PayPal, 2Checkout / Verifone, Paddle, Lemon Squeezy.
   - Crypto Gateways: NOWPayments, CoinPayments, Coinbase Commerce (BTC, ETH, USDT, USDC, LTC).

4. **Real Social Media Integrations & Unified Inbox (Parts 8 & 10)**
   - Official OAuth connections: Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest, X (Twitter), Google Business Profile.
   - Unified multi-platform customer communication inbox with real-time reply and conversation triage.

5. **Visual Content Calendar & Background Publisher (Part 9)**
   - Daily, weekly, monthly interactive calendar views with drag-and-drop rescheduling.
   - Decoupled Redis BullMQ publishing worker architecture with automatic retries and rate limit safety.

6. **Executive Admin Control Center (25 Modules)**
   - Platform Analytics, User Management, Staff & Roles Management, Subscriptions, Plans & Pricing Configuration, Transactions, Payment Gateway Credentials, AI Provider Routing, Social Integrations, Website Builder, Homepage Builder, Header/Footer CMS, Custom Pages, Theme & Branding, Blog, Testimonials, FAQ Management, Media Library, Notifications, SEO Settings, Email & SMTP, Security & Access, Activity Logs, and System Telemetry.

7. **Enterprise Multi-Tenant Workspace & RBAC**
   - Workspaces isolate brand profiles, team members, scheduling queues, and assets.
   - Granular Role-Based Access Control (RBAC): `Owner`, `Admin`, `Editor`, `Approver / Client`, `Viewer`.
   - External agency client review & one-click approval workflows.

8. **Dynamic Website CMS Architecture (Zero Code Change Required)**
   - Full management of header and footer menus, homepage sections, pricing plans, FAQs, brand colors, typography, and global SEO metadata directly through the Admin Panel.

9. **Bank-Grade Security & Authorization**
   - HTTP Strict Transport Security (HSTS), Content Security Policy (CSP), anti-clickjacking frame protections (`DENY`), nosniff content headers, and permissions policies.
   - Server-side token verification, password hashing via bcrypt (salt 12), and session extraction with cookie management.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI & Styling**: React 18, Tailwind CSS, Lucide Icons, Custom Light/Dark Theme Engine
- **Language**: TypeScript 5 (Strict Mode)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Queues & Cache**: Redis with BullMQ
- **Form & Schema Validation**: Zod, React Hook Form, `@hookform/resolvers`
- **Security**: Strict HTTP security headers, JWT signing (SHA-256), bcryptjs (salt 12)

---

## 📂 Directory Structure

```text
socialhive/
├── prisma/
│   └── schema.prisma              # PostgreSQL schema: Core models + CMS models
├── src/
│   ├── app/
│   │   ├── (public)/              # Responsive public website
│   │   │   ├── layout.tsx         # CMS-driven public layout (Header & Footer)
│   │   │   ├── page.tsx           # Commercial homepage (Hero, Features, Stats, Testimonials, CTA)
│   │   │   ├── about/             # Mission, Story, Principles
│   │   │   ├── contact/           # React Hook Form + Zod contact page
│   │   │   ├── pricing/           # Interactive monthly/annual pricing matrix & FAQs
│   │   │   ├── privacy/           # GDPR & CCPA compliant privacy policy
│   │   │   └── terms/             # Commercial terms of service
│   │   ├── (dashboard)/           # Client & agency dashboard shell
│   │   │   ├── layout.tsx         # Responsive dashboard shell (sidebar, header, mobile drawer)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       # Overview (KPIs, Category Queues, Quick AI Copilot)
│   │   │       ├── posts/         # Queues & publishing calendar
│   │   │       ├── analytics/     # Performance & ROI reports
│   │   │       ├── inbox/         # Unified social inbox
│   │   │       └── settings/      # Workspace, billing & team seats
│   │   ├── (admin)/               # Executive platform admin panel
│   │   │   ├── layout.tsx         # Dedicated dark executive admin layout
│   │   │   └── admin/
│   │   │       ├── page.tsx       # Platform MRR, workspace growth, health overview
│   │   │       ├── cms/           # Dynamic Website CMS Control Center
│   │   │       ├── users/         # Multi-tenant workspace directory
│   │   │       └── settings/      # Infrastructure & telemetry monitors
│   │   ├── api/
│   │   │   └── health/route.ts    # Standardized system health check
│   │   ├── layout.tsx             # Root layout with ThemeProvider & fonts
│   │   └── globals.css            # Tailwind directives & CSS variables
│   ├── components/
│   │   ├── public/                # PublicHeader, PublicFooter, PricingView
│   │   ├── dashboard/             # DashboardSidebar, DashboardHeader
│   │   ├── admin/                 # AdminSidebar, AdminHeader
│   │   └── theme/                 # ThemeProvider, ThemeToggle
│   ├── config/
│   │   └── env.ts                 # Type-safe Zod environment validation
│   ├── lib/
│   │   ├── prisma.ts              # Database singleton & connectivity check
│   │   ├── redis.ts               # Redis singleton with offline resilience
│   │   ├── api-response.ts        # Standardized { success, data, error, meta } format
│   │   ├── exceptions.ts          # Structured HTTP AppExceptions
│   │   ├── validation.ts          # Global Zod schemas
│   │   ├── logger.ts              # Structured JSON application logger
│   │   ├── utils.ts               # cn(), currency & date formatters
│   │   ├── auth/                  # RBAC, session verification & hashing
│   │   └── queue/                 # BullMQ queues & job dispatchers
│   └── modules/                   # Modular architecture contracts
│       ├── auth/                  # Auth contracts & DTOs
│       ├── payments/              # Stripe billing gateway abstractions
│       ├── subscriptions/         # Plan limits & quota tracker
│       ├── social/                # Multi-platform adapters (X, LinkedIn, Meta, Pinterest, TikTok)
│       ├── scheduling/            # Category queue calculation engine
│       ├── ai/                    # AI post copilot & variant generator
│       ├── analytics/             # Engagement & reach aggregator
│       ├── inbox/                 # Social conversation inbox service
│       ├── agency/                # Multi-workspace & white-label contracts
│       └── cms/                   # CMS service with database & fallback resolvers
├── .env.example                   # Environment configuration template
├── next.config.js                 # Security headers (CSP, HSTS, X-Frame-Options)
├── tailwind.config.js             # Brand palette & typography
├── tsconfig.json                  # Strict TypeScript configuration
└── package.json
```

---

## 🔐 Authentication & User Management (Part 2)

SocialHive incorporates an enterprise-grade authentication, role-based authorization, and user management architecture built for high-security commercial SaaS operations.

### 1. Pre-configured Demonstration & Test Credentials
When testing or developing without an active PostgreSQL instance, SocialHive seeds and syncs the persistent auth store with the following credentials:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Super Admin** | `admin@socialhive.io` | `Admin123!@#` | Full platform administrative control, CMS management, user status overrides, audit trail |
| **Support Staff** | `support@socialhive.io` | `Support123!@#` | User directory view, status review, customer support telemetry |
| **Normal User** | `user@socialhive.io` | `User123!@#` | Standard workspace dashboard, scheduling queues, personal profile & 2FA management |

### 2. Core Security & Authentication Features
- **Strict Role-Based Authorization (RBAC)**: System roles are separated into `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, and `USER`. Public signups are strictly constrained to `USER` to prevent privilege escalation.
- **Two-Factor Authentication (2FA / TOTP)**: RFC 6238 time-based one-time password generation, QR code setup via Google Authenticator / 1Password / Authy, and 8 one-time backup recovery codes.
- **Universal Storage Adapter**: Automatically queries PostgreSQL via Prisma ORM when available, and seamlessly falls back to a durable local store (`.data/auth_store.json`) when migrations are pending.
- **Edge-Safe Session Verification**: Uses Next.js Edge Middleware for lightning-fast sub-millisecond route guarding (`/admin/*`, `/dashboard/*`, `/login`, `/signup`).
- **Sliding-Window Rate Limiting**: In-memory and persistent sliding window rate limiter protects against brute-force attacks on login (max 5 failed attempts / 15m lockout) and registration spam.
- **GDPR Compliance**: Instant personal data export (JSON archive compliant with GDPR Article 20) and self-service account deletion with confirmation safeguards.
- **Session Revocation**: Real-time inspection of active devices, IP addresses, and timestamps, with the ability to revoke specific sessions or all other devices.

### 3. Authentication & User Management Endpoints
- `POST /api/v1/auth/signup` - Validated account registration with automatic `USER` role enforcement
- `POST /api/v1/auth/login` - Secure login with brute-force lockout, bcrypt verification, and 2FA challenge handling
- `GET  /api/v1/auth/me` - Current authenticated user session payload and profile
- `POST /api/v1/auth/logout` - Session invalidation and HTTP-only cookie clearing
- `GET  /api/v1/auth/2fa/setup` - Generate RFC 6238 TOTP secret and QR code data URL
- `POST /api/v1/auth/2fa/setup` - Confirm 6-digit TOTP code, activate 2FA, and generate 8 backup recovery codes
- `POST /api/v1/auth/2fa/verify` - Validate 2FA TOTP code or recovery code during two-factor login challenge
- `POST /api/v1/auth/2fa/disable` - Deactivate 2FA with current password confirmation
- `POST /api/v1/auth/forgot-password` - Request 1-hour secure password reset token
- `POST /api/v1/auth/reset-password` - Validate reset token and update password with session invalidation
- `POST /api/v1/auth/verify-email` - Activate user account via verification token
- `GET  /api/v1/auth/oauth/google` - Initiate Google OAuth 2.0 flow with CSRF state protection
- `GET  /api/v1/auth/oauth/google/callback` - Handle OAuth token exchange and user provisioning
- `GET  /api/v1/user/profile` - Retrieve current user profile details
- `PUT  /api/v1/user/profile` - Update name, phone, country, timezone, language, currency, and avatar
- `PUT  /api/v1/user/password` - Change password with old password verification and session revocation
- `GET  /api/v1/user/sessions` - List all active sessions with device info, IP, and timestamps
- `DELETE /api/v1/user/sessions` - Revoke specific session or all other sessions
- `GET  /api/v1/user/export-data` - GDPR Article 20 JSON data export download
- `POST /api/v1/user/delete-account` - Permanent self-service account deletion
- `GET  /api/v1/admin/users` - Search, filter, and paginate platform users (Super Admin / Admin / Support)
- `GET  /api/v1/admin/users/[id]` - Detailed user profile, subscription status, and activity trail
- `PUT  /api/v1/admin/users/[id]` - Super Admin update user details and roles
- `PUT  /api/v1/admin/users/[id]/status` - Suspend or activate user accounts with automatic session revocation

---

## 🎨 UI, Landing Page & Dashboards (Part 3)

Part 3 delivers an international commercial SaaS interface with responsive navigation, fluid animations, custom light/dark theme support, and a complete database-backed dynamic CMS.

### 1. Reusable Design Components & UI Primitives
Located in `src/components/ui/`:
- `Badge`: Semantic color variants (`amber`, `emerald`, `indigo`, `rose`, `slate`, `sky`, `purple`, `outline`)
- `Skeleton`, `CardSkeleton`, `TableSkeleton`: Animated skeleton placeholders for seamless loading states
- `EmptyState`: Action-oriented empty state container with icon, title, description, and primary/secondary CTAs
- `ErrorState`: Friendly error boundary card with retry triggers
- `StatsCard`: SaaS KPI metric card with trend delta indicators, icon styling, and theme support
- `Accordion`: Accessible interactive collapsible disclosures for FAQs and documentation
- `Tabs`: Pill and underline tab switchers with active indicators and counters
- `Modal`: Accessible backdrop dialog with keyboard escape handlers and body scroll locking

### 2. Commercial Public Website & Homepage
Located at `/`:
- **Hero Section**: High-converting headline with amber gradient accents, dynamic badge, dual CTAs, and trust checklist
- **Interactive Product Preview**: Live 3-way view switcher demonstrating the Category Queue Engine, Multi-Channel AI Studio, and Weekly Publishing Grid
- **Features Grid**: 6 enterprise capability cards detailing category queuing, evergreen recycling, multi-network composing, agency client portals, unified social inbox, and analytics
- **AI Tools Showcase**: Deep-dive interactive terminal with realistic prompt/output simulations for post generation, thread repurposing, tone matching, and hashtag discovery
- **Social Media Integrations Grid**: Direct connection cards for X, LinkedIn, Facebook, Instagram, TikTok, Pinterest, YouTube, Threads, and Google Business Profile
- **How It Works**: 4-step progressive workflow timeline with numbered milestone badges
- **Pricing Preview**: Interactive Monthly vs Annual toggle (with `Save 20%` incentive), feature checklists, and checkout links
- **Customer Testimonials**: Verified growth leaders with 5-star ratings, quotes, and metric outcomes (`+340% Reach`, `18 hrs saved/week`, `99.4% On-time publishing`)
- **Interactive FAQ Accordion**: Expandable answers backed by dynamic CMS queries
- **Conversion CTA Banner**: High-impact gradient card driving free trial activations
- **Responsive Mobile Navigation**: Slide-out drawer with backdrop blur, brand links, and ThemeToggle

### 3. User Dashboard Architecture (10 Dedicated Modules)
Located at `/dashboard/*`:
- `/dashboard` — **Overview**: Welcome banner with live user identity, 4 KPI stats cards, category queue health, next scheduled dispatches, and quick AI draft assistant
- `/dashboard/ai-studio` — **AI Content Studio**: Platform variant generator with tone of voice selector, goal targeting, character count meters, and 1-click queue dispatch
- `/dashboard/calendar` — **Content Calendar**: Interactive month timetable with category filters, day cell post chips, and post detail inspection modals
- `/dashboard/accounts` — **Social Accounts**: Official OAuth 2.0 connection hub with health status, follower stats, token refresh, and connect modal for 8 networks
- `/dashboard/queue` — **Publishing Queue**: Category schedule slots, evergreen recycling buffer controls, queue pause/resume toggle, and post creation modal
- `/dashboard/analytics` — **Analytics & ROI**: Trailing 30-day reach graphs, engagement benchmarks, category performance bars, and top-performing posts table
- `/dashboard/inbox` — **Social Inbox**: Unified conversation feed across networks with sentiment tags (`Lead Intent`, `Question`, `Positive`), live reply composer, and resolve actions
- `/dashboard/workspaces` — **Workspaces**: Multi-tenant brand switcher, team seat quotas, client approval workflow controls, and invite modal
- `/dashboard/subscription` — **Subscription & Billing**: Active plan tier, resource usage meters (social accounts, workspaces, AI credits, team seats), and invoice receipts
- `/dashboard/settings` — **Settings**: User profile, password management, RFC 6238 2FA setup, active sessions, GDPR Article 20 JSON export, and account deletion

### 4. Admin Control Center (10 Administrative Modules)
Located at `/admin/*`:
- `/admin` — **Platform Overview**: High-level SaaS MRR metrics, workspace volume, active queues, and system telemetry
- `/admin/users` — **User Management**: User directory with search, role filters, status toggles, and audit trail drawers
- `/admin/cms` — **Website Builder**: Dynamic CMS control center allowing non-technical admins to edit Hero headlines, navigation menus, pricing tiers, theme colors, and SEO metadata with zero code changes
- `/admin/subscriptions` — **Subscriptions & MRR**: MRR breakdown by tier (Starter, Pro Growth, Agency Scale), churn tracking, and subscriber directory
- `/admin/payments` — **Payment Gateways**: Stripe Billing & PayPal configuration, webhook listener health, and multi-currency settlement
- `/admin/ai-providers` — **AI LLM Providers**: Model routing (OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini), API key management, and token expenditure monitors
- `/admin/integrations` — **Social Platform Apps**: Developer OAuth 2.0 app credentials, permissions scopes, and API ping latency tests
- `/admin/transactions` — **Financial Ledger**: Invoices, payment gateway status (Succeeded, Refunded, Failed), amount, and CSV export
- `/admin/settings` — **Website Settings**: Runtime environment health, PostgreSQL/Prisma latency, and BullMQ queue worker monitors
- `/admin/logs` — **Activity Logs**: Immutable security audit trail tracking administrative actions, user logins, and brute-force rate limit engage events

---

## 🗄 Database Models Summary

### Core Foundational Models
- `User`: Primary user identity, authentication credentials, status flags.
- `UserProfile`: Extended profile, bio, timezone, language, social links.
- `Role`: System and custom roles (`super_admin`, `workspace_owner`, `workspace_editor`, `client_approver`).
- `Permission`: Granular capabilities (`post:publish`, `workspace:manage`, `cms:edit`).
- `RolePermission`: Junction table connecting roles and permissions.
- `UserRole`: Scoped assignment mapping users to roles globally or per workspace.
- `Workspace`: Multi-tenant organization container holding accounts, members, and posts.
- `WorkspaceMember`: User membership in a workspace with role and invitation status.
- `AppSetting`: Key-value application configurations (general, billing, security, email, AI).
- `ActivityLog`: Audit trail tracking platform actions, IP addresses, and entity changes.

### Dynamic Website CMS Models
- `CmsNavigationItem`: Hierarchical menus for Header, Footer Primary, Footer Legal.
- `CmsHeaderSetting`: Global header config (logo text, logo images, sticky header, action buttons, mobile drawer).
- `CmsFooterSetting`: Global footer branding, newsletter form, discrete social profile URLs, contact details, copyright.
- `CmsPage`: Dynamic pages with meta titles, descriptions, custom scripts, revisions, and publish status.
- `CmsSection`: Reusable structured page sections (Hero, Features, Stats, Testimonials, CTA, Integrations).
- `CmsPricingPlan`: Database-controlled pricing tiers, monthly/annual rates, features list, badges, and checkout links.
- `CmsFaqItem`: Categorized frequently asked questions with display order.
- `CmsTestimonial`: Verified customer reviews with avatar, role, company, star rating, and display order.
- `CmsBlogPost`: Full dynamic blog posts with rich safe HTML content, categories, tags, author, and scheduling.
- `CmsBlogCategory`: Hierarchical blog categories.
- `CmsMediaAsset`: Media asset library with file size, dimensions, MIME type, folder organization, and alt text.
- `CmsAnnouncement`: Scheduled announcement bars and promotional modal popups with CTA buttons.
- `CmsThemeSetting`: Global brand colors (Primary Amber, Secondary Navy, Accent), fonts, logos, dark mode defaults.
- `CmsSeoSetting`: Default OG images, Twitter cards, meta descriptions, canonical URLs, robots.txt directives, and analytics IDs.
- `CmsEmailSetting`: SMTP server configuration, port, encryption, sender details, and live test email trigger.
- `CmsSecuritySetting`: Login rate-limiting thresholds, 2FA enforcement policy, IP whitelists/blacklists, and maintenance mode.

---

## 🎛 Complete Admin Panel & Dynamic Website CMS (Part 4)

SocialHive features a commercial-grade, Super Admin administration system that provides complete website control without requiring source-code edits or manual deployments.

### 1. 23 Admin Panel Modules

| # | Module | Route | Access | Key Capabilities |
|---|---|---|---|---|
| 1 | **Dashboard** | `/admin` | `SUPER_ADMIN`, `ADMIN` | Executive MRR breakdown, workspace counts, publishing queue activity, Redis worker telemetry |
| 2 | **User Management** | `/admin/users` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` | Multi-tenant user directory, status toggling (Active/Suspended), role escalation, 2FA inspection |
| 3 | **Subscription Management** | `/admin/subscriptions` | `SUPER_ADMIN`, `ADMIN` | Active subscribers, churn analysis, MRR growth, plan migrations, billing cycle controls |
| 4 | **Payment Gateways** | `/admin/payments` | `SUPER_ADMIN` | Stripe Billing, PayPal, Razorpay credentials, webhook listeners, currency settlement |
| 5 | **Plans & Pricing** | `/admin/pricing` | `SUPER_ADMIN`, `ADMIN` | Tier definitions (monthly/annual rates), feature check-lists, plan badges, recommended highlights |
| 6 | **AI Providers** | `/admin/ai-providers` | `SUPER_ADMIN` | Multi-LLM routing (OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini), API key vault, usage caps |
| 7 | **Social Integrations** | `/admin/integrations` | `SUPER_ADMIN` | Developer OAuth 2.0 app credentials (X, LinkedIn, Meta, TikTok, Pinterest), API latency tests |
| 8 | **Transactions** | `/admin/transactions` | `SUPER_ADMIN`, `ADMIN` | Invoices, gateway settlement statuses (Succeeded, Refunded, Failed), CSV ledger export |
| 9 | **Website Builder** | `/admin/builder` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Drag-and-drop section reordering, desktop/mobile visibility toggles, section duplication & deletion |
| 10 | **Header Management** | `/admin/header` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Desktop/mobile logo upload, navigation item sorting, CTA button controls, sticky header toggle |
| 11 | **Footer Management** | `/admin/footer` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Multi-column links, brand bio, newsletter subscription box, social profile links, copyright text |
| 12 | **Homepage Management** | `/admin/homepage` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Hero headline/subheadline editor, badge pill, dual CTA targets, trust metrics, background styling |
| 13 | **Pages Management** | `/admin/pages` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Dynamic custom pages CRUD (`/pages/[slug]`), SEO metadata, draft/published states, revision rollback |
| 14 | **Theme & Branding** | `/admin/theme` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Brand colors (Primary Amber, Secondary Slate, Accent Indigo), typography, live preview canvas |
| 15 | **Blog Management** | `/admin/blog` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Article authoring, safe HTML rendering, categories, tags, cover images, scheduled publishing |
| 16 | **Testimonials** | `/admin/testimonials` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Customer reviews, author name, avatar, company, star rating (1-5), display ordering |
| 17 | **FAQ Management** | `/admin/faqs` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Categorized FAQs, accordion order, live search, display toggles |
| 18 | **Media Library** | `/admin/media` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Asset storage, folder organization, image preview, alt text management, safe deletion |
| 19 | **SEO Settings** | `/admin/seo` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Global meta titles, meta descriptions, OpenGraph cards, Twitter cards, robots.txt directives, sitemap |
| 20 | **Email Settings** | `/admin/email` | `SUPER_ADMIN` | SMTP server host, port, TLS/SSL, sender email/name, and real-time live test email dispatch |
| 21 | **Notifications & Popups** | `/admin/notifications` | `SUPER_ADMIN`, `CONTENT_MANAGER` | Scheduled top announcement banners, promotional modal popups, start/end dates, CTA links |
| 22 | **Security Settings** | `/admin/security` | `SUPER_ADMIN` | Max login attempt thresholds, lockout durations, mandatory 2FA enforcement, IP filters, maintenance mode |
| 23 | **Activity Logs** | `/admin/logs` | `SUPER_ADMIN`, `ADMIN` | Immutable security audit trail with severity indicators, IP addresses, entity mutations |

### 2. Zero-Trust Safe HTML Handling & Sanitization
All custom rich-text content, blog articles, and dynamic page HTML are strictly filtered through an enterprise-grade semantic sanitizer (`src/lib/sanitize.ts`):
- Explicit whitelist of semantic HTML tags (`p`, `h1`-`h6`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `table`, `a`, `img`, etc.)
- Strips all executable `<script>`, `<style>`, `<iframe>`, `<embed>`, `<object>` vectors.
- Strips malicious pseudo-protocols (`javascript:`, `vbscript:`, `data:`).
- Removes all inline event handlers (`onclick`, `onerror`, `onload`, `onmouseover`, etc.).

### 3. Granular Administrative Roles
- `SUPER_ADMIN`: Unrestricted platform access including financial gateways, LLM keys, security policies, and user privilege assignment.
- `ADMIN`: User management, subscriptions, transactions, and activity auditing.
- `CONTENT_MANAGER`: Website builder, header/footer, pages, blog, testimonials, FAQs, theme, and media library.
- `SUPPORT`: Read-only access to user directories, subscription status, and activity telemetry.

### 4. CMS REST API Reference (`/api/v1/admin/cms/*`)
- `GET / PUT  /api/v1/admin/cms/header` — Read / update header settings and navigation items
- `GET / PUT  /api/v1/admin/cms/footer` — Read / update footer settings, columns, and social links
- `GET / POST / PUT / DELETE /api/v1/admin/cms/sections` — Homepage sections ordering, visibility, and content
- `GET / POST / DELETE /api/v1/admin/cms/pages` — Dynamic page creation, update, revisions, and rollback
- `GET / POST / DELETE /api/v1/admin/cms/pricing` — Manage pricing tiers, monthly/annual rates, and feature lists
- `GET / POST / DELETE /api/v1/admin/cms/testimonials` — Customer testimonials CRUD
- `GET / POST / DELETE /api/v1/admin/cms/faqs` — Categorized FAQs CRUD
- `GET / POST / DELETE /api/v1/admin/cms/blog` — Blog articles and categories CRUD
- `GET / POST / PUT / DELETE /api/v1/admin/cms/media` — Media assets upload, update, and deletion
- `GET / POST / DELETE /api/v1/admin/cms/announcements` — Announcement bars and promotional modal popups
- `GET / PUT  /api/v1/admin/cms/theme` — Global brand theme palette and typography
- `GET / PUT  /api/v1/admin/cms/seo` — Global SEO metadata, Open Graph cards, and tracking IDs
- `GET / PUT / POST /api/v1/admin/cms/email` — SMTP email configuration and test email dispatch
- `GET / PUT  /api/v1/admin/cms/security` — Security policies, rate limiting, and maintenance mode

---

## 💳 Commercial Subscription, Billing & Quota Enforcement (Part 5)

SocialHive incorporates an enterprise-grade commercial billing engine, provider-independent payment abstractions, server-side quota enforcement, and a comprehensive user billing dashboard.

### 1. The 5 Default Commercial SaaS Plans

All plans, prices, trial durations, and quotas are configurable through the Admin Panel (`/admin/pricing`):

| Plan Tier | Slug | Monthly Rate | Annual Discounted Rate | Trial | Key Quotas & Limits |
|---|---|---|---|---|---|
| **Free Trial** | `free-trial` | $0 | $0 | 14 Days | 3 Accounts, 30 Scheduled Posts, 25 AI Gens, 5 AI Images, 1 Team Seat, 500 MB Storage |
| **Starter** | `starter` | $29/mo | $24/mo ($288/yr) | 14 Days | 5 Accounts, 150 Scheduled Posts, 75 AI Gens, 15 AI Images, 2 AI Videos, 2 Seats, 2 GB Storage |
| **Professional** | `professional` | $79/mo | $65/mo ($780/yr) | 14 Days | 15 Accounts, 750 Scheduled Posts, 300 AI Gens, 60 AI Images, 15 AI Videos, 5 Seats, 3 Workspaces, 5 Clients, Unified Social Inbox, 10 GB Storage |
| **Business** | `business` | $149/mo | $119/mo ($1,428/yr) | 14 Days | 35 Accounts, 2,500 Scheduled Posts, 800 AI Gens, 200 AI Images, 40 AI Videos, 15 Seats, 10 Workspaces, 15 Clients, Priority Social Inbox, Approval Workflows, 50 GB Storage |
| **Agency** | `agency` | $299/mo | $239/mo ($2,868/yr) | 14 Days | 100 Accounts, 10,000 Scheduled Posts, 2,500 AI Gens, 600 AI Images, 120 AI Videos, 50 Seats, 30 Workspaces, 50 Clients, Real-time Social Inbox, White-Label Portals, 250 GB Storage |

### 2. All 11 Server-Enforced Plan Limits
Every user action is guarded by `SubscriptionEnforcementService` on the server before mutating state:
1. `maxSocialAccounts`: Maximum connected social network profiles across workspace
2. `maxScheduledPosts`: Maximum active posts waiting in publishing queues
3. `aiGenerationsMonthly`: Text copilot generations per calendar month
4. `aiImageCreditsMonthly`: AI graphic asset generation credits per month
5. `aiVideoCreditsMonthly`: AI video short generation credits per month
6. `maxTeamMembers`: Maximum collaborators and staff seats per workspace
7. `maxWorkspaces`: Maximum brand workspaces created by account owner
8. `maxClients`: External agency client portals with isolated review permissions
9. `storageMb`: Cloud asset library file storage capacity in Megabytes
10. `analyticsRetentionDays`: Historical post engagement telemetry retention (14 to 365 days)
11. `hasSocialInbox`: Boolean capability unlocking unified multi-network comment & DM inbox

### 3. Server-Side Limit Violation Handling
When a quota is exceeded, the server rejects the request with an HTTP 403 Forbidden and structured payload:
```json
{
  "success": false,
  "error": {
    "code": "SUBSCRIPTION_LIMIT_EXCEEDED",
    "message": "Limit exceeded for Connected Social Profiles: You are using 15 of 15 allowed on the Professional plan. Please upgrade to Business to unlock additional capacity.",
    "details": {
      "metric": "socialAccounts",
      "current": 15,
      "max": 15,
      "plan": "Professional",
      "suggestedPlan": "Business"
    }
  }
}
```

### 4. Subscription Lifecycles & Grace Period
- **Start Subscription**: Instantly activates plan or 14-day trial without card requirement.
- **Plan Upgrade / Downgrade**: Immediate cycle switch with real-time coupon discount evaluation and automatic invoice generation.
- **Renewals**: Automated period extension, billing date advance, and paid invoice dispatch.
- **Failed Payment Handling**:
  - Increments failure retry count.
  - Transitions workspace into a **7-Day Payment Grace Period** (`GRACE_PERIOD`).
  - Workspace features remain operational while alerting the user to update their card.
  - If unrecovered after 7 days, workspace status suspends (`PAST_DUE`).
- **One-Click Payment Recovery**: Retries billing charge, clears failure count, and restores `ACTIVE` status.
- **Audit Logs**: Immutable audit log of every subscription state transition (`CREATED`, `UPGRADED`, `DOWNGRADED`, `CANCELED`, `RENEWED`, `PAYMENT_FAILED`, `PAYMENT_RECOVERED`, `TRIAL_EXTENDED`).

### 5. Promotional Coupons & Discount Engine
- Discount types: `PERCENTAGE` (% off) and `FIXED` ($ off).
- Usage caps: `maxRedemptions`, tracked `redemptionsCount`, and `perUserLimit`.
- Plan restrictions: Target specific tiers (`['professional', 'agency']`) or `['all']`.
- Expiry date validation and live client-side discount preview.

### 6. User Billing Dashboard (`/dashboard/subscription`)
- **Current Plan Display**: Live badge, price, billing interval, auto-renew toggle, and status indicators.
- **Quota Progress Bars**: Real-time meters for Social Accounts, Scheduled Posts, AI Copilot, Team Seats, Storage, and Social Inbox.
- **Upgrade/Downgrade Modal**: 5-plan comparison switcher, monthly/annual toggle, and live coupon input with discount preview.
- **Cancellation Safeguard Modal**: Reason survey, immediate vs period-end cancellation choice.
- **Invoicing Ledger & Printable Receipts**: Downloadable and printable electronic invoice receipts with itemized tax, discount, line items, and EIN.

### 7. Admin Subscriptions & MRR Center (`/admin/subscriptions`)
- Platform telemetry: Total MRR, active subscribers, trialing cohort, past-due counts, churn rate.
- Search and filter by workspace, user email, plan, and status.
- Admin action menu: Manual plan change override, trial duration extension, failed payment simulation, and payment recovery.
- Integrated Coupons Management tab: Create, toggle, and delete promotional coupons.

### 8. Subscription & Billing REST APIs
- `GET  /api/v1/subscriptions/current` — Get active subscription, quotas, usage meters, and available plans
- `POST /api/v1/subscriptions/start` — Start a new trial or paid subscription
- `POST /api/v1/subscriptions/upgrade` — Upgrade or switch plan tier with coupon support
- `POST /api/v1/subscriptions/cancel` — Cancel subscription with reason tracking
- `POST /api/v1/subscriptions/renew` — Advance billing period and issue renewal invoice
- `POST /api/v1/subscriptions/coupon/validate` — Validate coupon code and return discount calculation
- `POST /api/v1/subscriptions/enforce/check` — Server-side quota check and limit enforcement test
- `GET  /api/v1/subscriptions/invoices` — List billing invoices
- `GET  /api/v1/subscriptions/invoices/[id]` — Detailed electronic receipt data
- `GET  /api/v1/admin/subscriptions` — Platform MRR telemetry and subscriber list
- `PUT  /api/v1/admin/subscriptions/[id]/plan` — Administrative manual plan override
- `PUT  /api/v1/admin/subscriptions/[id]/trial` — Extend free trial days
- `PUT  /api/v1/admin/subscriptions/[id]/status` — Administrative status change
- `POST /api/v1/admin/subscriptions/[id]/simulate-payment-failure` — Test failed billing charge & grace period
- `POST /api/v1/admin/subscriptions/[id]/retry-payment` — Recover payment and restore active status
- `GET  /api/v1/admin/coupons` — List all promotional coupons
- `POST /api/v1/admin/coupons` — Create promotional coupon
- `PUT  /api/v1/admin/coupons/[id]` — Update coupon settings
- `DELETE /api/v1/admin/coupons/[id]` — Delete coupon

---

## 💳 Multi-Payment Gateway Architecture (Part 6)

SocialHive implements an enterprise-grade multi-gateway payment routing and transaction ledger system supporting 13 global, regional, and cryptocurrency payment providers.

### 1. Supported Gateway Catalog

| Gateway | Category | Supported Currencies | Supported Payment Methods | Recurring Subscriptions |
| :--- | :--- | :--- | :--- | :---: |
| **Razorpay** | Indian Aggregator | INR, USD, EUR, GBP | UPI, UPI QR, Indian Cards, Net Banking, Wallets | ✅ Yes |
| **Cashfree** | Indian Aggregator | INR, USD | UPI, UPI QR, Net Banking, Indian Cards, Wallets | ❌ Single Charge |
| **PayU** | Indian Aggregator | INR | UPI, Indian Cards, Net Banking, Wallets | ❌ Single Charge |
| **PhonePe** | Indian Aggregator | INR | Direct UPI, Dynamic UPI QR, Wallets, Indian Cards | ❌ Single Charge |
| **CCAvenue** | Indian Aggregator | INR, USD, EUR, GBP, AED | 55+ Net Banking Banks, Indian & International Cards | ❌ Single Charge |
| **Stripe** | International | USD, EUR, GBP, INR, 135+ | Visa, Mastercard, AMEX, Cards | ✅ Yes |
| **PayPal** | International | USD, EUR, GBP, 25+ | PayPal Wallet, Global Cards | ✅ Yes |
| **2Checkout / Verifone** | International | USD, EUR, GBP | Global Cards, Regional Wallets | ❌ Single Charge |
| **Paddle** | Merchant of Record | USD, EUR, GBP | Global Cards, Apple Pay, PayPal | ✅ Yes |
| **Lemon Squeezy** | Merchant of Record | USD, EUR, GBP | Global Cards, Apple Pay, Google Pay | ✅ Yes |
| **NOWPayments** | Crypto Gateway | USD, EUR, BTC, ETH, USDT | BTC, ETH, USDT, USDC, LTC | ❌ Single Charge |
| **CoinPayments** | Crypto Gateway | USD, BTC, ETH, USDT, LTC | Multi-Coin Crypto Wallets | ❌ Single Charge |
| **Coinbase Commerce** | Crypto Gateway | USD, BTC, ETH, USDC | Direct Crypto, Coinbase Wallets | ❌ Single Charge |

### 2. Core Payment Security & Anti-Fraud Principles
- **No Client-Side Activations**: Subscriptions are **never** activated based on browser redirect query parameters (`/checkout/success?session_id=...`). Every transaction requires cryptographic signature validation or direct server-to-server confirmation.
- **Strict Capability Filtering**: Checkout only displays payment methods and intervals actually supported by the selected provider and merchant tier.
- **Recurring Guardrails**: Recurring automated billing is strictly restricted to providers with recurring engine capabilities (Stripe, Razorpay, PayPal, Paddle, Lemon Squeezy). Crypto and non-recurring providers are routed through single-charge upfront billing with manual renewal reminders.
- **Cryptographic Webhook Verifiers**:
  - `WebhookVerifier.verifyStripe`: Timestamped HMAC-SHA256 (`stripe-signature`).
  - `WebhookVerifier.verifyRazorpay`: HMAC-SHA256 (`x-razorpay-signature`).
  - `WebhookVerifier.verifyPhonePe`: `SHA256(Base64Payload + "/v3/charge" + SaltKey) + "###" + SaltIndex` (`X-VERIFY`).
  - `WebhookVerifier.verifyCashfree`: Timestamped HMAC-SHA256 (`x-webhook-signature`).
  - `WebhookVerifier.verifyPayU`: Multi-parameter reverse hash checking.
  - `WebhookVerifier.verifyLemonSqueezy`: HMAC-SHA256 (`x-signature`).
  - `WebhookVerifier.verifyCryptoHmac`: SHA512/SHA256 IPN secret validation.
- **Idempotent Financial Ledger**: Prevents duplicate credits through transaction UUID collision detection and atomic status locking.

### 3. Payment API Endpoints
- `GET  /api/v1/payments/gateways` — Available active gateways filtered by currency, country, and recurring support
- `POST /api/v1/payments/checkout/initiate` — Generate provider checkout session, order ID, or payment intent
- `POST /api/v1/payments/checkout/verify` — Server-side cryptographic signature verification & subscription activation
- `POST /api/v1/payments/webhooks/[gateway]` — Webhook dispatcher with signature verification
- `GET  /api/v1/admin/payments/gateways` — All 13 gateway configuration cards for Super Admin
- `PUT  /api/v1/admin/payments/gateways/[id]` — Update gateway API keys, mode, and enabled status
- `POST /api/v1/admin/payments/gateways/[id]/test` — Ping and test gateway sandbox connectivity
- `GET  /api/v1/admin/transactions` — Live transactions ledger with volume analytics and status filters
- `POST /api/v1/admin/transactions/[id]/refund` — Process verified full or partial refund
- `GET  /api/v1/admin/transactions/export` — Download complete financial ledger in RFC 4180 CSV format

---

## 🤖 Advanced Multi-AI Content Studio (Part 7)

SocialHive incorporates a commercial-grade, multi-provider generative AI engine offering intelligent automatic routing and manual model selection across Text, Image, Video, and Voice modalities.

### 1. Two AI Selection Modes
1. **Automatic AI Mode**:
   - Intelligently determines task type from the chosen tool (`TEXT`, `IMAGE`, `VIDEO`, `VOICE`).
   - Prioritizes models based on admin priority rankings, capability match, and availability.
   - **Cost Safeguard Guarantee**: Strictly enforces that fallback routing will **never silently switch to a more expensive provider**. If an upstream provider fails, fallback only routes to equal or lower-cost providers within the admin's `maxCostThreshold`.
2. **Manual AI Selection Mode**:
   - Allows users to select their preferred Provider (OpenAI, Gemini, Claude, Grok, DeepSeek, Runway, ElevenLabs, etc.).
   - Choose specific enabled models (e.g., GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro).
   - Configure language (30+ languages) and tone (Executive, Conversational, Witty, Urgent, Educational, etc.).
   - Upfront estimated token cost and credit requirement display.

### 2. Multi-Provider & Model Catalog

| Modality | Providers Supported | Frontier Models | Capabilities |
| :--- | :--- | :--- | :--- |
| **Text** | **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o1-preview` | Fast inference, structured JSON, deep reasoning |
| **Text** | **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash` | 2M massive context, multimodal, high throughput |
| **Text** | **Anthropic Claude** | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku` | Nuanced copywriting, human-like voice, thought leadership |
| **Text** | **xAI Grok** | `grok-2-latest`, `grok-beta` | Real-time social awareness, bold hooks, witty engagement |
| **Text** | **DeepSeek** | `deepseek-chat` (V3), `deepseek-reasoner` (R1) | Ultra-low cost, chain-of-thought, mathematical logic |
| **Image** | **OpenAI Image** | `dall-e-3`, `dall-e-2` | HD photorealism, typography fidelity, aspect ratios |
| **Image** | **Gemini Image** | `imagen-3.0-generate-002` | Commercial design, vivid lighting, aesthetic realism |
| **Image** | **Flux Compatible** | `flux-1-dev` | 12B rectified flow, artistic social banners |
| **Video** | **Runway ML** | `gen3a_turbo`, `gen2` | 1080p cinematic video, temporal motion consistency |
| **Video** | **Google Veo** | `veo-2.0-generate-001` | High-definition generative video motion |
| **Voice** | **ElevenLabs** | `eleven_multilingual_v2`, `turbo_v2.5` | Hyper-realistic voiceover, 29 languages, emotional cadence |
| **Voice** | **OpenAI Audio** | `tts-1`, `tts-1-hd` | Natural multi-voice conversational speech synthesis |

### 3. The 12 AI Tools
1. **Caption Generator**: Generates platform-optimized viral captions with scroll-stopping hooks and curated hashtags.
2. **Hashtag Generator**: Segmented 4-tier hashtag matrix (High-volume, Community, Hyper-niche, Branded).
3. **Post Ideas Generator**: 5-7 actionable content angles mapped to evergreen, news, and BTS buckets.
4. **Content Writer**: 600-800 word executive thought-leadership articles and LinkedIn essays.
5. **Content Rewriter**: Dual-version rewriting (Ultra-punchy skimmable vs. story-driven connection).
6. **Tone Changer**: Re-voices copy into 10 distinct brand personas without losing core message integrity.
7. **Ad Copy Generator**: Direct-response copy employing PAS, AIDA, and BAB advertising frameworks.
8. **Translator**: Contextual localization across 30+ languages preserving social colloquialisms and slang.
9. **AI Content Planner**: 7-day social publishing calendar with daily slots, themes, and formats.
10. **AI Image Generator**: Creates prompt-driven square (1:1), landscape (16:9), and story (9:16) graphics.
11. **AI Video Generator**: Generates dynamic short-form video clips and product motion teasers.
12. **AI Voiceover**: Studio-grade narration audio files with selectable voices and emotional inflections.

### 4. AI Credits System & Anti-Fraud Guarantee
- **Zero-Waste Guarantee**: Credits are **NEVER deducted for failed generations**. Credit checks run pre-flight, and deductions only commit upon validated output delivery.
- **Subscription Allowances**: Free (50 text, 10 images, 2 videos, 5 voice), Starter (250 text, 50 images, 10 videos, 25 voice), Professional (1,000 text, 200 images, 40 videos, 100 voice), Business (5,000 text, 1,000 images, 150 videos, 500 voice), Agency (25,000 text, 5,000 images, 500 videos, 2,500 voice).
- **Credit Packs**: Instant top-up packs (Starter Boost, Creative Pack, Agency Scale).
- **Interactive Editor Workflows**: In-place text editing, media download/playback, Save Draft, Save Reusable Template, and one-click dispatch to the **Social Scheduler Queue & Calendar**.

### 5. Admin AI Management Center (`/admin/ai-providers`)
- **Credentials & Connection Testing**: Real API latency ping test with status indicator (`CONNECTED` only after successful test).
- **Model Pricing Control**: Customize input/output token pricing per model and set default models per task.
- **Routing Rules Policy**: Adjust priority ordering, fallback providers, and cost caps.
- **Tool Customization**: Edit system prompts and credit costs for each of the 12 tools.
- **Cost Telemetry & Audit Logs**: Real-time token usage, platform cost tracking, and error recovery logs.

---

## 🌐 Part 8: Real Social Media API Integrations

SocialHive provides native, enterprise-grade integrations with the **8 official social media platforms** through compliant OAuth 2.0 and official REST/Graph APIs.

### 1. Supported Platforms & Capabilities

| Platform | Official API Engine | Supported Post Types | Character Limits & Media Rules | Account Prerequisites |
| :--- | :--- | :--- | :--- | :--- |
| **Instagram** | Meta Graph API v20.0 | Image, Video, Carousel, Reels | 2,200 chars • 10 carousel slides • 1:1, 4:5, 9:16 aspect ratios | **Business or Creator Account** connected to a published Facebook Page |
| **Facebook** | Meta Graph API v20.0 | Text, Image, Video, Carousel, Reels | 63,206 chars • 10 carousel items • Page posting only | **Facebook Page Admin / Editor permissions** (Personal profiles disallowed by Meta) |
| **LinkedIn** | Community Management API v2 | Text, Image, Video, Carousel | 3,000 chars • 20 images • Member profile or Org page | Organization Admin role required for LinkedIn Company Pages |
| **TikTok** | Content Posting API v2 | Video, Photo Carousel | 2,200 chars • 35 slides • Vertical 9:16 preferred • Min 3s, Max 600s | TikTok Creator or Business Account • `video.upload` scope approval |
| **YouTube** | YouTube Data API v3 | Video, Shorts | 5,000 char description • Text posts not supported by public API | Verified YouTube channel with phone verification for uploads > 15 mins |
| **Pinterest** | Pinterest API v5 | Image, Video, Idea Pins | 500 chars • 100 char title • Boards required • Destination links | Pinterest Business Account • Board must be created prior to pinning |
| **X (Twitter)** | Twitter Developer API v2 | Text, Image, Video | 280 chars • 4 images max • Basic Auth header token exchange | Elevated / Pro access tier for media uploads • OAuth 2.0 PKCE |
| **Google Business** | Business Profile API v1 | Text, Image | 1,500 chars • Calls-to-action • Verified physical or service area | Google Business Profile Manager ownership with verified physical address |

### 2. Strict Zero-Simulation Guarantee
- **Never simulate success**: If an account lacks permissions or approval from Meta, Google, or ByteDance, the system surfaces clear, actionable diagnostics directly to the user.
- **Pre-flight Validation**: Media, aspect ratios, file sizes, and character limits are enforced *before* network transmission, saving API quotas and preventing partial publishing failures.

### 3. OAuth 2.0 PKCE Architecture
- Cryptographic `code_verifier` (43-128 random URL-safe characters) and SHA-256 base64url `code_challenge`.
- Random high-entropy CSRF `state` tokens cached with 15-minute expiration windows.
- Automatic long-lived token exchange and proactive background renewal.

### 4. Admin Social API Settings (`/admin/integrations`)
- Complete configuration cards for all 8 platforms.
- Client ID / App ID and masked Secret inputs with reveal toggle.
- Direct Redirect URI with one-click clipboard copying.
- Live latency and reachability testing (`POST /api/v1/admin/social/platforms/[id]/test`).
- Configurable OAuth permissions and App Review status indicators (`APPROVED`, `PENDING_REVIEW`, `IN_DEVELOPMENT`, `REJECTED`).
- Independent ON/OFF toggles per platform.

### 5. User Connected Accounts Hub (`/dashboard/accounts`)
- Real-time connected account cards with avatar, brand badge, handle, account type, and live follower metrics.
- Token health indicators (`CONNECTED`, `EXPIRING`, `EXPIRED`, `REQUIRES_REAUTH`).
- One-click manual token refresh and account disconnection with permission revocation.
- Account connection modal displaying official platform prerequisites and required scopes.

---

## 📅 Part 9: Content Calendar & Automatic Post Scheduler

SocialHive incorporates an enterprise-grade social media scheduling, calendar, and queuing system inspired by SocialBee, powered by Redis and BullMQ.

### 1. Interactive Content Calendar (`/dashboard/calendar`)
- **Multi-View Modes**:
  - **Daily View**: Granular 24-hour vertical timeline (00:00 - 23:00) with detailed post cards, category chips, and platform tags.
  - **Weekly View**: 7-day column grid with time slots, status badges, and quick post creation buttons.
  - **Monthly View**: Full interactive month grid with event counters, color-coded category indicators, and day cells.
- **Filters & Controls**:
  - Filter simultaneously by Platform (all 8 platforms), Connected Account, Content Category, Status (`DRAFT`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `CANCELLED`), and Workspace.
  - Quick navigation (Previous, Next, Today).
- **Post Interaction & Rescheduling**:
  - Interactive Post Details modal with live content preview, media preview, confirmed platform post IDs, failure diagnostics, one-click immediate publish, rescheduling controls, and post cancellation.

### 2. Full Post Creator (`PostCreatorModal`)
- **Multi-Channel Media Composer**:
  - Real-time character count with explicit platform over-limit alerts (e.g. 280-char warning for X / Twitter).
  - Multi-platform selection pills (Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest, Twitter, Google Business).
  - Multiple connected account checkbox selection.
  - Media attachments (Text, Images, Videos, Carousels).
  - Hashtags manager with quick add and badge removal.
  - Call To Action (CTA) selector (Learn More, Sign Up, Shop Now, Book Now, Subscribe, Link in Bio).
  - Timezone selector supporting 12 global timezones (UTC, EST, CST, MST, PST, GMT, CET, GST, IST, SGT, JST, AEST).
  - Action modes: **Publish Now** (immediate platform dispatch), **Schedule** (delayed BullMQ queue job), and **Save Draft**.
  - Recurring cadence settings (Daily, Weekly, Bi-weekly, Monthly, Every X Days) and Evergreen recycling toggle.
  - Real-time live platform preview tabs (Twitter card, LinkedIn post, Instagram preview).

### 3. SocialBee-Inspired Queue Engine (`/dashboard/queue`)
- **Purpose-Driven Content Buckets**:
  - Categories: *Evergreen Insights*, *Promotional & Product Updates*, *Industry News & Trends*, *Behind The Scenes & Culture*, plus custom user-created categories.
  - Weekly recurrent time slots per category (day of week, time string, timezone).
  - Queue pause/resume controls per category.
  - Ordered queue slot numbers (#1, #2, #3...) with immediate publish and delete controls.
  - Evergreen recycling tracking with max recycle caps.

### 4. Background Processing & BullMQ Pipeline
- **Job Deduplication**: Deterministic `jobId` (`post_<id>`) guarantees duplicate publishing jobs are prevented.
- **Delayed Execution**: Accurate millisecond delay calculation targeting user's configured timezone.
- **Retries & Backoff**: Configured with 3 retry attempts and exponential backoff.
- **Platform Confirmation Enforcement**: Posts are **only marked `PUBLISHED` after official platform confirmation and remote post ID return**.
- **Queue Metrics**: Telemetry reporting for active, waiting, delayed, completed, and failed jobs.

### 5. In-App Notification Center
- Dropdown component in dashboard header with unread badge counter.
- Automatic notifications emitted for:
  - `PUBLISHING_SUCCESS`: Platform delivery confirmed with external IDs.
  - `PUBLISHING_FAILURE`: Failure diagnostics and reasons surfaced immediately.
  - `UPCOMING_POST`: Proactive reminder 3 hours prior to scheduled publishing.
  - `TOKEN_EXPIRATION`: Advance alert when platform OAuth token approaches expiration.

---

## 📊 Part 10 – Social Analytics & Unified Social Inbox

### 1. Social Media Analytics (`/dashboard/analytics`)
- **Key Performance Indicators**:
  - Total Audience / Followers count with net period growth and % change.
  - Impressions, Reach, Average Engagement Rate, and Total Interactions (Likes, Comments, Shares).
  - Customizable timeframes: Last 7 Days, Last 30 Days, Last 90 Days.
- **Cross-Platform Channel Comparison**:
  - Comparative breakdown across Instagram, LinkedIn, X (Twitter), YouTube, TikTok, and Facebook.
  - Platform-specific engagement rate, reach, and interaction statistics.
- **Official API Limitation Disclaimers**:
  - *YouTube Data API v3*: Subscribers and video views verified; external post share counts are unavailable via API.
  - *X (Twitter) Developer API v2 Pro*: Raw impressions verified; unique reach restricted by platform.
  - *TikTok API for Developers*: Video views and follower counts verified; audience demographic splits require ≥ 1,000 followers.
- **Reporting & Data Export**:
  - Formatted CSV export (`/api/v1/analytics/export?format=csv`) with comprehensive platform breakdown and best posts.
  - Print-ready PDF report generation with clean print CSS styling.
  - Platform metric synchronization & cache refresh engine (`POST /api/v1/analytics/sync`).

### 2. Unified Social Inbox (`/dashboard/inbox`)
- **Multi-Platform Communication Hub**:
  - Unified stream of direct messages, comments, and mentions across Instagram, LinkedIn, X, TikTok, and Facebook.
  - Sentiment badges (`LEAD`, `QUESTION`, `POSITIVE`, `NEUTRAL`) and real-time unread indicators.
  - Filter by status (All, Unread, Comments, DMs, Mentions, Archived) and live search by author/content.
- **Strict Official API Policy Compliance**:
  - **Meta Graph API 24-Hour Messaging Window**: Inbound Facebook & Instagram DMs enforce the strict 24-hour customer service window. If expired, external replies are securely blocked (`403 Forbidden`) with an explanatory policy banner.
  - Permitted replies are supported for active conversations and public comments.
- **Team Collaboration & Inbox Workflows**:
  - Conversation assignment to workspace team members (e.g., Support Staff, Account Managers).
  - Internal team notes tab allowing private collaboration visible only to staff.
  - Quick response pre-built templates for fast resolution.
  - One-click archive/unarchive and mark read/unread toggles.

### 3. Admin Platform Analytics Telemetry (`/admin/analytics`)
- **AI Token & Spend Telemetry**:
  - Live tracking of total tokens consumed (18.45M) and estimated USD expenditure ($142.85) broken down by model provider (OpenAI, Google Gemini, Anthropic Claude, DeepSeek).
- **Connected Accounts & Token Health**:
  - Real-time audit of total connected social profiles, active tokens, and accounts nearing authorization expiration.
- **Publishing Pipeline Throughput**:
  - 30-day publishing volume (1,286 posts) and daily throughput pace (48.6 posts/day).
- **API Error Monitoring**:
  - Telemetry recording platform API error codes (e.g. `META_403_RATE_LIMIT`, `TWITTER_429_TOO_MANY_REQUESTS`) and overall platform error rate (0.82%).
- **Platform Usage Share**:
  - Distribution of active channels across the platform (LinkedIn 38.2%, Instagram 24.1%, X 18.5%, Facebook 10.3%, TikTok 5.1%, YouTube 3.8%).

---

## 📸 Media Upload & Free Subscription Admin Controls

### 1. Photo & Video Upload Engine
- **Direct Multi-File Upload API (`POST /api/v1/media/upload`)**:
  - Multipart form upload supporting photos (JPG, PNG, WEBP, GIF, SVG up to 15MB) and videos (MP4, WEBM, MOV, AVI up to 100MB).
  - Automatically saves verified files to `public/uploads/` and serves via Next.js static asset pipeline (`/uploads/...`).
  - Automatic format detection: auto-selects `IMAGE`, `VIDEO`, or `CAROUSEL` post formats based on attached files.
- **Post Creator Modal Upload Suite (`/dashboard/calendar`, `/dashboard/queue`, `/dashboard`)**:
  - Dedicated **Upload Photo** and **Upload Video** action buttons.
  - Interactive **Drag & Drop Zone** with visual glow and real-time upload progress.
  - Attached media gallery with image thumbnails, playable video cards, and remove buttons.
  - Live social preview cards (Twitter, LinkedIn, Instagram) rendering high-resolution photos and playable video previews.
- **Admin Media Library (`/admin/media`)**:
  - Direct photo and video upload directly into the CMS Media Library.
  - Automatic metadata population (file name, file size, MIME type, preview thumbnail).

### 2. Free Subscription ON/OFF Master Toggle (Admin Panel)
- **Admin Pricing Page (`/admin/pricing`)**:
  - Prominent **Free Subscription & 14-Day Trial Master Switch** banner with 1-click ON/OFF toggle.
  - Quick ON/OFF toggle pill buttons directly on every individual pricing plan card.
  - Immediate real-time persistence via `PATCH /api/v1/admin/cms/pricing`.
- **Admin Subscriptions Page (`/admin/subscriptions`)**:
  - Dedicated **Free Tier & 14-Day Trial Access Control** banner allowing platform administrators to enable or disable free trial signups instantly.
- **Instant Platform Enforcement**:
  - When toggled **OFF**: The Free Trial plan is immediately removed from public `/pricing`, `/checkout`, and user registration flows, requiring users to pick a paid tier.
  - When toggled **ON**: The 14-day Free Trial is re-enabled for instant user onboarding.

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with Node.js 20 and 26)
- PostgreSQL database instance
- Redis server (optional for local UI development, required for background queues)

### 2. Setup Environment
```bash
cp .env.example .env
```
Update your `DATABASE_URL` and `REDIS_URL` in `.env` if using a live database:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/socialhive_db?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Database Migrations (When PostgreSQL is connected)
```bash
npx prisma migrate dev --name init
```
*Note: If database credentials are unavailable or local PostgreSQL is offline, SocialHive automatically operates with safe CMS fallbacks and indicates pending migrations.*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website.
- Dashboard Shell: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)
- Website CMS: [http://localhost:3000/admin/cms](http://localhost:3000/admin/cms)
- API Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 6. Production Build
```bash
npm run build
npm start
```
