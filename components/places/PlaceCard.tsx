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
