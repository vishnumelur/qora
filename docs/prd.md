# Molvexa Website — Product Requirements Document (PRD)

**Version:** 0.1
**Status:** Draft
**Last Updated:** 2026-01-15

---

## 1. Goals and Background Context

### 1.1 Goals

- **Establish premium online presence** — Create a modern, high-quality website that reflects Molvexa's precision and excellence in mold design/engineering
- **Drive visitor-to-client conversion** — Use design quality as the primary trust signal that converts visitors into leads
- **Showcase full service portfolio** — Present all 7 design services and manufacturing capabilities clearly
- **Enable multiple contact channels** — Provide form, phone, email, and WhatsApp for easy client outreach
- **Deliver fast, performant experience** — Achieve optimal performance and SEO on static hosting (Vercel)

### 1.2 Background Context

Molvexa is a mold design, engineering, and manufacturing company built on three brand pillars: **Value**, **Excellence**, and **Accuracy**. Their tagline, "Moulding Value with Excellence and Accuracy," captures their commitment to delivering ROI through top-tier precision engineering.

The company needs a digital presence that reflects the quality of their physical work. The brainstorming session identified that **premium design IS the sales pitch** — if the website looks precise and professional, visitors infer the mold work will be equally excellent. This insight drives the entire project strategy: a light-themed, Linear.app-inspired aesthetic with shadcn/ui components, generous white space, and smooth animations that establish trust before a single word is read.

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-15 | 0.1 | Initial PRD draft from brainstorming session | John (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR1** | The website shall display a Home page with hero section, tagline ("Moulding Value with Excellence and Accuracy"), services overview, expertise highlights, and call-to-action buttons |
| **FR2** | The website shall display a Services page listing all 7 design services (Product Tooling Feasibility, Moulding Concept, Tool 3D Design, 2D Detailing, Electrode Design, Product Design, Mold Flow Analysis) and Manufacturing Services |
| **FR3** | The website shall display an About page with company story, vision, and mission |
| **FR4** | The website shall display an Expertise page showcasing industries served (Automotive, Lighting, IP Assembly, Console Assembly, HVAC Assembly, Connectors, Electrical Covers, Household Parts) |
| **FR5** | The website shall display a Contact page with contact form, phone number, email address, WhatsApp link, and location information |
| **FR6** | The website shall display a Works/Portfolio page (placeholder structure for future project showcases) |
| **FR7** | The website shall include a floating WhatsApp button visible on all pages for instant contact |
| **FR8** | The website shall display consistent header navigation with phone number and footer with contact details across all pages |
| **FR9** | The contact form shall collect visitor information (name, email, phone, message) and submit to a serverless function or third-party service |
| **FR10** | The website shall implement smooth page transitions and hover animations following Linear.app-inspired motion design |

### 2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| **NFR1** | The website shall be built with Next.js v16.x using static export (`output: 'export'`) for optimal performance |
| **NFR2** | The website shall achieve Lighthouse performance score ≥90 on mobile and desktop |
| **NFR3** | The website shall be fully responsive across mobile, tablet, and desktop viewports |
| **NFR4** | The website shall be deployed on Vercel free tier with the purchased domain connected |
| **NFR5** | The website shall use a light theme exclusively (white/#fafafa background, navy blue #1a2744 primary) — no dark mode |
| **NFR6** | The website shall use Inter or Geist font family for typography |
| **NFR7** | The website shall implement SEO best practices (meta tags, semantic HTML, Open Graph tags) |
| **NFR8** | The website shall load initial page content within 3 seconds on 3G connection |
| **NFR9** | All images shall be optimized using Next.js Image component with appropriate formats (WebP/AVIF) |
| **NFR10** | The codebase shall use TypeScript, Tailwind CSS, and shadcn/ui component library |

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

A **premium, precision-focused experience** that mirrors the quality of Molvexa's mold engineering work. The website should feel like a high-end design tool (Linear.app aesthetic) — clean, sharp, and meticulously crafted. Every pixel builds trust. Visitors should immediately perceive professionalism and precision, creating the mental connection: *"If their website is this good, their mold work must be excellent."*

The experience prioritizes clarity over complexity, letting the work speak through elegant simplicity rather than flashy gimmicks.

### 3.2 Key Interaction Paradigms

| Paradigm | Implementation |
|----------|----------------|
| **Purposeful Animation** | Smooth fade-ins on scroll, subtle hover lifts (2-4px), gentle scale transitions — never flashy or distracting |
| **Clear Visual Hierarchy** | Navy headings, generous white space, card-based content sections with subtle borders/shadows |
| **Immediate Contact Access** | Floating WhatsApp button (always visible), phone in header, multiple CTAs throughout pages |
| **Progressive Disclosure** | Services overview on home → detailed breakdown on Services page; keeps cognitive load low |
| **Trust Signals** | Premium aesthetic itself is the primary trust signal; secondary: industry expertise badges, professional imagery |

### 3.3 Core Screens and Views

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| **Home** | First impression & conversion funnel entry | Hero with tagline, services grid, expertise highlights, primary CTA |
| **Services** | Showcase full capabilities | 7 design services cards + manufacturing section, each with description |
| **About** | Build company trust & connection | Company story, vision/mission statements, team values |
| **Expertise** | Demonstrate industry experience | 8 industry cards (Automotive, Lighting, etc.) with relevant imagery/icons |
| **Contact** | Convert interest to action | Form, phone, email, WhatsApp, location map placeholder |
| **Works** | Future portfolio showcase | Placeholder grid structure for project case studies |

### 3.4 Accessibility

**WCAG AA** compliance target:

- Sufficient color contrast (navy #1a2744 on white exceeds 4.5:1 ratio)
- Keyboard navigable interactive elements
- Semantic HTML structure with proper heading hierarchy
- Alt text for all meaningful images
- Focus indicators on interactive elements

### 3.5 Branding

| Element | Specification |
|---------|---------------|
| **Logo** | Geometric "M" with metallic blue gradient on navy background |
| **Primary Color** | Navy blue `#1a2744` (from logo) |
| **Accent Color** | Metallic blue gradient (from logo) |
| **Background** | White / `#fafafa` (light theme only) |
| **Typography** | Inter or Geist — clean, sharp, modern sans-serif |
| **Component Style** | shadcn/ui aesthetic — subtle borders, rounded corners, soft shadows |
| **Spacing** | Generous white space throughout (premium feel) |

**Design Principles:**
- NO dark theme — light, bright, premium exclusively
- Linear.app quality execution as benchmark
- Every detail should reinforce precision and professionalism

### 3.6 Target Device and Platforms

**Web Responsive** — optimized for:

| Breakpoint | Target |
|------------|--------|
| Mobile | 375px+ (primary contact method for many B2B inquiries) |
| Tablet | 768px+ |
| Desktop | 1024px+ (likely primary viewing context for B2B decision makers) |

---

## 4. Technical Assumptions

### 4.1 Repository Structure

**Monorepo** — Single repository containing the complete website

### 4.2 Service Architecture

**Static Site (JAMstack)**

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js v16.x with App Router |
| **Build Output** | Static export (`output: 'export'`) |
| **Hosting** | Vercel (free tier) |
| **Contact Form** | Vercel Serverless Function or third-party (Formspree/Resend) |

### 4.3 Tech Stack

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **Framework** | Next.js | v16.x | Latest stable, excellent static export, React Server Components |
| **Language** | TypeScript | v5.x | Type safety, better DX, catches errors at build time |
| **Styling** | Tailwind CSS | v4.x | Utility-first, pairs with shadcn/ui, rapid development |
| **UI Components** | shadcn/ui | v3.5.0 | Beautiful accessible components, Linear.app aesthetic match |
| **Animation** | Motion (Framer Motion) | Latest | `motion/react` — smooth fade-ins, hover effects, scroll animations |
| **Font** | Inter or Geist | Latest | Via `next/font` for optimal loading |
| **Icons** | Lucide React | Latest | Clean line icons, shadcn/ui default |

### 4.4 Testing Requirements

| Type | Approach |
|------|----------|
| **Visual/Manual** | Browser testing across viewports (mobile, tablet, desktop) |
| **Performance** | Lighthouse CI checks (≥90 score target) |
| **Accessibility** | axe DevTools audit for WCAG AA compliance |
| **E2E (optional)** | Playwright smoke test for contact form submission |

### 4.5 Additional Technical Assumptions

- **Node.js v20+** required for Next.js v16
- **pnpm** as package manager (faster, disk efficient)
- **ESLint + Prettier** for code quality
- **Git** version control with main branch protection
- **Vercel CLI** for preview deployments
- **Environment variables** for contact form endpoint (email service API key)
- **next/image** for automatic image optimization (WebP/AVIF)
- **next-sitemap** for SEO sitemap generation
- **Open Graph images** for social sharing previews

---

## 5. Epic Overview

| Epic | Title | Goal |
|------|-------|------|
| **Epic 1** | Foundation & Content Pages | Establish project infrastructure, design system, and deploy all content pages (Home, Services, About, Expertise, Works placeholder) with responsive layout and animations |
| **Epic 2** | Contact System & Launch | Implement contact page with functional form, floating WhatsApp button, SEO optimization, and production deployment with domain connection |

---

## 6. Epic 1: Foundation & Content Pages

### Epic Goal

Establish the complete project infrastructure, implement the premium design system inspired by Linear.app/shadcn/ui, and build all content pages (Home, Services, About, Expertise, Works placeholder) with responsive layouts and smooth animations. By the end of this epic, a fully navigable preview site will be deployed to Vercel showcasing Molvexa's brand, services, and expertise.

---

### Story 1.1: Project Foundation & Site Shell

**As a** developer,
**I want** a fully configured Next.js project with core dependencies and deployable site shell,
**so that** I have a solid foundation to build all pages upon with immediate deployment capability.

**Acceptance Criteria:**

1. Next.js v16.x project initialized with TypeScript, App Router, and `output: 'export'` configured
2. Tailwind CSS v4.x installed and configured with custom theme colors (navy `#1a2744`, background `#fafafa`)
3. shadcn/ui initialized with base components (Button, Card) available
4. Motion (`motion/react`) installed for animations
5. Inter or Geist font configured via `next/font`
6. ESLint and Prettier configured with consistent rules
7. Basic `RootLayout` with `<html>`, `<body>`, and font applied
8. Header component with Molvexa logo (placeholder), navigation links (Home, Services, About, Expertise, Contact, Works), and responsive mobile menu
9. Footer component with copyright, navigation links, and contact info placeholders
10. Home page route (`/`) renders with header, footer, and "Coming Soon" placeholder content
11. Project successfully builds (`next build`) with no errors
12. Site deployed to Vercel preview URL and accessible

---

### Story 1.2: Design System & Component Library

**As a** developer,
**I want** a comprehensive design system with reusable components,
**so that** all pages maintain visual consistency and premium Linear.app-inspired aesthetic.

**Acceptance Criteria:**

1. Design tokens defined in Tailwind config: colors (primary navy, accent gradient, neutrals), spacing scale, border radius
2. Typography scale configured: headings (h1-h4), body text, caption sizes with Inter/Geist
3. `Section` component created for consistent page sections with max-width container and generous padding
4. `SectionHeader` component with title, optional subtitle, and fade-in animation
5. `Card` component extended with hover lift animation (subtle scale + shadow)
6. `ServiceCard` variant for services display with icon, title, description
7. `IndustryCard` variant for expertise display
8. `Button` variants configured: primary (navy), secondary (outline), and CTA (gradient accent)
9. `Container` component for consistent max-width and padding
10. Animation utilities: `fadeIn`, `fadeInUp`, `staggerChildren` using Motion
11. All components are responsive (mobile-first)
12. Components documented with usage examples in code comments

---

### Story 1.3: Home Page

**As a** visitor,
**I want** to see an impressive home page that immediately communicates Molvexa's premium quality and services,
**so that** I understand their capabilities and feel confident exploring further.

**Acceptance Criteria:**

1. Hero section with tagline "Moulding Value with Excellence and Accuracy", brief value proposition, and primary CTA button
2. Hero includes subtle fade-in animation on load
3. Services overview section with grid of service cards (7 design services) linking to Services page
4. Expertise highlights section showcasing key industries served with visual cards
5. "Why Molvexa" or trust section highlighting Value, Excellence, Accuracy pillars
6. Call-to-action section with "Get in Touch" messaging and button (links to Contact - placeholder for now)
7. All sections use scroll-triggered fade-in animations
8. Page is fully responsive across mobile, tablet, desktop
9. Page achieves Lighthouse performance score ≥85
10. Semantic HTML with proper heading hierarchy (single h1, logical h2/h3 structure)

---

### Story 1.4: Services Page

**As a** visitor,
**I want** to see detailed information about all services Molvexa offers,
**so that** I can understand their full capabilities and find services relevant to my needs.

**Acceptance Criteria:**

1. Page header with "Services" title and brief introduction
2. Design Services section with 7 service cards: Product Tooling Feasibility, Moulding Concept, Tool 3D Design, 2D Detailing, Electrode Design, Product Design, Mold Flow Analysis
3. Each service card displays icon/visual, service name, and 2-3 sentence description
4. Manufacturing Services section with overview content (details TBD - placeholder acceptable)
5. Cards have hover animations consistent with design system
6. CTA section at bottom encouraging contact
7. Scroll-triggered animations for section reveals
8. Fully responsive layout (grid adjusts for mobile/tablet/desktop)
9. Breadcrumb or clear navigation context

---

### Story 1.5: About Page

**As a** visitor,
**I want** to learn about Molvexa's company story, vision, and mission,
**so that** I can understand their values and build trust before engaging.

**Acceptance Criteria:**

1. Page header with "About Molvexa" title
2. Company story section with narrative about Molvexa's founding/background (placeholder content acceptable if not provided)
3. Vision statement displayed prominently
4. Mission statement displayed prominently
5. Brand pillars section highlighting Value, Excellence, Accuracy with descriptions
6. Visual layout with generous whitespace maintaining premium feel
7. Scroll-triggered fade-in animations
8. Fully responsive layout
9. CTA encouraging visitors to explore services or contact

---

### Story 1.6: Expertise Page

**As a** visitor,
**I want** to see which industries Molvexa serves,
**so that** I can confirm they have experience relevant to my industry.

**Acceptance Criteria:**

1. Page header with "Industries We Serve" or "Our Expertise" title
2. Grid of 8 industry cards: Automotive (Interior/Exterior Parts), Lighting Components, IP Assembly, Console Assembly, HVAC Assembly, Connectors, Electrical Covers, Household Parts
3. Each industry card has icon/visual, industry name, and brief description
4. Cards have consistent hover animations
5. Optional: visual indication of experience level or specialization
6. Scroll-triggered staggered fade-in animation for cards
7. Fully responsive grid layout
8. CTA section encouraging contact for industry-specific inquiries

---

### Story 1.7: Works Page (Placeholder)

**As a** visitor,
**I want** to see that Molvexa has a portfolio section,
**so that** I know they showcase their work (even if projects aren't available yet).

**Acceptance Criteria:**

1. Page header with "Our Work" or "Portfolio" title
2. Placeholder state with message like "Projects coming soon" or "We're preparing our showcase"
3. Visual placeholder grid structure indicating where project cards will appear
4. Design maintains premium aesthetic even in empty state
5. Optional: CTA to contact for project discussions
6. Fully responsive layout
7. Page structure ready to accept real project content in future

---

## 7. Epic 2: Contact System & Launch

### Epic Goal

Implement the complete contact system including a functional contact form with serverless backend, floating WhatsApp button for instant communication, comprehensive SEO optimization, and final production deployment with domain connection. By the end of this epic, Molvexa will have a fully functional, SEO-optimized website ready for public launch and lead generation.

---

### Story 2.1: Contact Page & Form UI

**As a** visitor,
**I want** a comprehensive contact page with multiple ways to reach Molvexa,
**so that** I can easily get in touch through my preferred communication channel.

**Acceptance Criteria:**

1. Page header with "Contact Us" or "Get in Touch" title and welcoming message
2. Contact form with fields: Full Name (required), Email (required), Phone (optional), Company (optional), Message (required)
3. Form fields use shadcn/ui Input and Textarea components with proper labels
4. Client-side validation with clear error messages (email format, required fields)
5. Submit button with loading state during submission
6. Contact information section displaying: Phone number, Email address, WhatsApp number, Physical address/location
7. Each contact method has appropriate icon (Lucide) and is clickable (tel:, mailto:, WhatsApp link)
8. Optional: Embedded map placeholder or location description
9. Layout is two-column on desktop (form + info), stacked on mobile
10. Scroll-triggered animations consistent with other pages
11. Fully responsive design

---

### Story 2.2: Contact Form Backend Integration

**As a** business owner,
**I want** contact form submissions to be sent to my email,
**so that** I receive lead inquiries and can respond promptly.

**Acceptance Criteria:**

1. API route created at `/api/contact` to handle form submissions
2. Server-side validation mirrors client-side rules (prevent bypass)
3. Email service integrated (Resend recommended) with API key in environment variables
4. Submission triggers email to configured recipient with all form fields formatted
5. Email includes: sender name, email, phone (if provided), company (if provided), message
6. Success response returns to frontend with confirmation
7. Error handling for email service failures with appropriate error response
8. Rate limiting consideration (basic protection against spam)
9. Success state shown on form: "Thank you! We'll be in touch soon."
10. Error state shown on form: "Something went wrong. Please try again or contact us directly."
11. Form resets after successful submission
12. Environment variables documented in README for deployment setup

---

### Story 2.3: Floating WhatsApp Button

**As a** visitor,
**I want** a persistent WhatsApp button available on every page,
**so that** I can instantly start a conversation without navigating to the contact page.

**Acceptance Criteria:**

1. Floating button component positioned fixed at bottom-right corner
2. Button uses WhatsApp brand green color (`#25D366`) or tasteful variant matching site design
3. WhatsApp icon clearly visible (Lucide or custom SVG)
4. Click opens WhatsApp with pre-filled message: "Hi, I'm interested in Molvexa's services."
5. Button has subtle entrance animation (fade-in + slide-up) on page load
6. Hover state with gentle scale or glow effect
7. Button appears on all pages via RootLayout
8. Proper z-index to stay above other content but below modals
9. Accessible: proper aria-label ("Contact us on WhatsApp")
10. Mobile-friendly tap target size (minimum 44x44px)
11. Does not obstruct critical content on mobile (proper positioning/margin)

---

### Story 2.4: SEO & Meta Tags

**As a** business owner,
**I want** the website to be optimized for search engines,
**so that** potential clients can find Molvexa when searching for mold design services.

**Acceptance Criteria:**

1. Root metadata configured in `layout.tsx` with site-wide defaults (title template, description)
2. Each page has unique `<title>` and `<meta description>` relevant to page content
3. Open Graph tags configured for all pages: og:title, og:description, og:image, og:url
4. Twitter Card meta tags configured (summary_large_image)
5. Default OG image created (1200x630px) featuring Molvexa logo and tagline
6. Canonical URLs set for all pages
7. `next-sitemap` package configured to generate `sitemap.xml` on build
8. `robots.txt` generated allowing all crawlers
9. Structured data (JSON-LD) for Organization schema on home page
10. All images have descriptive `alt` attributes
11. Heading hierarchy validated (single h1 per page, logical structure)
12. Internal linking structure reviewed (nav, footer, CTAs all use proper links)

---

### Story 2.5: Performance Optimization & Production Launch

**As a** business owner,
**I want** the website to be fast, polished, and live on my domain,
**so that** visitors have an excellent experience and can find us at our official URL.

**Acceptance Criteria:**

1. Lighthouse audit run on all pages with scores documented
2. Performance score ≥90 on mobile and desktop for all pages
3. Accessibility score ≥90 with no critical violations
4. Best Practices score ≥90
5. SEO score ≥90
6. All images optimized: proper sizing, WebP/AVIF formats via next/image
7. Unused CSS/JS removed or minimized
8. Font loading optimized (preload, font-display: swap)
9. Custom domain connected to Vercel project
10. SSL certificate active (automatic via Vercel)
11. DNS configured correctly (A record or CNAME)
12. Production environment variables set in Vercel dashboard
13. Final cross-browser testing: Chrome, Firefox, Safari, Edge
14. Final responsive testing: mobile (375px), tablet (768px), desktop (1024px+)
15. 404 page styled consistently with site design
16. Site live and accessible at production domain

---

## 8. Checklist Results Report

### Executive Summary

| Metric | Assessment |
|--------|------------|
| **Overall PRD Completeness** | **85%** |
| **MVP Scope Appropriateness** | **Just Right** |
| **Readiness for Architecture Phase** | **Ready** |

### Category Analysis

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| 1. Problem Definition & Context | PARTIAL (75%) | Business KPIs not quantified; no formal user research cited |
| 2. MVP Scope Definition | PASS (90%) | Clear scope; rationale documented |
| 3. User Experience Requirements | PASS (95%) | Comprehensive UX vision, flows, accessibility |
| 4. Functional Requirements | PASS (95%) | All FR/NFR documented, testable, prioritized |
| 5. Non-Functional Requirements | PASS (90%) | Performance, security, reliability covered |
| 6. Epic & Story Structure | PASS (95%) | Well-sequenced epics, appropriately sized stories |
| 7. Technical Guidance | PASS (92%) | Tech stack defined, constraints clear |
| 8. Cross-Functional Requirements | PARTIAL (70%) | Minimal needs appropriate for static site |
| 9. Clarity & Communication | PASS (90%) | Well-structured, consistent terminology |

### Final Decision

**✅ READY FOR ARCHITECT** — The PRD is comprehensive and provides sufficient guidance for architectural design.

### Open Items for Resolution

- [ ] Confirm content assets availability (logo SVG, images, copy)
- [ ] Obtain WhatsApp business number
- [ ] Obtain email recipient address for contact form
- [ ] Decide on analytics approach (Vercel Analytics / GA4 / none)

---

## 9. Next Steps

### 9.1 UX Expert Prompt

```
Review the Molvexa Website PRD (docs/prd.md) and create a detailed UI/UX specification.

Focus on:
1. Component design specifications for the shadcn/ui-based design system
2. Responsive layout specifications for all 6 pages
3. Animation and interaction specifications using Motion
4. Mobile navigation patterns (hamburger menu behavior)
5. Form UX for the contact page

The design should achieve Linear.app-level polish with the defined brand colors (navy #1a2744, white #fafafa background) and generous whitespace.
```

### 9.2 Architect Prompt

```
Review the Molvexa Website PRD (docs/prd.md) and create the technical architecture document.

Key decisions needed:
1. Next.js 16 App Router folder structure for 6-page static site
2. shadcn/ui component organization and customization approach
3. Tailwind CSS configuration with design tokens
4. Contact form implementation (Resend vs Formspree vs custom)
5. SEO implementation with next-sitemap
6. Deployment pipeline to Vercel

Tech stack is defined: Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Motion, pnpm.
Target: Static export with single API route for contact form.
```

---

## 10. Out of Scope (MVP)

The following are explicitly **NOT** included in this MVP:

- Blog or content management system (CMS)
- Multi-language / internationalization (i18n)
- E-commerce or payment processing
- User authentication or client portal
- Dark mode theme
- Advanced analytics dashboard
- Live chat integration (beyond WhatsApp link)
- Project case study details (Works page is placeholder only)
- Custom CRM integration (contact form sends email only)

These may be considered for future iterations based on business needs.

---

*Generated with BMAD Method*
