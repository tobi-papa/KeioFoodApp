'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this review? This cannot be undone.')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Delete review"
      className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-150 cursor-pointer rounded"
    >
      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
    </button>
  )
}
