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
            <p className="text-sm text-[var(--ink-2)] mt-2 italic">&ldquo;{review.comment}&rdquo;</p>
          )}
          <p className="text-xs text-[var(--muted)] mt-3">
            {review.would_recommend ? '✓ Would recommend' : '✗ Would not recommend'}
          </p>
        </li>
      ))}
    </ul>
  )
}
