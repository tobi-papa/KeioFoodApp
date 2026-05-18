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
      .insert({
        place_id: placeId,
        display_name: displayName,
        visited_on: visitedOn,
        meal_ordered: mealOrdered,
        would_recommend: wouldRecommend,
        comment: comment || null,
      })
      .select('id')
      .single()

    if (error || !review) {
      setLoading(false)
      return
    }

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
          id="wouldRecommend"
          type="button"
          role="switch"
          aria-checked={wouldRecommend}
          onClick={() => setWouldRecommend((v) => !v)}
          className={cn(
            'relative w-12 h-6 rounded-full border-2 transition-colors duration-200 cursor-pointer',
            wouldRecommend ? 'bg-[var(--accent-a)] border-[var(--accent-a)]' : 'bg-slate-100 border-slate-200'
          )}
        >
          <span className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
            wouldRecommend ? 'translate-x-6' : 'translate-x-0.5'
          )} />
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

      <Button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer bg-[var(--accent-a)] text-[var(--ink)] hover:opacity-85"
      >
        {loading ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
