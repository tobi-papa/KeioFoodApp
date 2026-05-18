import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import { PlaceFilters } from '@/components/places/PlaceFilters'
import type { PlaceWithScore } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; category?: string; price?: string; cashOnly?: string }>
}

async function fetchPlaces(searchParams: Awaited<Props['searchParams']>): Promise<PlaceWithScore[]> {
  const supabase = createServerClient()

  const { data: places } = await supabase.from('places').select('*')
  if (!places) return []

  const { data: reviews } = await supabase.from('reviews').select('id, place_id')
  const { data: grades } = await supabase.from('review_grades').select('score, review_id')

  const reviewCountMap: Record<string, number> = {}
  const reviewPlaceMap: Record<string, string> = {}

  reviews?.forEach((r) => {
    reviewCountMap[r.place_id] = (reviewCountMap[r.place_id] ?? 0) + 1
    reviewPlaceMap[r.id] = r.place_id
  })

  const scoreMap: Record<string, { total: number; count: number }> = {}
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
  if (q) result = result.filter((p) =>
    p.name_en.toLowerCase().includes(q.toLowerCase()) || p.name_jp.includes(q)
  )
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
