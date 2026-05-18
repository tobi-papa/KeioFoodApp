import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { NotificationBadge } from './NotificationBadge'
import { LayoutDashboard, MapPin, MessageSquare, Settings, LogOut } from 'lucide-react'

export async function AdminNav() {
  const supabase = createServerClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/places', label: 'Places', icon: MapPin },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare, badge: count ?? 0 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-slate-100 flex flex-col p-4 z-30">
      <div className="display text-lg mb-8 px-2">HiyoshiFood Admin</div>
      <ul className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 cursor-pointer"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">{label}</span>
              {badge !== undefined && badge > 0 && (
                <NotificationBadge initialCount={badge} />
              )}
            </Link>
          </li>
        ))}
      </ul>
      <form action="/api/admin/logout" method="POST">
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer w-full"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Log out</span>
        </button>
      </form>
    </nav>
  )
}
