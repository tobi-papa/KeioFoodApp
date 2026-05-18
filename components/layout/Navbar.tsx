import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import { LocaleSwitcher } from './LocaleSwitcher'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="display text-xl text-[var(--ink)]">
          HiyoshiFood 🍜
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-[var(--accent-a)] text-[var(--ink)] hover:opacity-85 transition-opacity duration-150 cursor-pointer min-h-[44px]"
          >
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('openInMaps')}</span>
          </a>
        </div>
      </div>
    </header>
  )
}
