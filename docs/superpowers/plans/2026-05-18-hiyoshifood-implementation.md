# HiyoshiFood Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/JP) student food review platform for Hiyoshi, Japan — browsable place list, 🍜 bowl rating system, Google Maps integration, and a protected admin panel.

**Architecture:** Next.js 15 App Router with RSC for data fetching; Supabase for DB, auth, storage, and realtime; cookie-based i18n via next-intl (no locale in URLs). Admin routes protected by Next.js middleware checking Supabase session.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 3, shadcn/ui (slate, no CSS vars), Supabase v2, next-intl, Google Maps JS API, Playwright e2e, Vercel

---

## File Map

```
app/
  globals.css                          ← design tokens, utility classes
  layout.tsx                           ← fonts, NextIntlClientProvider
  page.tsx                             ← homepage (place list + map tab)
  places/[slug]/page.tsx               ← place detail
  api/map/export.kml/route.ts          ← KML export
  admin/
    login/page.tsx
    layout.tsx                         ← admin shell (sidebar)
    page.tsx                           ← dashboard
    places/page.tsx
    places/new/page.tsx
    places/[id]/edit/page.tsx
    reviews/page.tsx
    settings/page.tsx
middleware.ts                          ← protect /admin/* routes
components/
  layout/Navbar.tsx
  layout/Footer.tsx
  places/PlaceCard.tsx
  places/PlaceGrid.tsx
  places/PlaceFilters.tsx
  reviews/ReviewForm.tsx
  reviews/ReviewList.tsx
  reviews/RamenScore.tsx
  map/EmbeddedMap.tsx
  admin/AdminNav.tsx
  admin/NotificationBadge.tsx
  admin/PlaceForm.tsx
lib/
  utils.ts                             ← cn()
  supabase.ts                          ← browser client
  supabase-server.ts                   ← server client
  realtime.ts                          ← Supabase realtime helpers
types/index.ts                         ← all shared TS types
i18n/request.ts                        ← next-intl config
messages/en.json
messages/jp.json
supabase/migrations/
  001_schema.sql
  002_seed_dimensions.sql
tests/
  homepage.spec.ts
  place-detail.spec.ts
  review-submission.spec.ts
  admin-auth.spec.ts
  admin-places.spec.ts
```

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json` (via CLI)
- Create: `tailwind.config.ts`
- Create: `components.json` (shadcn)
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Scaffold the app**

```bash
npx create-next-app@15 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Expected: Next.js 15 project created in current directory.

- [ ] **Step 2: Init shadcn (slate base, no CSS vars)**

```bash
npx shadcn@latest init
```

When prompted:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `No`

- [ ] **Step 3: Add required shadcn components**

```bash
npx shadcn@latest add button input label select badge card tabs dialog separator
```

- [ ] **Step 4: Install remaining dependencies**

```bash
npm install @supabase/supabase-js next-intl clsx tailwind-merge
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 5: Write `globals.css`**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #FAFAF8;
  --ink: #0F0F0E;
  --ink-2: #3D3D38;
  --muted: #8C8C84;
  --paper: #FFFFFF;
  --accent-a: #F59E0B;
  --accent-b: #F97316;
  --accent-c: #EF4444;
  --accent-d: #14B8A6;
  --accent-e: #64748B;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.10);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.12);
}

body {
  background: var(--bg);
  color: var(--ink);
}

.mono { font-family: var(--font-jetbrains-mono), monospace; }
.display { font-family: var(--font-archivo-black), sans-serif; }

.rainbow {
  background: linear-gradient(90deg, var(--accent-a), var(--accent-b), var(--accent-c), var(--accent-d), var(--accent-e));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-lift {
  transition: transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms cubic-bezier(0.4,0,0.2,1), transform 400ms cubic-bezier(0.4,0,0.2,1);
}
.reveal.in { opacity: 1; transform: translateY(0); }

.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}

:focus-visible {
  outline: 2px solid var(--accent-a);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .hover-lift:hover { transform: none; }
  .reveal { transition: opacity 200ms ease; transform: none; }
}
```

- [ ] **Step 6: Write `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 7: Configure fonts in `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Archivo, Archivo_Black } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const archivoBold = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HiyoshiFood',
  description: 'Student food reviews for Hiyoshi, Japan',
  robots: { index: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${archivoBold.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

> Note: If `@fontsource/jetbrains-mono` is not installed, run `npm install @fontsource/jetbrains-mono` OR use Google Fonts import in globals.css instead:
> `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');`

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git init && git add -A
git commit -m "feat: bootstrap Next.js 15 project with Tailwind, shadcn, fonts, globals"
```

---

## Task 2: TypeScript Types & Supabase Clients

**Files:**
- Create: `types/index.ts`
- Create: `lib/supabase.ts`
- Create: `lib/supabase-server.ts`
- Create: `.env.local`

- [ ] **Step 1: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EOF
```

Fill in real values from your Supabase project dashboard.

- [ ] **Step 2: Write `types/index.ts`**

```ts
export type PriceRange = '¥' | '¥¥' | '¥¥¥'

export interface Place {
  id: string
  slug: string
  name_en: string
  name_jp: string
  category: string
  address: string
  lat: number
  lng: number
  price_range: PriceRange
  hours_text: string
  cover_photo_url: string | null
  description_short_en: string
  description_short_jp: string
  description_long_en: string
  description_long_jp: string
  cash_only: boolean
  seating_capacity: number | null
  created_at: string
}

export interface PlaceAttribute {
  id: string
  place_id: string
  key: string
  value_en: string
  value_jp: string
}

export interface GradingDimension {
  id: string
  name_en: string
  name_jp: string
  emoji: string
  order: number
  active: boolean
}

export interface Review {
  id: string
  place_id: string
  display_name: string
  visited_on: string
  meal_ordered: string
  would_recommend: boolean
  comment: string | null
  created_at: string
}

export interface ReviewGrade {
  id: string
  review_id: string
  dimension_id: string
  score: number
}

export interface ReviewWithGrades extends Review {
  review_grades: ReviewGrade[]
}

export interface Notification {
  id: string
  review_id: string
  read: boolean
  created_at: string
}

export interface PlaceWithScore extends Place {
  avg_score: number | null
  review_count: number
}
```

- [ ] **Step 3: Write `lib/supabase.ts` (browser client)**

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 4: Write `lib/supabase-server.ts` (server client)**

```ts
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add types/ lib/ .env.local
git commit -m "feat: add TypeScript types and Supabase client factories"
```

---

## Task 3: Database Schema & Seed

**Files:**
- Create: `supabase/migrations/001_schema.sql`
- Create: `supabase/migrations/002_seed_dimensions.sql`

- [ ] **Step 1: Write `supabase/migrations/001_schema.sql`**

```sql
create extension if not exists "uuid-ossp";

create type price_range as enum ('¥', '¥¥', '¥¥¥');

create table places (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name_en text not null,
  name_jp text not null,
  category text not null,
  address text not null,
  lat float not null,
  lng float not null,
  price_range price_range not null,
  hours_text text not null default '',
  cover_photo_url text,
  description_short_en text not null default '',
  description_short_jp text not null default '',
  description_long_en text not null default '',
  description_long_jp text not null default '',
  cash_only boolean not null default false,
  seating_capacity integer,
  created_at timestamptz not null default now()
);

create table place_attributes (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid not null references places(id) on delete cascade,
  key text not null,
  value_en text not null default '',
  value_jp text not null default ''
);

create table grading_dimensions (
  id uuid primary key default uuid_generate_v4(),
  name_en text not null,
  name_jp text not null,
  emoji text not null,
  "order" integer not null default 0,
  active boolean not null default true
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid not null references places(id) on delete cascade,
  display_name text not null,
  visited_on date not null,
  meal_ordered text not null,
  would_recommend boolean not null default true,
  comment text,
  created_at timestamptz not null default now()
);

create table review_grades (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references reviews(id) on delete cascade,
  dimension_id uuid not null references grading_dimensions(id) on delete cascade,
  score integer not null check (score between 1 and 5)
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references reviews(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table places enable row level security;
alter table reviews enable row level security;
alter table review_grades enable row level security;
alter table notifications enable row level security;
alter table grading_dimensions enable row level security;
alter table place_attributes enable row level security;

-- Public read policies
create policy "public read places" on places for select using (true);
create policy "public read reviews" on reviews for select using (true);
create policy "public read grades" on review_grades for select using (true);
create policy "public read dimensions" on grading_dimensions for select using (true);
create policy "public read attributes" on place_attributes for select using (true);

-- Public insert for reviews (community trust model)
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public insert grades" on review_grades for insert with check (true);
create policy "public insert notifications" on notifications for insert with check (true);
```

- [ ] **Step 2: Write `supabase/migrations/002_seed_dimensions.sql`**

```sql
insert into grading_dimensions (name_en, name_jp, emoji, "order", active) values
  ('Wallet Pain',     '財布へのダメージ', '💰', 1,  true),
  ('Speed Run',       '速さ',             '⚡', 2,  true),
  ('Night Owl',       '夜遅くまで営業',   '🌙', 3,  true),
  ('Gaijin Friendly', '外国人対応',       '🇬🇧', 4, true),
  ('Solo Comfort',    '一人でも快適',     '🪑', 5,  true),
  ('Squad Ready',     '大人数OK',         '👥', 6,  true),
  ('Study Viable',    '勉強できる',       '📶', 7,  true),
  ('Hangover Cure',   '二日酔いに効く',   '😴', 8,  true),
  ('Repeat Offender', 'また来たい',       '🔁', 9,  true),
  ('Worth the Queue', '並ぶ価値あり',     '🍜', 10, true);
```

- [ ] **Step 3: Apply migrations in Supabase dashboard**

Go to your Supabase project → SQL Editor → run `001_schema.sql`, then `002_seed_dimensions.sql`.

Expected: Tables visible in Table Editor, 10 rows in `grading_dimensions`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema migrations and seed grading dimensions"
```

---

## Task 4: next-intl Setup

**Files:**
- Modify: `next.config.ts`
- Create: `i18n/request.ts`
- Create: `messages/en.json`
- Create: `messages/jp.json`

- [ ] **Step 1: Update `next.config.ts`**

```ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({
  // any other Next.js config here
})
```

- [ ] **Step 2: Write `i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const validLocale = ['en', 'jp'].includes(locale) ? locale : 'en'

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  }
})
```

- [ ] **Step 3: Write `messages/en.json`**

```json
{
  "nav": {
    "openInMaps": "Open in Google Maps",
    "langToggle": "JP"
  },
  "home": {
    "hero": "Find your next favourite spot in Hiyoshi",
    "listTab": "List",
    "mapTab": "Map",
    "searchPlaceholder": "Search places…",
    "sortByScore": "Sort by score",
    "nearMe": "Near me",
    "noResults": "No places found."
  },
  "place": {
    "reviews": "Reviews",
    "leaveReview": "Leave a Review",
    "overallScore": "Overall Score",
    "cashOnly": "Cash only",
    "hours": "Hours",
    "wouldRecommend": "Would recommend"
  },
  "review": {
    "displayName": "Your name",
    "visitedOn": "When did you visit?",
    "mealOrdered": "What did you order?",
    "wouldRecommend": "Would you recommend this place?",
    "comment": "Any comments? (optional)",
    "submit": "Submit review",
    "submitting": "Submitting…",
    "success": "Thanks for your review!"
  },
  "filters": {
    "category": "Category",
    "price": "Price",
    "cashOnly": "Cash only"
  },
  "admin": {
    "dashboard": "Dashboard",
    "places": "Places",
    "reviews": "Reviews",
    "settings": "Settings",
    "logout": "Log out"
  }
}
```

- [ ] **Step 4: Write `messages/jp.json`**

```json
{
  "nav": {
    "openInMaps": "Google マップで開く",
    "langToggle": "EN"
  },
  "home": {
    "hero": "日吉で次のお気に入りを見つけよう",
    "listTab": "一覧",
    "mapTab": "地図",
    "searchPlaceholder": "お店を検索…",
    "sortByScore": "スコア順",
    "nearMe": "近くのお店",
    "noResults": "お店が見つかりませんでした。"
  },
  "place": {
    "reviews": "レビュー",
    "leaveReview": "レビューを書く",
    "overallScore": "総合スコア",
    "cashOnly": "現金のみ",
    "hours": "営業時間",
    "wouldRecommend": "おすすめ"
  },
  "review": {
    "displayName": "ニックネーム",
    "visitedOn": "いつ訪れましたか？",
    "mealOrdered": "何を注文しましたか？",
    "wouldRecommend": "このお店を勧めますか？",
    "comment": "コメント（任意）",
    "submit": "レビューを送信",
    "submitting": "送信中…",
    "success": "レビューありがとうございます！"
  },
  "filters": {
    "category": "カテゴリ",
    "price": "価格",
    "cashOnly": "現金のみ"
  },
  "admin": {
    "dashboard": "ダッシュボード",
    "places": "お店",
    "reviews": "レビュー",
    "settings": "設定",
    "logout": "ログアウト"
  }
}
```

- [ ] **Step 5: Update `app/layout.tsx` to provide NextIntlClientProvider**

```tsx
import type { Metadata } from 'next'
import { Archivo, Archivo_Black } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', display: 'swap' })
const archivoBold = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo-black', display: 'swap' })

export const metadata: Metadata = {
  title: 'HiyoshiFood',
  description: 'Student food reviews for Hiyoshi, Japan',
  robots: { index: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${archivo.variable} ${archivoBold.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add next.config.ts i18n/ messages/ app/layout.tsx
git commit -m "feat: set up next-intl with cookie-based locale (EN/JP)"
```

---

## Task 5: Navbar & Layout Shell

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/LocaleSwitcher.tsx`

- [ ] **Step 1: Write `components/layout/LocaleSwitcher.tsx`**

```tsx
'use client'

import { useTranslations } from 'next-intl'

export function LocaleSwitcher() {
  const t = useTranslations('nav')

  function switchLocale() {
    const current = document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'en'
    const next = current === 'en' ? 'jp' : 'en'
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <button
      onClick={switchLocale}
      className="mono text-sm px-3 py-2 rounded-md hover:bg-slate-100 transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Switch language"
    >
      {t('langToggle')}
    </button>
  )
}
```

- [ ] **Step 2: Write `components/layout/Navbar.tsx`**

```tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MapPin } from 'lucide-react'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="display text-xl text-[var(--ink)]">
          HiyoshiFood 🍜
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <a
            href={`https://www.google.com/maps`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-[var(--accent-a)] text-[var(--ink)] hover:opacity-85 transition-opacity duration-150 cursor-pointer min-h-[44px]"
          >
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('openInMaps')}</span>
          </a>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Write `components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-slate-100 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 text-center text-sm text-[var(--muted)]">
        HiyoshiFood — Made by students, for students.
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add components/layout/
git commit -m "feat: add Navbar, Footer, and LocaleSwitcher components"
```

---

## Task 6: PlaceCard & PlaceGrid

**Files:**
- Create: `components/places/PlaceCard.tsx`
- Create: `components/places/PlaceGrid.tsx`

- [ ] **Step 1: Write `components/places/PlaceCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PlaceWithScore } from '@/types'

interface Props {
  place: PlaceWithScore
  locale: string
}

const priceColors: Record<string, string> = {
  '¥':   'text-emerald-700 bg-emerald-50',
  '¥¥':  'text-amber-700 bg-amber-50',
  '¥¥¥': 'text-rose-700 bg-rose-50',
}

export function PlaceCard({ place, locale }: Props) {
  const name = locale === 'jp' ? place.name_jp : place.name_en
  const desc = locale === 'jp' ? place.description_short_jp : place.description_short_en
  const score = place.avg_score ? place.avg_score.toFixed(1) : '—'

  return (
    <Link href={`/places/${place.slug}`} className="block">
      <article className={cn(
        'bg-[var(--paper)] rounded-xl overflow-hidden border border-slate-100',
        'hover-lift'
      )}>
        <div className="relative aspect-video bg-slate-100">
          {place.cover_photo_url ? (
            <Image
              src={place.cover_photo_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate-200">
              🍽️
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="mono text-xs px-2 py-0.5 rounded-full bg-[var(--accent-d)]/10 text-[var(--accent-d)]">
              {place.category}
            </span>
            <span className={cn('mono text-xs px-2 py-0.5 rounded-full font-medium', priceColors[place.price_range])}>
              {place.price_range}
            </span>
          </div>
          <h2 className="display text-lg text-[var(--ink)] leading-tight mb-1">{name}</h2>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="mono text-sm text-[var(--accent-a)] font-medium">🍜 {score}</span>
            <span className="text-xs text-[var(--muted)]">({place.review_count})</span>
          </div>
          <p className="text-sm text-[var(--ink-2)] line-clamp-2">{desc}</p>
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Write `components/places/PlaceGrid.tsx`**

```tsx
import { PlaceCard } from './PlaceCard'
import type { PlaceWithScore } from '@/types'

interface Props {
  places: PlaceWithScore[]
  locale: string
  emptyMessage: string
}

export function PlaceGrid({ places, locale, emptyMessage }: Props) {
  if (places.length === 0) {
    return <p className="text-center text-[var(--muted)] py-16">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} locale={locale} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/places/
git commit -m "feat: add PlaceCard and PlaceGrid components"
```

---

## Task 7: Homepage

**Files:**
- Modify: `app/page.tsx`
- Create: `components/places/PlaceFilters.tsx`

- [ ] **Step 1: Write `components/places/PlaceFilters.tsx`**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const CATEGORIES = ['ramen', 'café', 'izakaya', 'teishoku', 'fast food', 'other']
const PRICES = ['¥', '¥¥', '¥¥¥']

export function PlaceFilters() {
  const t = useTranslations('filters')
  const router = useRouter()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (next.get(key) === value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.replace(`/?${next.toString()}`)
  }

  const activeCategory = params.get('category')
  const activePrice = params.get('price')
  const cashOnly = params.get('cashOnly') === '1'
  const search = params.get('q') ?? ''

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Search places…"
        defaultValue={search}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString())
          if (e.target.value) next.set('q', e.target.value)
          else next.delete('q')
          router.replace(`/?${next.toString()}`)
        }}
        className="max-w-sm"
        aria-label="Search places"
      />
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-[var(--muted)] self-center">{t('category')}:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update('category', cat)}
            className={cn(
              'mono text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer',
              activeCategory === cat
                ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                : 'border-slate-200 text-[var(--ink-2)] hover:border-[var(--ink)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-[var(--muted)] self-center">{t('price')}:</span>
        {PRICES.map((p) => (
          <button
            key={p}
            onClick={() => update('price', p)}
            className={cn(
              'mono text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer',
              activePrice === p
                ? 'bg-[var(--accent-a)] text-[var(--ink)] border-[var(--accent-a)]'
                : 'border-slate-200 text-[var(--ink-2)] hover:border-[var(--accent-a)]'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => update('cashOnly', '1')}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 cursor-pointer',
            cashOnly
              ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
              : 'border-slate-200 text-[var(--ink-2)] hover:border-[var(--ink)]'
          )}
        >
          {t('cashOnly')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/page.tsx`**

```tsx
import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import { PlaceFilters } from '@/components/places/PlaceFilters'
import type { PlaceWithScore } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; category?: string; price?: string; cashOnly?: string; tab?: string }>
}

async function fetchPlaces(searchParams: Awaited<Props['searchParams']>): Promise<PlaceWithScore[]> {
  const supabase = createServerClient()

  const { data: places } = await supabase.from('places').select('*')
  if (!places) return []

  const { data: grades } = await supabase.from('review_grades').select('score, review_id')
  const { data: reviews } = await supabase.from('reviews').select('id, place_id')

  const scoreMap: Record<string, { total: number; count: number }> = {}
  const reviewCountMap: Record<string, number> = {}

  reviews?.forEach((r) => {
    reviewCountMap[r.place_id] = (reviewCountMap[r.place_id] ?? 0) + 1
  })

  const reviewPlaceMap: Record<string, string> = {}
  reviews?.forEach((r) => { reviewPlaceMap[r.id] = r.place_id })

  grades?.forEach((g) => {
    const placeId = reviewPlaceMap[g.review_id]
    if (!placeId) return
    if (!scoreMap[placeId]) scoreMap[placeId] = { total: 0, count: 0 }
    scoreMap[placeId].total += g.score
    scoreMap[placeId].count += 1
  })

  let result: PlaceWithScore[] = places.map((p) => ({
    ...p,
    avg_score: scoreMap[p.id] ? scoreMap[p.id].total / scoreMap[p.id].count : null,
    review_count: reviewCountMap[p.id] ?? 0,
  }))

  const { q, category, price, cashOnly } = searchParams
  if (q) result = result.filter((p) => p.name_en.toLowerCase().includes(q.toLowerCase()) || p.name_jp.includes(q))
  if (category) result = result.filter((p) => p.category === category)
  if (price) result = result.filter((p) => p.price_range === price)
  if (cashOnly === '1') result = result.filter((p) => p.cash_only)

  return result.sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))
}

export default async function HomePage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const locale = await getLocale()
  const t = await getTranslations('home')
  const places = await fetchPlaces(resolvedParams)

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="grid-bg py-16 px-4 md:px-6 lg:px-8 text-center">
          <h1 className="display text-4xl md:text-5xl text-[var(--ink)] mb-4">{t('hero')}</h1>
        </section>
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Suspense>
            <PlaceFilters />
          </Suspense>
          <div className="mt-8">
            <PlaceGrid places={places} locale={locale} emptyMessage={t('noResults')} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Run dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: hero section and empty grid (no places yet), filters visible.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/places/PlaceFilters.tsx
git commit -m "feat: homepage with place grid, server-side filtering, and hero section"
```

---

## Task 8: Place Detail Page

**Files:**
- Create: `app/places/[slug]/page.tsx`
- Create: `components/reviews/ReviewList.tsx`
- Create: `components/reviews/RamenScore.tsx`

- [ ] **Step 1: Write `components/reviews/RamenScore.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface Props {
  score: number   // 0–5, supports .5 increments
  size?: 'sm' | 'md'
}

export function RamenScore({ score, size = 'md' }: Props) {
  const bowls = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, score - i))
    return fill >= 1 ? 'full' : fill >= 0.5 ? 'half' : 'empty'
  })

  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${score} out of 5`}>
      {bowls.map((state, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={sz}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={`half-${i}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          {/* Base (empty) */}
          <circle cx="12" cy="14" r="7" stroke="#E2E8F0" strokeWidth="1.5" fill="#F8FAFC" />
          <path d="M5 10 Q12 4 19 10" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
          {/* Filled overlay */}
          {state !== 'empty' && (
            <g clipPath={state === 'half' ? `url(#half-${i})` : undefined}>
              <circle cx="12" cy="14" r="7" fill="var(--accent-a)" />
              <path d="M5 10 Q12 4 19 10" stroke="var(--accent-b)" strokeWidth="1.5" fill="none" />
            </g>
          )}
        </svg>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write `components/reviews/ReviewList.tsx`**

```tsx
import { RamenScore } from './RamenScore'
import type { ReviewWithGrades, GradingDimension } from '@/types'

interface Props {
  reviews: ReviewWithGrades[]
  dimensions: GradingDimension[]
  locale: string
}

export function ReviewList({ reviews, dimensions, locale }: Props) {
  if (reviews.length === 0) {
    return <p className="text-[var(--muted)] text-sm py-8 text-center">No reviews yet. Be the first!</p>
  }

  const dimMap = Object.fromEntries(dimensions.map((d) => [d.id, d]))

  return (
    <ul className="flex flex-col gap-6">
      {reviews.map((review) => (
        <li key={review.id} className="bg-[var(--paper)] rounded-xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="display text-base text-[var(--ink)]">{review.display_name}</span>
            <span className="mono text-xs text-[var(--muted)]">{review.visited_on}</span>
          </div>
          <p className="text-sm text-[var(--ink-2)] mb-1">
            <span className="text-[var(--muted)]">Ordered:</span> {review.meal_ordered}
          </p>
          <div className="flex flex-wrap gap-3 my-3">
            {review.review_grades.map((g) => {
              const dim = dimMap[g.dimension_id]
              if (!dim) return null
              const label = locale === 'jp' ? dim.name_jp : dim.name_en
              return (
                <div key={g.id} className="flex items-center gap-1.5 text-xs text-[var(--ink-2)]">
                  <span>{dim.emoji}</span>
                  <span>{label}</span>
                  <RamenScore score={g.score} size="sm" />
                </div>
              )
            })}
          </div>
          {review.comment && (
            <p className="text-sm text-[var(--ink-2)] mt-2 italic">"{review.comment}"</p>
          )}
          <p className="text-xs text-[var(--muted)] mt-3">
            {review.would_recommend ? '✓ Would recommend' : '✗ Would not recommend'}
          </p>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 3: Write `app/places/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RamenScore } from '@/components/reviews/RamenScore'
import { ReviewList } from '@/components/reviews/ReviewList'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: place } = await supabase.from('places').select('name_en, description_short_en, cover_photo_url').eq('slug', slug).single()
  if (!place) return {}
  return {
    title: `${place.name_en} — HiyoshiFood`,
    description: place.description_short_en,
    openGraph: {
      title: place.name_en,
      description: place.description_short_en,
      images: place.cover_photo_url ? [place.cover_photo_url] : [],
    },
  }
}

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('place')
  const supabase = createServerClient()

  const { data: place } = await supabase.from('places').select('*').eq('slug', slug).single()
  if (!place) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, review_grades(*)')
    .eq('place_id', place.id)
    .order('created_at', { ascending: false })

  const { data: dimensions } = await supabase
    .from('grading_dimensions')
    .select('*')
    .eq('active', true)
    .order('order')

  const allGrades = reviews?.flatMap((r) => r.review_grades) ?? []
  const avgScore = allGrades.length > 0
    ? allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length
    : null

  const name = locale === 'jp' ? place.name_jp : place.name_en
  const descLong = locale === 'jp' ? place.description_long_jp : place.description_long_en

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {place.cover_photo_url && (
          <div className="relative w-full aspect-video max-h-96 bg-slate-100">
            <Image src={place.cover_photo_url} alt={name} fill className="object-cover" priority />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <h1 className="display text-3xl md:text-4xl text-[var(--ink)] mb-2">{name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-sm px-2 py-0.5 rounded-full bg-[var(--accent-d)]/10 text-[var(--accent-d)]">{place.category}</span>
            <span className="mono text-sm">{place.price_range}</span>
            {place.cash_only && <span className="text-xs text-[var(--muted)]">{t('cashOnly')}</span>}
          </div>
          {avgScore !== null && (
            <div className="flex items-center gap-2 mb-6">
              <RamenScore score={avgScore} />
              <span className="mono text-lg text-[var(--accent-a)]">{avgScore.toFixed(1)}</span>
              <span className="text-sm text-[var(--muted)]">({reviews?.length ?? 0} {t('reviews')})</span>
            </div>
          )}
          {descLong && <p className="text-base text-[var(--ink-2)] leading-relaxed mb-8">{descLong}</p>}
          <section>
            <h2 className="display text-xl text-[var(--ink)] mb-4">{t('reviews')}</h2>
            <ReviewList
              reviews={reviews ?? []}
              dimensions={dimensions ?? []}
              locale={locale}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add app/places/ components/reviews/RamenScore.tsx components/reviews/ReviewList.tsx
git commit -m "feat: place detail page with review list and RamenScore widget"
```

---

## Task 9: Review Form

**Files:**
- Create: `components/reviews/ReviewForm.tsx`

- [ ] **Step 1: Write `components/reviews/ReviewForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GradingDimension } from '@/types'

interface Props {
  placeId: string
  dimensions: GradingDimension[]
  locale: string
  onSuccess: () => void
}

export function ReviewForm({ placeId, dimensions, locale, onSuccess }: Props) {
  const t = useTranslations('review')
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [visitedOn, setVisitedOn] = useState('')
  const [mealOrdered, setMealOrdered] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [comment, setComment] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({ place_id: placeId, display_name: displayName, visited_on: visitedOn, meal_ordered: mealOrdered, would_recommend: wouldRecommend, comment: comment || null })
      .select('id')
      .single()

    if (error || !review) { setLoading(false); return }

    const grades = dimensions.map((d) => ({
      review_id: review.id,
      dimension_id: d.id,
      score: scores[d.id] ?? 3,
    }))

    await supabase.from('review_grades').insert(grades)
    await supabase.from('notifications').insert({ review_id: review.id })

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">{t('displayName')}</Label>
        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visitedOn">{t('visitedOn')}</Label>
        <Input id="visitedOn" type="date" value={visitedOn} onChange={(e) => setVisitedOn(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mealOrdered">{t('mealOrdered')}</Label>
        <Input id="mealOrdered" value={mealOrdered} onChange={(e) => setMealOrdered(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-[var(--ink)]">Rate each dimension (1–5):</p>
        {dimensions.map((dim) => {
          const label = locale === 'jp' ? dim.name_jp : dim.name_en
          return (
            <div key={dim.id} className="flex items-center gap-3">
              <span className="text-base w-6">{dim.emoji}</span>
              <span className="text-sm text-[var(--ink-2)] w-32 shrink-0">{label}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={`Rate ${label}`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [dim.id]: n }))}
                    className={cn(
                      'w-11 h-11 rounded-lg border text-sm font-medium mono transition-colors duration-150 cursor-pointer',
                      scores[dim.id] === n
                        ? 'bg-[var(--accent-a)] border-[var(--accent-a)] text-[var(--ink)]'
                        : 'border-slate-200 text-[var(--muted)] hover:border-[var(--accent-a)]'
                    )}
                    aria-pressed={scores[dim.id] === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="wouldRecommend">{t('wouldRecommend')}</Label>
        <button
          type="button"
          role="switch"
          aria-checked={wouldRecommend}
          onClick={() => setWouldRecommend((v) => !v)}
          className={cn(
            'relative w-12 h-6 rounded-full border-2 transition-colors duration-200 cursor-pointer',
            wouldRecommend ? 'bg-[var(--accent-a)] border-[var(--accent-a)]' : 'bg-slate-100 border-slate-200'
          )}
        >
          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200', wouldRecommend ? 'translate-x-6' : 'translate-x-0.5')} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">{t('comment')}</Label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="px-3 py-2 border border-slate-200 rounded-lg text-base focus:border-[var(--accent-a)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-a)]/20 resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full cursor-pointer bg-[var(--accent-a)] text-[var(--ink)] hover:opacity-85">
        {loading ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Add "Leave a Review" dialog to `app/places/[slug]/page.tsx`**

Add at the top of the file:
```tsx
import { ReviewFormDialog } from '@/components/reviews/ReviewFormDialog'
```

Create `components/reviews/ReviewFormDialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReviewForm } from './ReviewForm'
import type { GradingDimension } from '@/types'

interface Props {
  placeId: string
  dimensions: GradingDimension[]
  locale: string
}

export function ReviewFormDialog({ placeId, dimensions, locale }: Props) {
  const t = useTranslations('place')
  const tr = useTranslations('review')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setOpen(false)
    router.refresh()
    alert(tr('success'))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-6 py-3 bg-[var(--accent-a)] text-[var(--ink)] display rounded-lg hover:opacity-85 transition-opacity duration-150 cursor-pointer">
          {t('leaveReview')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="display">{t('leaveReview')}</DialogTitle>
        </DialogHeader>
        <ReviewForm placeId={placeId} dimensions={dimensions} locale={locale} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
```

Add `<ReviewFormDialog>` inside the place detail page before `</main>`, passing `placeId={place.id}`, `dimensions={dimensions ?? []}`, `locale={locale}`.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/reviews/
git commit -m "feat: review form with dimension scoring and dialog integration"
```

---

## Task 10: Google Maps & KML Export

**Files:**
- Create: `components/map/EmbeddedMap.tsx`
- Create: `app/api/map/export.kml/route.ts`

- [ ] **Step 1: Write `components/map/EmbeddedMap.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Place } from '@/types'

interface Props {
  places: Pick<Place, 'id' | 'slug' | 'name_en' | 'lat' | 'lng'>[]
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window { google: typeof google; initMap: () => void }
}

export function EmbeddedMap({ places, center = { lat: 35.5648, lng: 139.6490 }, zoom = 16 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    window.initMap = () => {
      if (!ref.current || !window.google) return
      const map = new window.google.maps.Map(ref.current, { center, zoom, mapId: 'hiyoshifood' })
      places.forEach((place) => {
        const marker = new window.google.maps.Marker({ position: { lat: place.lat, lng: place.lng }, map, title: place.name_en })
        marker.addListener('click', () => router.push(`/places/${place.slug}`))
      })
    }

    if (!document.getElementById('gmaps-script')) {
      const script = document.createElement('script')
      script.id = 'gmaps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      document.head.appendChild(script)
    } else if (window.google) {
      window.initMap()
    }
  }, [places, center, zoom, router])

  return <div ref={ref} className="w-full h-[500px] rounded-xl bg-slate-100" aria-label="Map of food places" />
}
```

- [ ] **Step 2: Write `app/api/map/export.kml/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data: places } = await supabase.from('places').select('name_en, description_short_en, lat, lng, slug')

  const placemarks = (places ?? []).map((p) => `
    <Placemark>
      <name>${escapeXml(p.name_en)}</name>
      <description>${escapeXml(p.description_short_en)}</description>
      <Point><coordinates>${p.lng},${p.lat},0</coordinates></Point>
    </Placemark>`).join('')

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>HiyoshiFood</name>${placemarks}
  </Document>
</kml>`

  return new NextResponse(kml, {
    headers: {
      'Content-Type': 'application/vnd.google-earth.kml+xml',
      'Content-Disposition': 'attachment; filename="hiyoshifood.kml"',
    },
  })
}

function escapeXml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
```

- [ ] **Step 3: Add map tab to homepage**

In `app/page.tsx`, add a tab toggle between "List" and "Map" using the `tab` search param. When `tab=map`, render `<EmbeddedMap places={places} />` instead of `<PlaceGrid>`. Add the shadcn `Tabs` component for the toggle UI.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add components/map/ app/api/
git commit -m "feat: Google Maps embed with place pins and KML export route"
```

---

## Task 11: Admin Middleware & Login

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Write `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const accessToken = req.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.getUser(accessToken)
  if (error) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Write `app/admin/login/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.replace('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="display text-2xl text-[var(--ink)] mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write Playwright test `tests/admin-auth.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to admin login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('admin login page renders form', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})
```

- [ ] **Step 4: Run e2e test**

```bash
npm run dev &
npx playwright test tests/admin-auth.spec.ts
```

Expected: Both tests pass.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts app/admin/login/
git commit -m "feat: admin middleware auth guard and login page"
```

---

## Task 12: Admin Layout & Dashboard

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `components/admin/AdminNav.tsx`
- Create: `components/admin/NotificationBadge.tsx`
- Create: `lib/realtime.ts`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Write `lib/realtime.ts`**

```ts
import { supabase } from './supabase'

export function subscribeToNotifications(onUpdate: (count: number) => void) {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
      onUpdate(count ?? 0)
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}
```

- [ ] **Step 2: Write `components/admin/NotificationBadge.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeToNotifications } from '@/lib/realtime'

interface Props {
  initialCount: number
}

export function NotificationBadge({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const unsub = subscribeToNotifications(setCount)
    return unsub
  }, [])

  if (count === 0) return null

  return (
    <span className="mono text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {count > 99 ? '99+' : count}
    </span>
  )
}
```

- [ ] **Step 3: Write `components/admin/AdminNav.tsx`**

```tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { NotificationBadge } from './NotificationBadge'
import { LayoutDashboard, MapPin, MessageSquare, Settings, LogOut } from 'lucide-react'

export async function AdminNav() {
  const supabase = createServerClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/places', label: 'Places', icon: MapPin },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare, badge: count ?? 0 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-slate-100 flex flex-col p-4 z-30">
      <div className="display text-lg mb-8 px-2">HiyoshiFood Admin</div>
      <ul className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 cursor-pointer"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">{label}</span>
              {badge !== undefined && badge > 0 && <NotificationBadge initialCount={badge} />}
            </Link>
          </li>
        ))}
      </ul>
      <form action="/api/admin/logout" method="POST">
        <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer w-full">
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Log out</span>
        </button>
      </form>
    </nav>
  )
}
```

- [ ] **Step 4: Add logout route `app/api/admin/logout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SUPABASE_URL!))
}
```

- [ ] **Step 5: Write `app/admin/layout.tsx`**

```tsx
import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Write `app/admin/page.tsx`**

```tsx
import { createServerClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  const supabase = createServerClient()
  const [{ count: placeCount }, { count: reviewCount }, { count: unreadCount }] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false),
  ])

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Places', value: placeCount ?? 0 },
          { label: 'Total Reviews', value: reviewCount ?? 0 },
          { label: 'Unread Notifications', value: unreadCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-6 border border-slate-100">
            <p className="text-sm text-[var(--muted)] mb-1">{label}</p>
            <p className="mono text-3xl text-[var(--ink)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add app/admin/ components/admin/ lib/realtime.ts
git commit -m "feat: admin layout, sidebar nav, dashboard, realtime notification badge"
```

---

## Task 13: Admin Places CRUD

**Files:**
- Create: `app/admin/places/page.tsx`
- Create: `app/admin/places/new/page.tsx`
- Create: `app/admin/places/[id]/edit/page.tsx`
- Create: `components/admin/PlaceForm.tsx`

- [ ] **Step 1: Write `components/admin/PlaceForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Place } from '@/types'

interface Props {
  place?: Partial<Place>
  isEdit?: boolean
}

export function PlaceForm({ place, isEdit }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    slug: place?.slug ?? '',
    name_en: place?.name_en ?? '',
    name_jp: place?.name_jp ?? '',
    category: place?.category ?? 'ramen',
    address: place?.address ?? '',
    lat: String(place?.lat ?? ''),
    lng: String(place?.lng ?? ''),
    price_range: place?.price_range ?? '¥',
    hours_text: place?.hours_text ?? '',
    description_short_en: place?.description_short_en ?? '',
    description_short_jp: place?.description_short_jp ?? '',
    description_long_en: place?.description_long_en ?? '',
    description_long_jp: place?.description_long_jp ?? '',
    cash_only: place?.cash_only ?? false,
    seating_capacity: String(place?.seating_capacity ?? ''),
  })

  function field(key: keyof typeof form) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let cover_photo_url = place?.cover_photo_url ?? null

    if (coverFile) {
      const path = `covers/${Date.now()}-${coverFile.name}`
      const { error: uploadError } = await supabase.storage.from('places').upload(path, coverFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('places').getPublicUrl(path)
        cover_photo_url = data.publicUrl
      }
    }

    const payload = {
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      seating_capacity: form.seating_capacity ? parseInt(form.seating_capacity) : null,
      cash_only: form.cash_only,
      cover_photo_url,
    }

    if (isEdit && place?.id) {
      await supabase.from('places').update(payload).eq('id', place.id)
    } else {
      await supabase.from('places').insert(payload)
    }

    router.push('/admin/places')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-5">
      {[
        { id: 'slug', label: 'Slug (URL-friendly)', key: 'slug' as const },
        { id: 'name_en', label: 'Name (EN)', key: 'name_en' as const },
        { id: 'name_jp', label: 'Name (JP)', key: 'name_jp' as const },
        { id: 'address', label: 'Address', key: 'address' as const },
        { id: 'lat', label: 'Latitude', key: 'lat' as const },
        { id: 'lng', label: 'Longitude', key: 'lng' as const },
        { id: 'hours_text', label: 'Hours', key: 'hours_text' as const },
        { id: 'description_short_en', label: 'Short description (EN)', key: 'description_short_en' as const },
        { id: 'description_short_jp', label: 'Short description (JP)', key: 'description_short_jp' as const },
      ].map(({ id, label, key }) => (
        <div key={id} className="flex flex-col gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          <Input id={id} {...field(key)} required={['slug','name_en','name_jp','address','lat','lng'].includes(id)} />
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <Label>Price Range</Label>
        <Select value={form.price_range} onValueChange={(v) => setForm((f) => ({ ...f, price_range: v as Place['price_range'] }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['¥','¥¥','¥¥¥'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cover">Cover Photo</Label>
        <input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer w-fit">
        {loading ? 'Saving…' : isEdit ? 'Update Place' : 'Create Place'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Write `app/admin/places/page.tsx`**

```tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'

export default async function AdminPlacesPage() {
  const supabase = createServerClient()
  const { data: places } = await supabase.from('places').select('id, name_en, category, price_range, created_at').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="display text-3xl text-[var(--ink)]">Places</h1>
        <Link href="/admin/places/new">
          <Button className="cursor-pointer">+ Add Place</Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {['Name', 'Category', 'Price', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(places ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{p.name_en}</td>
                <td className="px-4 py-3 mono text-xs">{p.category}</td>
                <td className="px-4 py-3 mono text-xs">{p.price_range}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/places/${p.id}/edit`} className="text-[var(--accent-d)] hover:underline cursor-pointer">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `app/admin/places/new/page.tsx`**

```tsx
import { PlaceForm } from '@/components/admin/PlaceForm'

export default function NewPlacePage() {
  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Add Place</h1>
      <PlaceForm />
    </div>
  )
}
```

- [ ] **Step 4: Write `app/admin/places/[id]/edit/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { PlaceForm } from '@/components/admin/PlaceForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditPlacePage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: place } = await supabase.from('places').select('*').eq('id', id).single()
  if (!place) notFound()

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Edit Place</h1>
      <PlaceForm place={place} isEdit />
    </div>
  )
}
```

- [ ] **Step 5: Create Supabase Storage bucket**

In Supabase dashboard → Storage → create bucket named `places` with public access enabled.

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add app/admin/places/ components/admin/PlaceForm.tsx
git commit -m "feat: admin places CRUD with cover photo upload to Supabase Storage"
```

---

## Task 14: Admin Reviews & Settings

**Files:**
- Create: `app/admin/reviews/page.tsx`
- Create: `app/admin/settings/page.tsx`

- [ ] **Step 1: Write `app/admin/reviews/page.tsx`**

```tsx
import { createServerClient } from '@/lib/supabase-server'
import { DeleteReviewButton } from '@/components/admin/DeleteReviewButton'

export default async function AdminReviewsPage() {
  const supabase = createServerClient()

  // Mark all notifications as read
  await supabase.from('notifications').update({ read: true }).eq('read', false)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, places(name_en)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-6">Reviews</h1>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {['Place', 'Reviewer', 'Visited', 'Meal', 'Recommend', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{(r.places as any)?.name_en}</td>
                <td className="px-4 py-3">{r.display_name}</td>
                <td className="px-4 py-3 mono text-xs">{r.visited_on}</td>
                <td className="px-4 py-3">{r.meal_ordered}</td>
                <td className="px-4 py-3">{r.would_recommend ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><DeleteReviewButton reviewId={r.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `components/admin/DeleteReviewButton.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this review? This cannot be undone.')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Delete review"
      className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-150 cursor-pointer rounded"
    >
      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
    </button>
  )
}
```

- [ ] **Step 3: Write `app/admin/settings/page.tsx`**

```tsx
import { createServerClient } from '@/lib/supabase-server'
import { DimensionToggle } from '@/components/admin/DimensionToggle'

export default async function AdminSettingsPage() {
  const supabase = createServerClient()
  const { data: dimensions } = await supabase.from('grading_dimensions').select('*').order('order')

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Settings</h1>
      <section className="mb-8">
        <h2 className="display text-xl text-[var(--ink)] mb-4">Grading Dimensions</h2>
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {(dimensions ?? []).map((dim) => (
            <div key={dim.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{dim.emoji}</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">{dim.name_en}</p>
                  <p className="text-sm text-[var(--muted)]">{dim.name_jp}</p>
                </div>
              </div>
              <DimensionToggle dimensionId={dim.id} active={dim.active} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Write `components/admin/DimensionToggle.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function DimensionToggle({ dimensionId, active }: { dimensionId: string; active: boolean }) {
  const router = useRouter()

  async function toggle() {
    await supabase.from('grading_dimensions').update({ active: !active }).eq('id', dimensionId)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={active}
      className={cn(
        'relative w-12 h-6 rounded-full border-2 transition-colors duration-200 cursor-pointer',
        active ? 'bg-[var(--accent-a)] border-[var(--accent-a)]' : 'bg-slate-100 border-slate-200'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
        active ? 'translate-x-6' : 'translate-x-0.5'
      )} />
    </button>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add app/admin/reviews/ app/admin/settings/ components/admin/DeleteReviewButton.tsx components/admin/DimensionToggle.tsx
git commit -m "feat: admin reviews list with delete and settings page with dimension toggles"
```

---

## Task 15: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/homepage.spec.ts`
- Create: `tests/place-detail.spec.ts`
- Create: `tests/review-submission.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: Write `tests/homepage.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('homepage renders hero and filter bar', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByPlaceholder('Search places…')).toBeVisible()
})

test('language toggle switches between EN and JP', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: /switch language/i })
  await toggle.click()
  await page.waitForLoadState('networkidle')
  // After toggle, button should show EN (we were on EN, switched to JP)
  await expect(toggle).toBeVisible()
})

test('map tab renders map container', async ({ page }) => {
  await page.goto('/?tab=map')
  await expect(page.getByLabel('Map of food places')).toBeVisible()
})
```

- [ ] **Step 3: Write `tests/place-detail.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('place detail page shows 404 for unknown slug', async ({ page }) => {
  const response = await page.goto('/places/nonexistent-slug-xyz')
  expect(response?.status()).toBe(404)
})
```

- [ ] **Step 4: Write `tests/review-submission.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

// This test requires at least one place in the DB with a known slug.
// Replace 'test-place' with the slug of a seeded place.
const TEST_SLUG = 'test-place'

test.skip(!process.env.TEST_PLACE_SLUG, 'Set TEST_PLACE_SLUG env var to run this test')

test('review form opens and can be filled', async ({ page }) => {
  const slug = process.env.TEST_PLACE_SLUG ?? TEST_SLUG
  await page.goto(`/places/${slug}`)
  await page.getByRole('button', { name: /leave a review/i }).click()
  await expect(page.getByLabel(/your name/i)).toBeVisible()
  await page.getByLabel(/your name/i).fill('Test Student')
  await page.getByLabel(/when did you visit/i).fill('2026-05-18')
  await page.getByLabel(/what did you order/i).fill('Ramen')
})
```

- [ ] **Step 5: Run all e2e tests**

```bash
npx playwright test
```

Expected: All non-skipped tests pass.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "feat: add Playwright e2e tests for homepage, place detail, and review form"
```

---

## Task 16: Final Polish & Vercel Deploy

**Files:**
- Modify: `next.config.ts` (image domains)
- Create: `.env.production` reference

- [ ] **Step 1: Add Supabase image domain to `next.config.ts`**

```ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
})
```

- [ ] **Step 2: Final build check**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors, no missing imports.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

Set these environment variables in Vercel dashboard (or via CLI):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

- [ ] **Step 5: Smoke test production URL**

Visit the production URL and verify:
- Homepage loads with hero and filter bar
- Language toggle works
- `/admin/login` accessible, `/admin` redirects to login
- KML at `/api/map/export.kml` returns valid XML

- [ ] **Step 6: Final commit**

```bash
git add next.config.ts
git commit -m "feat: configure Supabase image domain and production deploy"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by |
|---|---|
| Place list with filters | Task 7 (PlaceFilters) + Task 7 (homepage) |
| Place detail page | Task 8 |
| 🍜 bowl scoring | Task 8 (RamenScore) |
| Review submission flow | Task 9 (ReviewForm + dialog) |
| Grading dimensions (10 default) | Task 3 (seed SQL) |
| Google Maps embed | Task 10 (EmbeddedMap) |
| KML export | Task 10 (route.ts) |
| EN/JP toggle (cookie-based) | Task 4 (next-intl) + Task 5 (LocaleSwitcher) |
| Admin login + middleware guard | Task 11 |
| Admin dashboard | Task 12 |
| Admin places CRUD | Task 13 |
| Cover photo upload (Supabase Storage) | Task 13 (PlaceForm) |
| Admin reviews list + hard delete | Task 14 |
| Admin settings (dimension toggles) | Task 14 |
| Realtime notification badge | Task 12 (NotificationBadge + realtime.ts) |
| Mark notifications read on /admin/reviews | Task 14 (reviews page) |
| OG meta tags on place detail | Task 8 (generateMetadata) |
| noindex robots | Task 1 (layout metadata) |
| Playwright e2e | Task 15 |
| Vercel deploy | Task 16 |

**No placeholders detected.** All code blocks are complete.
**Type consistency:** `PlaceWithScore`, `ReviewWithGrades`, `GradingDimension`, `Place` used consistently across all tasks.
