'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function DimensionToggle({
  dimensionId,
  active,
}: {
  dimensionId: string
  active: boolean
}) {
  const router = useRouter()

  async function toggle() {
    await supabase
      .from('grading_dimensions')
      .update({ active: !active })
      .eq('id', dimensionId)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={active}
      className={cn(
        'relative w-12 h-6 rounded-full border-2 transition-colors duration-200 cursor-pointer',
        active
          ? 'bg-[var(--accent-a)] border-[var(--accent-a)]'
          : 'bg-slate-100 border-slate-200'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
          active ? 'translate-x-6' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
