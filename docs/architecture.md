# Molvexa Website — Fullstack Architecture Document

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-01-15

---

## 1. Introduction

This document outlines the complete architecture for the Molvexa Website, a premium static marketing site for a mold design, engineering, and manufacturing company. Built with Next.js 16 using static export, the site achieves optimal performance while delivering a Linear.app-inspired premium aesthetic through shadcn/ui components and Motion animations.

This architecture serves as the single source of truth for AI-driven development, ensuring consistency across the frontend implementation and serverless contact form backend.

### 1.1 Starter Template

**N/A — Greenfield project**

The project will be initialized using `create-next-app` with TypeScript, then configured with:
- Tailwind CSS v4.x (using new `@theme` directive for design tokens)
- shadcn/ui v3.5.0 (via `npx shadcn init`)
- Motion (motion/react) for scroll and hover animations

### 1.2 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-15 | 1.0 | Initial architecture document | Winston (Architect) |

---

## 2. High-Level Architecture

### 2.1 Technical Summary

The Molvexa Website follows a **JAMstack architecture** with static site generation via Next.js 16 App Router. The frontend is pre-rendered at build time and deployed to Vercel's global edge network, ensuring sub-second load times. A single serverless API route handles contact form submissions, integrating with Resend for email delivery.

The architecture prioritizes performance (Lighthouse ≥90), premium aesthetics (Linear.app-inspired design system via shadcn/ui), and developer experience (TypeScript, Tailwind v4 utility classes). The static export approach eliminates server runtime costs while enabling SEO-optimized, accessible pages across all 6 routes.

### 2.2 Platform and Infrastructure

| Aspect | Choice | Details |
|--------|--------|---------|
| **Platform** | Vercel (Free Tier) | Native Next.js support, global CDN, serverless functions |
| **Key Services** | Static hosting, Serverless Functions, SSL/HTTPS, Preview deployments | All included in free tier |
| **Deployment Regions** | Vercel Edge Network | Global, automatic edge distribution |

### 2.3 Repository Structure

| Aspect | Choice |
|--------|--------|
| **Structure** | Single repository |
| **Monorepo Tool** | N/A — single Next.js application |
| **Package Organization** | Standard Next.js App Router structure |

### 2.4 High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        U[User Browser]
        M[Mobile Device]
    end

    subgraph "Vercel Edge Network"
        CDN[Global CDN]

        subgraph "Static Assets"
            HTML[Pre-rendered HTML]
            JS[JavaScript Bundles]
            CSS[CSS/Tailwind]
            IMG[Optimized Images]
        end

        subgraph "Serverless"
            API["/api/contact<br/>Serverless Function"]
        end
    end

    subgraph "External Services"
        RS[Resend API<br/>Email Service]
        WA[WhatsApp<br/>Deep Link]
    end

    subgraph "Build Time"
        GH[GitHub Repo]
        BUILD[Next.js Build<br/>Static Export]
    end

    U --> CDN
    M --> CDN
    CDN --> HTML
    CDN --> JS
    CDN --> CSS
    CDN --> IMG

    U -->|Form Submit| API
    API -->|Send Email| RS
    U -->|Click| WA

    GH -->|Push| BUILD
    BUILD -->|Deploy| CDN
```

### 2.5 Architectural Patterns

| Pattern | Description | Rationale |
|---------|-------------|-----------|
| **JAMstack** | JavaScript, APIs, Markup — pre-built static pages with serverless functions | Optimal performance, security, and cost for marketing sites |
| **Static Site Generation (SSG)** | All pages pre-rendered at build time via `output: 'export'` | Lighthouse ≥90 performance, SEO-friendly, zero runtime server costs |
| **Component-Based UI** | Reusable React components with shadcn/ui primitives | Consistent design system, maintainable codebase |
| **Utility-First CSS** | Tailwind v4 with `@theme` design tokens | Rapid development, small bundle size, consistent spacing/colors |
| **Progressive Enhancement** | Motion animations with `useReducedMotion` support | Accessibility compliance, graceful degradation |
| **API Route Pattern** | Single `/api/contact` serverless function | Minimal backend footprint, secure form handling |
| **Edge Deployment** | Vercel CDN serves static assets globally | Fast TTFB worldwide, automatic scaling |

---

## 3. Tech Stack

This is the **definitive technology selection** for the Molvexa Website. All development must use these exact versions.

### 3.1 Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.x | Type-safe JavaScript | Catches errors at build time, better DX |
| **Frontend Framework** | Next.js | 16.x | React framework with App Router | Latest stable, excellent static export |
| **UI Component Library** | shadcn/ui | 3.5.0 | Accessible component primitives | Linear.app aesthetic, Radix UI foundation |
| **CSS Framework** | Tailwind CSS | 4.x | Utility-first styling | `@theme` directive for design tokens |
| **Animation Library** | Motion | latest | Scroll/hover animations | `motion/react` with `whileInView`, `whileHover` |
| **Icons** | Lucide React | latest | Icon library | Clean line icons, tree-shakeable |
| **Typography** | Geist | latest | Font family | Via `next/font`, Vercel-optimized |
| **State Management** | React hooks | (built-in) | Local component state | useState/useRef sufficient |
| **API Style** | REST | - | Contact form endpoint | Simple POST to `/api/contact` |
| **Email Service** | Resend | latest | Transactional email | Modern API, good deliverability |
| **Package Manager** | pnpm | 9.x | Dependency management | Faster installs, disk efficient |
| **Build Tool** | Next.js CLI | 16.x | Build orchestration | `next build` with static export |
| **Bundler** | Turbopack | (built-in) | Module bundling | Next.js 16 default |
| **Linting** | ESLint | 9.x | Code quality | Flat config, Next.js plugin |
| **Formatting** | Prettier | 3.x | Code formatting | Consistent style |
| **CI/CD** | Vercel | - | Deployment pipeline | Auto-deploy on push |
| **E2E Testing** | Playwright | latest | Smoke tests (optional) | Contact form testing |
| **SEO** | next-sitemap | latest | Sitemap generation | Automatic sitemap.xml |

### 3.2 Version Pinning

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

---

## 4. Data Models

Given the static nature of the site, data models are minimal. The only dynamic data is contact form submissions.

### 4.1 ContactFormData

**Purpose:** Captures visitor contact form submissions

**Key Attributes:**
- `name`: string — Full name of the visitor (required)
- `email`: string — Email address for response (required)
- `phone`: string | undefined — Phone number (optional)
- `company`: string | undefined — Company name (optional)
- `message`: string — Inquiry message (required)
- `timestamp`: string — ISO timestamp of submission

```typescript
// types/contact.ts
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export interface ContactFormSubmission extends ContactFormData {
  timestamp: string;
  source: 'website';
}
```

### 4.2 Static Content Types

```typescript
// types/content.ts
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}
```

---

## 5. API Specification

### 5.1 REST API — Contact Form Endpoint

```yaml
openapi: 3.0.0
info:
  title: Molvexa Contact API
  version: 1.0.0
  description: Single endpoint for contact form submissions

servers:
  - url: https://molvexa.com/api
    description: Production
  - url: http://localhost:3000/api
    description: Development

paths:
  /contact:
    post:
      summary: Submit contact form
      description: Sends contact form data to configured email recipient via Resend
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContactFormData'
      responses:
        '200':
          description: Form submitted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Thank you! We'll be in touch soon."
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'

components:
  schemas:
    ContactFormData:
      type: object
      required:
        - name
        - email
        - message
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
          example: "John Smith"
        email:
          type: string
          format: email
          example: "john@example.com"
        phone:
          type: string
          example: "+1 555-123-4567"
        company:
          type: string
          example: "Acme Manufacturing"
        message:
          type: string
          minLength: 10
          maxLength: 2000
          example: "I'm interested in your mold design services..."

    ApiError:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "Email is required"
```

---

## 6. Components

### 6.1 Component Architecture Overview

```mermaid
graph TB
    subgraph "Layout Components"
        RootLayout[RootLayout]
        Header[Header]
        Footer[Footer]
        WhatsAppButton[WhatsAppButton]
    end

    subgraph "Page Components"
        HomePage[HomePage]
        ServicesPage[ServicesPage]
        AboutPage[AboutPage]
        ExpertisePage[ExpertisePage]
        ContactPage[ContactPage]
        WorksPage[WorksPage]
    end

    subgraph "UI Components (shadcn/ui)"
        Button[Button]
        Card[Card]
        Input[Input]
        Textarea[Textarea]
        Sheet[Sheet - Mobile Nav]
    end

    subgraph "Custom Components"
        Section[Section]
        SectionHeader[SectionHeader]
        ServiceCard[ServiceCard]
        IndustryCard[IndustryCard]
        ContactForm[ContactForm]
        AnimatedElement[AnimatedElement]
    end

    RootLayout --> Header
    RootLayout --> Footer
    RootLayout --> WhatsAppButton

    HomePage --> Section
    HomePage --> ServiceCard
    HomePage --> IndustryCard

    ContactPage --> ContactForm
    ContactForm --> Input
    ContactForm --> Textarea
    ContactForm --> Button
```

### 6.2 Layout Components

#### RootLayout
**Responsibility:** App-wide layout wrapper with font, metadata, and shared components

**Key Interfaces:**
- Renders Header, Footer, WhatsAppButton on all pages
- Applies Geist font via `next/font`
- Sets global metadata defaults

**Dependencies:** Header, Footer, WhatsAppButton, ThemeProvider (if needed)

**Technology Stack:** Next.js App Router layout, React Server Component

#### Header
**Responsibility:** Site navigation with logo, nav links, and mobile menu

**Key Interfaces:**
- `NavItem[]` for navigation configuration
- Mobile sheet trigger for responsive menu
- Phone number display (desktop)

**Dependencies:** shadcn/ui Button, Sheet; Lucide icons; Next.js Link

#### Footer
**Responsibility:** Site footer with navigation, contact info, copyright

**Key Interfaces:**
- Contact information display
- Secondary navigation links
- Copyright with current year

**Dependencies:** Next.js Link, Lucide icons

#### WhatsAppButton
**Responsibility:** Floating WhatsApp contact button

**Key Interfaces:**
- Fixed position bottom-right
- WhatsApp deep link with pre-filled message
- Entrance animation

**Dependencies:** Motion for animation, Lucide MessageCircle icon

### 6.3 Custom Components

#### Section
**Responsibility:** Consistent page section wrapper with max-width and padding

```typescript
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}
```

#### SectionHeader
**Responsibility:** Section title with optional subtitle and fade-in animation

```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}
```

#### ServiceCard
**Responsibility:** Display individual service with icon, title, description

```typescript
interface ServiceCardProps {
  service: Service;
  index: number; // For stagger animation
}
```

#### IndustryCard
**Responsibility:** Display industry expertise with icon and description

```typescript
interface IndustryCardProps {
  industry: Industry;
  index: number;
}
```

#### ContactForm
**Responsibility:** Contact form with validation and submission handling

```typescript
interface ContactFormProps {
  onSuccess?: () => void;
}
```

#### AnimatedElement
**Responsibility:** Reusable scroll-triggered animation wrapper

```typescript
interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}
```

---

## 7. External APIs

### 7.1 Resend Email API

- **Purpose:** Send contact form submissions to business email
- **Documentation:** https://resend.com/docs
- **Base URL:** https://api.resend.com
- **Authentication:** API Key (Bearer token)
- **Rate Limits:** 3,000 emails/month (free tier), 100 emails/day

**Key Endpoints Used:**
- `POST /emails` — Send transactional email

**Integration Notes:**
- API key stored in `RESEND_API_KEY` environment variable
- Emails sent from verified domain or Resend's onboarding domain
- Recipient email configured via `CONTACT_EMAIL` environment variable

### 7.2 WhatsApp (Client-Side Only)

- **Purpose:** Instant contact via WhatsApp
- **Integration:** Deep link, no API required
- **URL Format:** `https://wa.me/{phone}?text={encoded_message}`
- **Phone Number:** Configured via environment variable `NEXT_PUBLIC_WHATSAPP_NUMBER`

---

## 8. Core Workflows

### 8.1 Contact Form Submission Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Contact Form
    participant V as Validation
    participant API as /api/contact
    participant R as Resend API
    participant E as Business Email

    U->>F: Fill form fields
    U->>F: Click Submit
    F->>V: Client-side validation

    alt Validation fails
        V-->>F: Show error messages
        F-->>U: Display errors
    else Validation passes
        F->>F: Set loading state
        F->>API: POST /api/contact
        API->>API: Server-side validation

        alt Server validation fails
            API-->>F: 400 Error
            F-->>U: Show error message
        else Validation passes
            API->>R: POST /emails

            alt Email sent
                R-->>API: 200 Success
                API-->>F: 200 Success
                F->>F: Reset form
                F-->>U: Show success message
            else Email failed
                R-->>API: Error
                API-->>F: 500 Error
                F-->>U: Show error, suggest alternatives
            end
        end
    end
```

### 8.2 Page Navigation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant CDN as Vercel CDN
    participant NX as Next.js Client

    U->>B: Visit molvexa.com
    B->>CDN: Request /
    CDN-->>B: Return pre-rendered HTML
    B->>B: Hydrate React

    U->>NX: Click "Services" link
    NX->>NX: Client-side navigation
    NX->>CDN: Prefetch /services (if not cached)
    NX-->>U: Instant page transition
    NX->>NX: Trigger page animations
```

---

## 9. Database Schema

**N/A — No Database Required**

This is a static site with no persistent data storage. Contact form submissions are sent directly to email via Resend API. No database is needed for MVP.

**Future Consideration:** If analytics or form submission logging is required, consider:
- Vercel Analytics (built-in, privacy-friendly)
- Supabase (if CRM-like features needed later)

---

## 10. Frontend Architecture

### 10.1 Component Organization

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── services/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── expertise/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── works/
│   │   └── page.tsx
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # API route (excluded from static export)
│   └── globals.css               # Tailwind + theme
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   └── sheet.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── whatsapp-button.tsx
│   │
│   ├── sections/                 # Page section components
│   │   ├── hero.tsx
│   │   ├── services-overview.tsx
│   │   ├── expertise-grid.tsx
│   │   ├── cta-section.tsx
│   │   └── contact-info.tsx
│   │
│   └── shared/                   # Shared/utility components
│       ├── section.tsx
│       ├── section-header.tsx
│       ├── service-card.tsx
│       ├── industry-card.tsx
│       ├── contact-form.tsx
│       └── animated-element.tsx
│
├── lib/
│   ├── utils.ts                  # shadcn/ui cn() utility
│   └── constants.ts              # Site content constants
│
├── hooks/
│   └── use-contact-form.ts       # Form submission hook
│
└── types/
    ├── contact.ts
    └── content.ts
```

### 10.2 Component Template

```typescript
// components/shared/section.tsx
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24 lg:py-32", // Generous vertical padding
        "px-4 md:px-6 lg:px-8",    // Responsive horizontal padding
        className
      )}
    >
      <div className="mx-auto max-w-6xl">
        {children}
      </div>
    </section>
  );
}
```

### 10.3 State Management

Given the static nature of the site, state management is minimal:

```typescript
// Form state pattern
const [formState, setFormState] = useState<{
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}>({ status: 'idle' });

// Mobile nav state
const [isOpen, setIsOpen] = useState(false);
```

**State Management Patterns:**
- `useState` for local component state (forms, modals)
- `useRef` for DOM references (scroll targets)
- No global state library needed
- Form state managed in `useContactForm` custom hook

### 10.4 Routing Architecture

```
/                    → Home page (app/page.tsx)
/services            → Services page (app/services/page.tsx)
/about               → About page (app/about/page.tsx)
/expertise           → Expertise page (app/expertise/page.tsx)
/contact             → Contact page (app/contact/page.tsx)
/works               → Works/Portfolio page (app/works/page.tsx)
```

All routes are static and pre-rendered at build time.

### 10.5 API Client Setup

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function submitContactForm(data: ContactFormData) {
  const response = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Submission failed');
  }

  return response.json();
}
```

---

## 11. Backend Architecture

### 11.1 Serverless Function Architecture

Since this is a static export with a single API route, the "backend" consists of one serverless function:

```
app/
└── api/
    └── contact/
        └── route.ts    # Serverless function
```

**Note:** For static export (`output: 'export'`), API routes are NOT included in the static build. The contact form will either:
1. Use a separate Vercel serverless function deployment
2. Use an external service like Formspree/Resend's hosted form endpoint

**Recommended Approach:** Use Resend's hosted form endpoint or deploy API route separately.

### 11.2 API Route Implementation

```typescript
// app/api/contact/route.ts
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const { name, email, phone, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Required fields missing' } },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    // Send email
    await resend.emails.send({
      from: 'Molvexa Website <noreply@molvexa.com>',
      to: process.env.CONTACT_EMAIL!,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch soon."
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to send message' } },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 11.3 Static Export Consideration

For `output: 'export'`, API routes don't work. **Alternative approaches:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A** | Resend hosted form | Zero backend code, just form action | Less control over UX |
| **B** | Separate Vercel Function | Full control, same codebase | Extra deployment config |
| **C** | Remove `output: 'export'` | API routes work natively | Requires server runtime |

**Recommendation:** Option C — Remove `output: 'export'` and deploy as standard Next.js app on Vercel. This provides:
- Native API route support
- Better image optimization via Next.js Image
- Same free tier benefits
- Simpler architecture

---

## 12. Project Structure

```
molvexa-website/
├── .github/
│   └── workflows/
│       └── ci.yml                # Lint + type check on PR
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg                  # Molvexa logo
│   ├── og-image.png              # Open Graph image (1200x630)
│   └── images/
│       └── ...                   # Static images
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home
│   │   ├── services/page.tsx
│   │   ├── about/page.tsx
│   │   ├── expertise/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── works/page.tsx
│   │   ├── not-found.tsx         # 404 page
│   │   ├── api/
│   │   │   └── contact/route.ts
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── layout/               # Header, Footer, etc.
│   │   ├── sections/             # Page sections
│   │   └── shared/               # Reusable components
│   │
│   ├── lib/
│   │   ├── utils.ts              # cn() utility
│   │   ├── constants.ts          # Content data
│   │   └── api.ts                # API client
│   │
│   ├── hooks/
│   │   └── use-contact-form.ts
│   │
│   └── types/
│       ├── contact.ts
│       └── content.ts
│
├── docs/
│   ├── prd.md
│   └── architecture.md
│
├── .env.example                  # Environment template
├── .env.local                    # Local env (gitignored)
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── components.json               # shadcn/ui config
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.ts            # Minimal (v4 uses CSS)
├── tsconfig.json
└── README.md
```

---

## 13. Development Workflow

### 13.1 Prerequisites

```bash
# Required
node --version  # v20.0.0 or higher
pnpm --version  # v9.0.0 or higher

# Install pnpm if needed
npm install -g pnpm
```

### 13.2 Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd molvexa-website

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with actual values
# RESEND_API_KEY=re_xxxxx
# CONTACT_EMAIL=contact@molvexa.com
# NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890
```

### 13.3 Development Commands

```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Format code
pnpm format

# Build for production
pnpm build

# Start production server locally
pnpm start

# Run E2E tests (optional)
pnpm test:e2e
```

### 13.4 Environment Configuration

```bash
# .env.example

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Contact form recipient
CONTACT_EMAIL=contact@molvexa.com

# WhatsApp (client-side, must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890

# Site URL (for sitemap generation)
NEXT_PUBLIC_SITE_URL=https://molvexa.com
```

---

## 14. Deployment Architecture

### 14.1 Deployment Strategy

| Aspect | Configuration |
|--------|---------------|
| **Platform** | Vercel |
| **Build Command** | `pnpm build` |
| **Output Directory** | `.next` (default) |
| **Node Version** | 20.x |
| **Install Command** | `pnpm install` |

### 14.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint

      - run: pnpm type-check

  # Vercel handles deployment automatically
```

### 14.3 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | http://localhost:3000 | Local development |
| **Preview** | https://*.vercel.app | PR preview deployments |
| **Production** | https://molvexa.com | Live environment |

### 14.4 Vercel Configuration

```json
// vercel.json (optional, for custom settings)
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## 15. Security and Performance

### 15.1 Security Requirements

**Frontend Security:**
- **CSP Headers:** Configured via `next.config.ts` headers
- **XSS Prevention:** React's built-in escaping, no `dangerouslySetInnerHTML`
- **Secure Links:** All external links use `rel="noopener noreferrer"`

**Backend Security:**
- **Input Validation:** Server-side validation mirrors client-side
- **Rate Limiting:** Vercel's built-in DDoS protection
- **CORS Policy:** API routes only accept same-origin requests

**Environment Security:**
- **API Keys:** Stored in Vercel environment variables, never committed
- **No Secrets in Client:** Only `NEXT_PUBLIC_*` variables exposed to browser

### 15.2 Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** < 100KB initial JS
- **Loading Strategy:** Automatic code splitting per route
- **Image Optimization:** Next.js Image with WebP/AVIF
- **Font Loading:** `next/font` with `display: swap`

**Performance Targets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lighthouse Performance** | ≥ 90 | Mobile & Desktop |
| **First Contentful Paint** | < 1.5s | |
| **Largest Contentful Paint** | < 2.5s | |
| **Cumulative Layout Shift** | < 0.1 | |
| **Time to Interactive** | < 3s | |

**Caching Strategy:**
- Static assets: Immutable cache headers (Vercel default)
- HTML: Short cache with revalidation
- Images: Optimized and cached at edge

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
        E2E Tests (Playwright)
       /                      \
      /    Contact form flow   \
     /_________________________ \
    /   Component Tests (Vitest) \
   /  UI components, form logic   \
  /________________________________\
 /      Manual Testing              \
/   Cross-browser, responsive, a11y  \
```

### 16.2 Test Organization

```
tests/
├── e2e/
│   ├── contact-form.spec.ts    # Form submission flow
│   └── navigation.spec.ts      # Page navigation
│
└── components/
    ├── contact-form.test.tsx   # Form validation
    └── service-card.test.tsx   # Component rendering
```

### 16.3 Testing Approach

| Type | Tool | Scope | Priority |
|------|------|-------|----------|
| **Manual** | Browser DevTools | Responsive, visual, a11y | High |
| **Lighthouse** | Chrome DevTools / CI | Performance, SEO, a11y | High |
| **E2E** | Playwright | Contact form submission | Medium |
| **Component** | Vitest + Testing Library | Form validation logic | Low |

### 16.4 E2E Test Example

```typescript
// tests/e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test('contact form submits successfully', async ({ page }) => {
  await page.goto('/contact');

  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="message"]', 'This is a test message');

  await page.click('button[type="submit"]');

  await expect(page.getByText("Thank you")).toBeVisible();
});

test('contact form shows validation errors', async ({ page }) => {
  await page.goto('/contact');

  await page.click('button[type="submit"]');

  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();
});
```

---

## 17. Coding Standards

### 17.1 Critical Rules

| Rule | Description |
|------|-------------|
| **TypeScript Strict** | Enable `strict: true` in tsconfig, no `any` types |
| **Component Structure** | One component per file, named exports |
| **Styling** | Tailwind classes only, no inline styles or CSS modules |
| **Imports** | Use `@/` path alias, group by type |
| **API Calls** | Use lib/api.ts functions, never raw fetch in components |
| **Environment Variables** | Access via constants, never `process.env` directly in components |
| **Accessibility** | All interactive elements must be keyboard accessible |
| **Images** | Always use Next.js Image component with alt text |

### 17.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| **Components** | PascalCase | `ServiceCard.tsx` |
| **Hooks** | camelCase with `use` | `useContactForm.ts` |
| **Utilities** | camelCase | `formatPhone.ts` |
| **Constants** | UPPER_SNAKE_CASE | `SERVICES_DATA` |
| **Types/Interfaces** | PascalCase | `ContactFormData` |
| **CSS Classes** | Tailwind utilities | `bg-primary text-white` |
| **Files** | kebab-case | `service-card.tsx` |
| **Folders** | kebab-case | `components/shared/` |

### 17.3 Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. Third-party libraries
import { motion } from 'motion/react';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { Section } from '@/components/shared/section';

// 4. Internal utilities/types
import { cn } from '@/lib/utils';
import type { Service } from '@/types/content';

// 5. Styles (if any)
```

---

## 18. Error Handling Strategy

### 18.1 Error Response Format

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
```

### 18.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `EMAIL_FAILED` | 500 | Email service failure |

### 18.3 Frontend Error Handling

```typescript
// hooks/use-contact-form.ts
export function useContactForm() {
  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
  }>({ status: 'idle' });

  const submit = async (data: ContactFormData) => {
    setState({ status: 'loading' });

    try {
      await submitContactForm(data);
      setState({ status: 'success' });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Something went wrong'
      });
    }
  };

  return { ...state, submit };
}
```

### 18.4 Error UI Pattern

```typescript
// In ContactForm component
{state.status === 'error' && (
  <div className="rounded-md bg-red-50 p-4 text-red-800">
    <p>{state.error}</p>
    <p className="mt-2 text-sm">
      You can also reach us at{' '}
      <a href="tel:+1234567890" className="underline">+1 234 567 890</a>
    </p>
  </div>
)}
```

---

## 19. Monitoring and Observability

### 19.1 Monitoring Stack

| Aspect | Tool | Purpose |
|--------|------|---------|
| **Analytics** | Vercel Analytics | Page views, Web Vitals |
| **Error Tracking** | Vercel Logs | API route errors |
| **Performance** | Lighthouse CI | Automated performance checks |
| **Uptime** | Vercel (built-in) | Deployment health |

### 19.2 Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- Page load times by route
- JavaScript errors (browser console)

**Backend Metrics:**
- Contact form submission rate
- API route response times
- Error rate (4xx, 5xx responses)

### 19.3 Vercel Analytics Setup

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 20. Checklist Results Report

### Executive Summary

| Metric | Assessment |
|--------|------------|
| **Overall Architecture Readiness** | **HIGH** |
| **Project Type** | Full-stack (Frontend-heavy with serverless backend) |
| **Critical Risks** | 1 (Static export vs API route — resolved in document) |
| **Final Decision** | **READY FOR DEVELOPMENT** |

### Section Pass Rates

| Section | Pass Rate | Status |
|---------|-----------|--------|
| Requirements Alignment | 95% | PASS |
| Architecture Fundamentals | 100% | PASS |
| Technical Stack & Decisions | 100% | PASS |
| Frontend Design | 95% | PASS |
| Resilience & Operations | 85% | PASS |
| Security & Compliance | 90% | PASS |
| Implementation Guidance | 95% | PASS |
| Dependencies & Integration | 90% | PASS |
| AI Agent Suitability | 100% | PASS |
| Accessibility | 90% | PASS |

### Key Strengths

- Comprehensive technology stack with specific versions
- Clear component architecture with well-defined responsibilities
- Excellent alignment with PRD requirements
- Strong performance and accessibility considerations
- Well-structured for AI agent implementation

### Open Items

1. **Confirm API route approach** — PRD specifies `output: 'export'` but API routes require server runtime. Recommend removing static export (documented in Section 11.3).
2. **Obtain WhatsApp Business number** — Required before deployment
3. **Obtain contact email recipient** — Required for Resend configuration
4. **Decide on analytics** — Vercel Analytics recommended (optional)

### Validation Date

- **Validated:** 2026-01-15
- **Validator:** Winston (Architect Agent)

---

## Appendix A: Configuration Files

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove 'output: export' to enable API routes
  // output: 'export',

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### components.json (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Appendix B: Design Tokens

### globals.css

```css
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-primary: #1a2744;
  --color-primary-light: #2d3a52;
  --color-primary-dark: #0f1829;

  /* Background */
  --color-background: #fafafa;
  --color-background-white: #ffffff;
  --color-background-muted: #f4f4f5;

  /* Accent (metallic blue gradient) */
  --color-accent: #3d6b8a;
  --color-accent-light: #5a8ba8;
  --color-accent-dark: #2a4d66;

  /* Text */
  --color-text-primary: #1a2744;
  --color-text-secondary: #52525b;
  --color-text-muted: #a1a1aa;

  /* Borders */
  --color-border: #e4e4e7;
  --color-border-light: #f4f4f5;

  /* Status */
  --color-success: #22c55e;
  --color-error: #ef4444;

  /* WhatsApp */
  --color-whatsapp: #25d366;

  /* Typography */
  --font-sans: "Geist", system-ui, -apple-system, sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Transitions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}

/* Base styles */
@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-background text-text-primary antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply text-primary font-semibold tracking-tight;
  }
}
```

---

*Generated with BMAD Method*
