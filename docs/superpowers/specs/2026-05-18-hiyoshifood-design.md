# HiyoshiFood — Design Spec

**Status:** Approved
**Date:** 2026-05-18

---

## 1. Product Overview

### Problem

New students arrive in Hiyoshi, Japan every year with no reliable guide to the food places around them. Existing tools (Google Maps, Tabelog) are generic, not student-focused, and don't reflect what actually matters to a student living in that area.

### Solution

HiyoshiFood is a student-driven food review platform for the Hiyoshi area. Students can browse places, read reviews from peers, and contribute their own — graded on criteria that actually matter to student life. Admins curate the place list to ensure quality. All places are accessible via an embedded map and a downloadable Google Maps link.

### Target Users

- **Primary:** New and current students in Hiyoshi looking for food recommendations
- **Secondary:** Admins (maintainers) who curate the place list and moderate reviews

### Success Metrics

- Number of places added
- Number of reviews submitted
- Return visits per user

---

## 2. Architecture

Single Next.js 15 app (App Router, RSC) deployed on Vercel. Admin panel lives at `/admin/*`, protected by Next.js middleware. Supabase handles the database, auth (admin accounts), and file storage (cover photos).

```
app/
  globals.css
  layout.tsx
  page.tsx                        ← Landing + place list
  places/[slug]/page.tsx          ← Place detail
  api/
    map/export.kml/route.ts       ← Auto-generated KML export
  admin/
    login/page.tsx
    page.tsx                      ← Dashboard
    places/page.tsx
    places/new/page.tsx
    places/[id]/edit/page.tsx
    reviews/page.tsx
    settings/page.tsx
components/
  ui/                             ← shadcn primitives
  layout/                         ← Navbar, footer, admin sidebar
  places/                         ← PlaceCard, PlaceGrid, PlaceFilters
  reviews/                        ← ReviewForm, ReviewList, RamenScore
  map/                            ← EmbeddedMap, MapPin
  admin/                          ← AdminNav, NotificationBadge
lib/
  utils.ts
  supabase.ts
  supabase-server.ts
  realtime.ts
types/
  index.ts
```

---

## 3. Pages & Navigation

### Public Routes

| Route | Description |
|---|---|
| `/` | Landing hero + place list with filters + map tab |
| `/places/[slug]` | Place detail: cover photo, info, grading breakdown, reviews, embedded map |

### Admin Routes (login required)

| Route | Description |
|---|---|
| `/admin/login` | Admin login (Supabase Auth email + password) |
| `/admin` | Dashboard — notification badge, recent reviews |
| `/admin/places` | All places list |
| `/admin/places/new` | Add a new place |
| `/admin/places/[id]/edit` | Edit place details, custom fields, cover photo |
| `/admin/reviews` | Browse and hard-delete reviews |
| `/admin/settings` | Configure grading dimensions, manage admin accounts |

### Navigation

- **Public:** top bar with logo, language toggle (EN / JP), "Open in Google Maps" button
- **Admin:** sidebar with section links; Reviews item shows notification badge for unread reviews

---

## 4. Data Model

### `places`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | Unique, URL-friendly |
| `name_en` | text | |
| `name_jp` | text | |
| `category` | text | e.g. ramen, café, izakaya |
| `address` | text | |
| `lat` | float | For map pins |
| `lng` | float | For map pins |
| `price_range` | enum | ¥ / ¥¥ / ¥¥¥ |
| `hours_text` | text | Plain text, no live filtering |
| `cover_photo_url` | text | Supabase Storage URL |
| `description_short_en` | text | |
| `description_short_jp` | text | |
| `description_long_en` | text | |
| `description_long_jp` | text | |
| `cash_only` | boolean | |
| `seating_capacity` | integer | |
| `created_at` | timestamp | |

### `place_attributes` — extensible custom fields

| Column | Type |
|---|---|
| `id` | uuid |
| `place_id` | uuid FK → places |
| `key` | text |
| `value_en` | text |
| `value_jp` | text |

### `grading_dimensions` — admin-configurable

| Column | Type |
|---|---|
| `id` | uuid |
| `name_en` | text |
| `name_jp` | text |
| `emoji` | text |
| `order` | integer |
| `active` | boolean |

**Default dimensions (seeded):**

| Emoji | EN | JP |
|---|---|---|
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

### `reviews`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `place_id` | uuid FK → places | |
| `display_name` | text | |
| `visited_on` | date | |
| `meal_ordered` | text | |
| `would_recommend` | boolean | |
| `comment` | text | Nullable |
| `created_at` | timestamp | |

### `review_grades` — one row per dimension per review

| Column | Type |
|---|---|
| `id` | uuid |
| `review_id` | uuid FK → reviews |
| `dimension_id` | uuid FK → grading_dimensions |
| `score` | integer (1–5) |

### `notifications`

| Column | Type |
|---|---|
| `id` | uuid |
| `review_id` | uuid FK → reviews |
| `read` | boolean |
| `created_at` | timestamp |

### Admin Accounts

Managed via **Supabase Auth** (email + password). No custom users table. New admins invited by email from `/admin/settings`. Middleware checks for an active Supabase session on all `/admin/*` routes.

---

## 5. Grading & Scoring

- Each review submits a score (1–5 🍜) per active grading dimension
- A place's **overall score** = average of all `review_grades` scores across all its reviews
- Displayed as 🍜 bowls (1–5, supporting half-bowl increments)
- Admin can rename any dimension (EN + JP) and toggle dimensions active/inactive from `/admin/settings`
- Inactive dimensions are hidden from the review form and place detail; historical grades for that dimension are retained in the DB

---

## 6. Review Submission Flow

1. User opens a place detail page
2. Taps "Leave a Review"
3. Fills in: display name, visited date, meal ordered, would recommend (toggle)
4. Rates each active grading dimension 1–5 🍜
5. Optional: written comment
6. Submits — review saved, notification record created, user sees their review immediately

No account required. No rate limiting (community trust model).

---

## 7. Google Maps Integration

### Embedded Map

- Google Maps JavaScript API with custom pins for all places
- Appears on `/` (accessible via a "Map" tab alongside the place list)
- Also appears on `/places/[slug]` centered on that specific place
- Pins link to the place detail page

### Shareable / Downloadable Map

- **KML export** auto-generated at `/api/map/export.kml` — always in sync with the DB
- Users tap the "Open in Google Maps" button → KML opens in Google Maps on their phone
- Admin can also paste a **Google My Maps URL** in Settings, displayed as a prominent CTA button site-wide

---

## 8. Internationalisation

- **`next-intl`** for all UI strings
- Language preference stored in a cookie, defaulting to English
- EN / JP toggle in the top navigation bar
- Bilingual content stored as `_en` / `_jp` column pairs in the DB
- Reviews are not translated — displayed exactly as submitted

| Content | Approach |
|---|---|
| UI strings | `next-intl` message files |
| Place names & descriptions | DB `_en` / `_jp` columns |
| Grading dimension names | DB `_en` / `_jp` columns |
| Custom place attributes | DB `_en` / `_jp` columns |
| Reviews | Single language, as submitted |

---

## 9. Filtering & Browsing

Available on the homepage place list:

| Filter / Sort | Type |
|---|---|
| Search by name | Text input |
| Category | Multi-select |
| Price range | Toggle (¥ / ¥¥ / ¥¥¥) |
| Cash only | Boolean toggle |
| Sort by overall 🍜 score | Descending |
| Near me | Geolocation → sort by distance |

---

## 10. Admin Notifications

- Every new review creates a row in `notifications` (read: false)
- Admin sidebar shows a badge with the count of unread notifications on the Reviews link
- Marking reviews as seen (navigating to `/admin/reviews`) marks all as read
- Powered by Supabase Realtime — badge updates live without page refresh

---

## 11. Place Detail Page — Open Graph

Each `/places/[slug]` page exposes:
- `og:title` — place name (in current language)
- `og:description` — short description
- `og:image` — cover photo URL
- `og:url` — canonical slug URL

Enables rich previews when shared on LINE, Instagram, etc. Pages are **not** indexed by search engines (`noindex`).

---

## 12. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Server | Supabase service role key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public | Maps JavaScript API |

---

## 13. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router + RSC | 15 |
| Language | TypeScript | 5, strict: false |
| Styling | Tailwind CSS | 3 |
| Components | shadcn/ui (default, slate, no CSS vars) | — |
| Utility | clsx + tailwind-merge (`cn()`) | — |
| Database / Auth / Storage | Supabase (supabase-js) | v2 |
| i18n | next-intl | — |
| Maps | Google Maps JavaScript API | — |
| Fonts | Archivo, Archivo Black, JetBrains Mono | next/font |
| Testing | Playwright (e2e) | — |
| Deploy | Vercel | — |

---

## 14. Out of Scope (v1)

- Live "open now" filter
- User accounts for reviewers
- Review translation
- Push / email notifications for admins
- SEO indexing
- Review photos
- Spam / rate limiting
