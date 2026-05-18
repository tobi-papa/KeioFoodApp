# HiyoshiFood — Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** HiyoshiFood
**Version:** 1.0
**Date:** 2026-05-18
**Status:** Approved
**Pattern:** Community / Food Review Platform
**Style:** Clean Minimal + Warm Japanese Accent

---

## 1. Project Context

HiyoshiFood is a **student-driven food review platform** for the Hiyoshi area (Japan). Students browse, filter, and review local food spots using a 🍜 bowl rating system across student-relevant grading dimensions. The platform is bilingual (EN / JP) and curated by admins.

**Primary audience:** New and current students in Hiyoshi — mobile-first users, casual browsing, quick decisions.
**Secondary audience:** Admins — desktop-first users managing place data and reviews.

---

## 2. Tech Stack

| Layer | Choice | Version / Notes |
|-------|--------|-----------------|
| Framework | Next.js App Router + RSC | 15 |
| Language | TypeScript | 5, `strict: false` |
| Styling | Tailwind CSS | 3 |
| Components | shadcn/ui | `default` style, `slate` base, **no CSS vars** |
| Utility | clsx + tailwind-merge | Use `cn()` from `@/lib/utils` everywhere |
| Database / Auth | Supabase | v2 |
| i18n | next-intl | EN / JP |
| Maps | Google Maps JavaScript API | — |
| Fonts | Archivo, Archivo Black, JetBrains Mono | via `next/font` |
| Testing | Playwright | e2e only |
| Deploy | Vercel | — |

**shadcn rule:** Import components from `@/components/ui/`. Never override shadcn source files directly — extend via `cn()` or wrapper components.

---

## 3. Typography

### Font Stack

| Role | Font | Variable | Tailwind Class |
|------|------|----------|----------------|
| Body / UI | Archivo | `--font-archivo` | `.font-archivo` (default body) |
| Display / Headings | Archivo Black | `--font-archivo-black` | `.display` |
| Monospace / Data | JetBrains Mono | `--font-jetbrains-mono` | `.mono` |

### Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 1.5 | Labels, badges, meta |
| `text-sm` | 14px | 1.5 | Secondary text, captions |
| `text-base` | 16px | 1.625 | Body copy (minimum on mobile) |
| `text-lg` | 18px | 1.5 | Card titles, sub-headings |
| `text-xl` | 20px | 1.4 | Section labels |
| `text-2xl` | 24px | 1.3 | Page headings |
| `text-3xl` | 30px | 1.2 | Hero sub-titles |
| `text-4xl–5xl` | 36–48px | 1.1 | Hero headlines (`.display`) |

**Rules:**
- Minimum body text: `text-base` (16px) on mobile — never smaller
- Line length: max 65–75 characters per paragraph (`max-w-prose`)
- Heading hierarchy: always sequential — no skipping h levels
- `.display` (Archivo Black) for hero, place names, section headers
- `.mono` (JetBrains Mono) for scores, prices, data values, tags

### Utility Classes (globals.css)

```css
.mono    { font-family: var(--font-jetbrains-mono); }
.display { font-family: var(--font-archivo-black); }
.rainbow { background: linear-gradient(90deg, var(--accent-a), var(--accent-b), var(--accent-c), var(--accent-d), var(--accent-e));
           -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
```

---

## 4. Color System

### CSS Design Tokens (globals.css `:root`)

The project uses **named CSS custom properties** for semantic colors alongside shadcn's slate base. Define all in `globals.css`.

| Variable | Role | Suggested Value |
|----------|------|-----------------|
| `--bg` | Page background | `#FAFAF8` (warm off-white) |
| `--ink` | Primary text | `#0F0F0E` (near-black) |
| `--ink-2` | Secondary text | `#3D3D38` |
| `--muted` | Muted / disabled text | `#8C8C84` |
| `--paper` | Card / surface background | `#FFFFFF` |
| `--accent-a` | Accent 1 — warm amber | `#F59E0B` |
| `--accent-b` | Accent 2 — orange | `#F97316` |
| `--accent-c` | Accent 3 — red | `#EF4444` |
| `--accent-d` | Accent 4 — teal | `#14B8A6` |
| `--accent-e` | Accent 5 — slate | `#64748B` |

**Primary action color:** `--accent-a` (amber) — used for CTAs, active states, score fills.
**Danger / delete:** `--accent-c` (red).
**Admin accent:** `--accent-e` (slate).

### Tailwind Usage Pattern

Since shadcn is configured with `slate` base and **no CSS vars**, use:
- `bg-slate-*`, `text-slate-*` for shadcn component theming
- `var(--bg)`, `var(--ink)` etc. via inline styles or `@apply` in custom classes
- Never hardcode hex values directly in JSX — use the token system

### Semantic Color Map

| Context | Color | Token |
|---------|-------|-------|
| Page background | `--bg` | Warm off-white |
| Card surface | `--paper` | White |
| Primary text | `--ink` | Near-black |
| Secondary text | `--ink-2` | Dark grey |
| Muted / placeholder | `--muted` | Medium grey |
| CTA / active score | `--accent-a` | Amber |
| Category badges | `--accent-d` | Teal |
| Danger / delete | `--accent-c` | Red |
| Price badge | `--accent-b` | Orange |
| Admin UI | `--accent-e` | Slate |

### Price Range Colors

| Price | Badge color |
|-------|-------------|
| ¥ | `text-emerald-700 bg-emerald-50` |
| ¥¥ | `text-amber-700 bg-amber-50` |
| ¥¥¥ | `text-rose-700 bg-rose-50` |

---

## 5. Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps, icon padding |
| `--space-sm` | `8px` / `0.5rem` | Inline spacing, small gaps |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Card padding, section gaps |
| `--space-xl` | `32px` / `2rem` | Large section spacing |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

**Tailwind equivalents:** `p-4` = `--space-md`, `p-6` = `--space-lg`, `p-8` = `--space-xl`.

---

## 6. Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.08)` | PlaceCard default |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.10)` | PlaceCard hover, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.12)` | Modals, bottom sheets |

---

## 7. Grading & Scoring System

### 🍜 Bowl Rating

Scores are displayed as 🍜 bowl icons (1–5, supporting half increments).

| Score | Display | Meaning |
|-------|---------|---------|
| 1 | 🍜 | Disappointing |
| 2 | 🍜🍜 | Below average |
| 3 | 🍜🍜🍜 | Decent |
| 4 | 🍜🍜🍜🍜 | Very good |
| 5 | 🍜🍜🍜🍜🍜 | Exceptional |

**Implementation:** Use SVG bowl icons filled/half-filled by score. The emoji `🍜` may be used as a thematic decoration but NOT as a UI icon — use SVG for the rating widget.

**Overall score** = average of all `review_grades` across all reviews for a place.

### Grading Dimensions (Default Seed)

| Emoji | Key EN | Key JP |
|-------|--------|--------|
| 💰 | Wallet Pain | 財布へのダメージ |
| ⚡ | Speed Run | 速さ |
| 🌙 | Night Owl | 夜遅くまで営業 |
| 🇬🇧 | Gaijin Friendly | 外国人対応 |
| 🪑 | Solo Comfort | 一人でも快適 |
| 👥 | Squad Ready | 大人数OK |
| 📶 | Study Viable | 勉強できる |
| 😴 | Hangover Cure | 二日酔いに効く |
| 🔁 | Repeat Offender | また来たい |
| 🍜 | Worth the Queue | 並ぶ価値あり |

**UX note:** Dimensions use emoji as decorative labels only — not as UI icons. The score widget itself must use SVG.

---

## 8. Component Specs

### PlaceCard

```
┌─────────────────────────────────┐
│  [Cover Photo — 16:9 aspect]    │
│  ┌───────────────────────────┐  │
│  │ Category badge  ¥¥ badge  │  │
│  └───────────────────────────┘  │
│  Place Name (Archivo Black)     │
│  🍜🍜🍜🍜 4.2  (14 reviews)   │
│  📍 Short description           │
└─────────────────────────────────┘
```

- `border-radius: 12px`, `overflow: hidden`
- Hover: `translateY(-4px)` + `--shadow-lg` (`.hover-lift`)
- Cover photo: `object-cover`, `aspect-video`, lazy-loaded
- `cursor-pointer` on card root
- Transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`

### Buttons

```css
/* Primary (CTA) */
.btn-primary {
  background: var(--accent-a);   /* amber */
  color: #0F0F0E;                /* dark ink on amber */
  padding: 12px 24px;
  border-radius: 8px;
  font-family: var(--font-archivo-black);
  font-size: 14px;
  letter-spacing: 0.02em;
  transition: all 200ms ease;
  cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

/* Secondary (outline) */
.btn-secondary {
  background: transparent;
  color: var(--ink);
  border: 1.5px solid var(--ink-2);
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 200ms ease;
  cursor: pointer;
}
.btn-secondary:hover { border-color: var(--ink); background: var(--paper); }

/* Danger */
.btn-danger {
  background: var(--accent-c);
  color: white;
  /* same shape as primary */
}
```

### Inputs & Forms

```css
.input {
  padding: 12px 16px;
  border: 1.5px solid #E2E8F0;   /* slate-200 */
  border-radius: 8px;
  font-size: 16px;                /* never below 16px — prevents iOS zoom */
  font-family: var(--font-archivo);
  transition: border-color 200ms ease;
  background: var(--paper);
  color: var(--ink);
}
.input:focus {
  border-color: var(--accent-a);
  outline: none;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
}
```

Every `<input>` must have a corresponding `<label>` with matching `htmlFor`.

### Modals

```css
.modal-overlay {
  background: rgba(15, 15, 14, 0.6);
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--paper);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 520px;
  width: 90%;
}
```

### Review Score Widget (RamenScore)

- 5 SVG bowl icons in a row
- Filled bowl = `fill: var(--accent-a)` (amber)
- Empty bowl = `fill: var(--muted)`
- Half bowl = clip-path at 50% width
- Min touch target per bowl: **44×44px**
- `aria-label="Rate X out of 5"` on the widget
- `role="radiogroup"` with `role="radio"` per bowl

### Admin Notification Badge

- Red dot / count badge on Reviews nav item
- `bg-red-500 text-white text-xs font-mono rounded-full`
- Min size: 18×18px; `min-w-[18px]`
- Positioned `absolute -top-1 -right-1` on the nav icon

---

## 9. Layout & Responsive

### Breakpoints (Tailwind defaults)

| Name | Width | Context |
|------|-------|---------|
| `sm` | 640px | Large mobile / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

**Design order:** Mobile-first. Build `base` styles for 375px, then add `sm:`, `md:`, `lg:` modifiers.

### Container

- Max width: `max-w-6xl` (`1152px`) for public pages
- Max width: `max-w-7xl` (`1280px`) for admin dashboard
- Horizontal padding: `px-4` (mobile) → `px-6` (md) → `px-8` (lg)
- Never mix container widths on the same page

### Place Grid

```
Mobile (< 640px):  1 column
sm (640px+):       2 columns
lg (1024px+):      3 columns
xl (1280px+):      4 columns
```

Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6`

### Navbar

- Fixed top, full width
- Height: 64px (`h-16`)
- Contents: Logo (left), Language toggle + "Open in Google Maps" CTA (right)
- Backdrop: `bg-white/90 backdrop-blur-sm border-b border-slate-100`
- Body must have `pt-16` to compensate for fixed navbar

### Admin Sidebar

- Fixed left, full height, width: 240px (`w-60`)
- `bg-slate-900 text-slate-100` (dark sidebar for admin context)
- Main content area: `ml-60`
- Responsive: sidebar collapses to bottom nav on mobile (`md:block`)

### Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base content | 0 | Normal flow |
| Cards on hover | 10 | Lifted cards |
| Dropdowns / popovers | 20 | Filter panels |
| Sticky headers | 30 | Navbar |
| Modals | 50 | Review form modal |
| Toast / notifications | 60 | Admin badge |

---

## 10. Animation & Motion

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro-interaction | 150ms | `ease` | Button hover, input focus |
| Standard transition | 200ms | `ease` | Card hover, color change |
| Panel open/close | 250ms | `cubic-bezier(0.4,0,0.2,1)` | Filters, modals |
| Scroll reveal | 400ms | `cubic-bezier(0.4,0,0.2,1)` | `.reveal` class |

### `.hover-lift` (globals.css)
```css
.hover-lift {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### `.reveal` / `.reveal.in` (globals.css)
```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.in {
  opacity: 1;
  transform: translateY(0);
}
```

### `.grid-bg` (globals.css)
```css
.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

**Always respect `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  .hover-lift:hover { transform: none; }
  .reveal { transition: opacity 200ms ease; transform: none; }
}
```

---

## 11. Internationalisation (i18n)

- Library: `next-intl`
- Languages: `en` (default), `jp`
- Language preference: stored in cookie
- Toggle: EN / JP button in navbar

### Bilingual Content Rules

| Content type | Source |
|-------------|--------|
| UI strings (labels, CTA, nav) | `next-intl` message files |
| Place names & descriptions | DB `_en` / `_jp` columns |
| Grading dimension names | DB `_en` / `_jp` columns |
| Custom place attributes | DB `_en` / `_jp` columns |
| Reviews | Single language, as submitted — never translated |

**Component rule:** Always read from `useTranslations()` for UI strings. Never hardcode English UI text in JSX.

### Language Toggle (Navbar)
- Two-state button: `EN` | `JP`
- Active state: Archivo Black, `text-ink`
- Inactive state: `text-muted`, lighter weight
- Min touch target: 44px each

---

## 12. Page Patterns

### Homepage (`/`)

Structure:
1. **Hero** — Tagline (`.display`), subtitle, "Open in Google Maps" CTA
2. **Filters** — Search, category multi-select, price range toggles, sort
3. **Tab bar** — "List" | "Map" toggle
4. **Place Grid** (or embedded map depending on active tab)

**Color strategy:** Warm, welcoming. `.grid-bg` on hero for texture. Amber CTA for map button. Scroll reveal on place grid.

### Place Detail (`/places/[slug]`)

Structure:
1. Cover photo (full-width, `aspect-video`, `object-cover`)
2. Name + category + price badge + overall 🍜 score
3. Quick info bar: hours, cash only, capacity
4. Grading dimension breakdown (horizontal score bars)
5. Review list (chronological, newest first)
6. "Leave a Review" button → opens `ReviewForm` modal
7. Embedded Google Map (centered on this place)

### Admin Dashboard (`/admin`)

- Dark sidebar + light main content
- Top card row: total places, total reviews, unread notifications count
- Recent reviews table
- Realtime badge on sidebar "Reviews" link

---

## 13. Accessibility

### Requirements

| Rule | Requirement |
|------|-------------|
| Color contrast | Minimum 4.5:1 for normal text, 3:1 for large text |
| Focus states | Visible focus ring on all interactive elements |
| Touch targets | Minimum 44×44px for all tappable elements |
| Alt text | All meaningful images have descriptive `alt` |
| Form labels | Every `<input>` has a `<label htmlFor>` |
| ARIA | Icon-only buttons have `aria-label` |
| Keyboard nav | Tab order matches visual reading order |

### Focus Ring (consistent across app)
```css
:focus-visible {
  outline: 2px solid var(--accent-a);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 14. Icons

- **Icon set:** Lucide React (consistent, tree-shakeable)
- **Size:** `w-5 h-5` (20px) default; `w-4 h-4` for inline/small; `w-6 h-6` for nav
- **Stroke:** `strokeWidth={1.5}` default
- **Never use emojis as functional UI icons** — emojis are decorative (dimension labels, etc.) only

---

## 15. Anti-Patterns (Forbidden)

- ❌ **Emojis as UI icons** — use Lucide SVG icons
- ❌ **Missing `cursor-pointer`** — every clickable element must have it
- ❌ **Layout-shifting hover** — avoid `scale()` transforms that reflow content
- ❌ **Low contrast text** — `--muted` color only for truly secondary info, never body copy
- ❌ **Instant state changes** — always transition 150–300ms
- ❌ **Missing focus states** — never `outline: none` without a custom replacement
- ❌ **Hardcoded hex values in JSX** — use CSS variables or Tailwind tokens
- ❌ **Font size below 16px on mobile** — iOS auto-zooms inputs smaller than 16px
- ❌ **Mixed container widths** — stick to `max-w-6xl` public / `max-w-7xl` admin
- ❌ **Translating reviews** — reviews display as submitted, one language only
- ❌ **Hardcoded English UI strings** — always use `next-intl`
- ❌ **Cluttered layouts** — whitespace is content; never pack more than 3–4 info units in a card

---

## 16. Pre-Delivery Checklist

Before delivering any UI code:

### Visual Quality
- [ ] No emojis used as functional icons (SVG only)
- [ ] All icons from Lucide, consistent `strokeWidth={1.5}`
- [ ] Hover states don't cause layout shift
- [ ] `.display` class used for all hero / place name headings

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback (color + shadow)
- [ ] Transitions are smooth (150–300ms)
- [ ] Focus states visible and match `--accent-a` ring

### Layout
- [ ] Mobile-first: tested at 375px, 640px, 768px, 1024px, 1440px
- [ ] No horizontal scroll at any breakpoint
- [ ] `pt-16` on body to clear fixed navbar
- [ ] Container width consistent within page type

### Accessibility
- [ ] All `<img>` have `alt` text
- [ ] All `<input>` have `<label htmlFor>`
- [ ] Icon-only buttons have `aria-label`
- [ ] Color contrast ≥ 4.5:1 for all text
- [ ] `prefers-reduced-motion` respected

### i18n
- [ ] All UI strings use `useTranslations()` — no hardcoded EN text
- [ ] Bilingual place names / descriptions read from `_en` / `_jp` columns
- [ ] Language toggle accessible and functional

### Shadcn / Code Conventions
- [ ] All class merging via `cn()` from `@/lib/utils`
- [ ] shadcn components imported from `@/components/ui/`
- [ ] No direct mutation of shadcn source files
- [ ] Supabase client: browser → `@/lib/supabase`, server → `@/lib/supabase-server`
