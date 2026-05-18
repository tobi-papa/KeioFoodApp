'use client'

import { useTranslations } from 'next-intl'

export function LocaleSwitcher() {
  const t = useTranslations('nav')

  function switchLocale() {
    const current = document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'en'
    const next = current === 'en' ? 'jp' : 'en'
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <button
      onClick={switchLocale}
      className="mono text-sm px-3 py-2 rounded-md hover:bg-slate-100 transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Switch language"
    >
      {t('langToggle')}
    </button>
  )
}
