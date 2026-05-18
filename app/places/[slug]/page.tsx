import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RamenScore } from '@/components/reviews/RamenScore'
import { ReviewList } from '@/components/reviews/ReviewList'
import type { ReviewWithGrades, ReviewGrade } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: place } = await supabase
    .from('places')
    .select('name_en, description_short_en, cover_photo_url')
    .eq('slug', slug)
    .single()
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

  const typedReviews = (reviews as unknown as ReviewWithGrades[]) ?? []
  const allGrades: ReviewGrade[] = typedReviews.flatMap((r) => r.review_grades)
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
              reviews={typedReviews}
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
