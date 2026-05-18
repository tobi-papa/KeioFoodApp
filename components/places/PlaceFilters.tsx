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

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder={t('category')}
        defaultValue={params.get('q') ?? ''}
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
