# HiyoshiFood — Product Requirements Document

**Status:** Draft (awaiting product details)
**Date:** 2026-05-18
**Author:** [TBD]

---

## 1. Product Overview

### 1.1 Problem Statement

[TBD — What problem does HiyoshiFood solve? Who experiences it?]

### 1.2 Solution

[TBD — High-level description of the product]

### 1.3 Target Users

[TBD — Who are the primary users? Secondary users?]

### 1.4 Success Metrics

[TBD — How do we know this product is working? e.g., DAU, order volume, retention]

---

## 2. Scope

### 2.1 In Scope (v1)

[TBD — Core features for the first release]

### 2.2 Out of Scope (v1)

[TBD — Explicitly deferred features]

---

## 3. Features & User Stories

### 3.1 [Feature Area 1 — TBD]

[TBD]

### 3.2 [Feature Area 2 — TBD]

[TBD]

### 3.3 [Feature Area N — TBD]

[TBD]

---

## 4. Data Model

### 4.1 Core Entities

[TBD — e.g., Users, Restaurants, Orders, Menu Items, Reviews]

### 4.2 Relationships

[TBD]

### 4.3 Supabase Schema Notes

- Auth: Supabase built-in auth (or [TBD alternative])
- Row-level security: [TBD — which tables need RLS policies]
- Realtime subscriptions: [TBD — which data needs live updates]

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, RSC) | 15 |
| Language | TypeScript | 5, strict: false |
| Styling | Tailwind CSS | 3 |
| Component primitives | shadcn/ui | default style, slate base, no CSS vars |
| Utility | clsx + tailwind-merge via `cn()` | — |
| Database / Backend | Supabase (supabase-js) | v2 |
| Fonts | Archivo, Archivo Black, JetBrains Mono | via next/font |
| Testing | Playwright (e2e only) | — |
| Deploy | Vercel | — |

### 5.2 Project Structure

```
app/
  globals.css          # global styles + CSS custom properties
  layout.tsx           # fonts, metadata, body wrapper
  page.tsx
  api/                 # Route Handlers
components/
  ui/                  # shadcn primitives
  layout/              # shell components (nav, footer, etc.)
  [feature]/           # feature-specific components
lib/
  utils.ts             # cn(), date helpers
  supabase.ts          # browser client singleton
  supabase-server.ts   # server client factory
  realtime.ts          # Supabase realtime helpers
types/                 # shared TypeScript types
```

### 5.3 Path Aliases

`@/*` maps to project root. Key aliases:

- `@/components` — UI components
- `@/lib/utils` — `cn()`, date helpers
- `@/lib/supabase` — browser Supabase client (`createClient()`)
- `@/lib/supabase-server` — server Supabase client (`createServerClient()`)
- `@/app/globals.css` — global styles

### 5.4 Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Server-only | Supabase service role key |

### 5.5 CSS Design Tokens

Global CSS variables in `:root` (defined in `globals.css`):

- **Base palette:** `--bg`, `--ink`, `--ink-2`, `--muted`, `--paper`
- **Accent palette:** `--accent-a` through `--accent-e`
- **Font variables:** `--font-archivo`, `--font-archivo-black`, `--font-jetbrains-mono`

Global utility classes:

| Class | Effect |
|---|---|
| `.mono` | JetBrains Mono font |
| `.display` | Archivo Black font |
| `.rainbow` | Gradient text across accent palette |
| `.hover-lift` | `translateY(-4px)` on hover (cubic-bezier) |
| `.reveal` / `.reveal.in` | Scroll-reveal opacity + translateY animation |
| `.grid-bg` | Subtle 1px grid overlay via background-image |

### 5.6 Supabase Client Pattern

**Browser (client components):**
```ts
// @/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Server (Server Components / Route Handlers):**
```ts
// @/lib/supabase-server.ts
export function createServerClient() { ... } // uses SUPABASE_SERVICE_KEY
```

---

## 6. API Design

### 6.1 Route Handlers (`app/api/`)

[TBD — list of API endpoints and their purpose]

### 6.2 Supabase Direct Queries

[TBD — which operations go directly through supabase-js vs. Route Handlers]

### 6.3 Realtime Subscriptions

[TBD — which channels/tables need live subscriptions]

---

## 7. UI / UX

### 7.1 Information Architecture

[TBD — page map / navigation structure]

### 7.2 Key Screens

[TBD — list of screens with brief description]

### 7.3 Design Principles

[TBD — visual tone, accessibility targets, mobile-first vs desktop-first]

---

## 8. Authentication & Authorization

[TBD — auth strategy: Supabase Auth, magic link, OAuth providers, session handling]

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Performance | [TBD] |
| Accessibility | [TBD] |
| Mobile support | [TBD] |
| Browser support | [TBD] |
| SEO | [TBD] |

---

## 10. Dev Commands

```bash
npm run dev       # next dev
npm run build     # next build
npm run lint      # next lint
npm run test:e2e  # playwright test
```

---

## 11. Open Questions

[TBD — questions that need answers before implementation begins]

1. [Q1]
2. [Q2]

---

## 12. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | — | Initial draft (tech stack scaffolded, product details TBD) |
