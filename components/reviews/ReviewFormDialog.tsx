'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ReviewForm } from './ReviewForm'
import type { GradingDimension } from '@/types'

interface Props {
  placeId: string
  dimensions: GradingDimension[]
  locale: string
}

export function ReviewFormDialog({ placeId, dimensions, locale }: Props) {
  const t = useTranslations('place')
  const tr = useTranslations('review')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setOpen(false)
    router.refresh()
    alert(tr('success'))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-6 py-3 bg-[var(--accent-a)] text-[var(--ink)] display rounded-lg hover:opacity-85 transition-opacity duration-150 cursor-pointer">
          {t('leaveReview')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="display">{t('leaveReview')}</DialogTitle>
        </DialogHeader>
        <ReviewForm
          placeId={placeId}
          dimensions={dimensions}
          locale={locale}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
