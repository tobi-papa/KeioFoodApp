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
