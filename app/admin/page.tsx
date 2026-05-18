import { createServerClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  const supabase = createServerClient()

  const [{ count: placeCount }, { count: reviewCount }, { count: unreadCount }] =
    await Promise.all([
      supabase.from('places').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false),
    ])

  const stats = [
    { label: 'Total Places', value: placeCount ?? 0 },
    { label: 'Total Reviews', value: reviewCount ?? 0 },
    { label: 'Unread Notifications', value: unreadCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-6 border border-slate-100">
            <p className="text-sm text-[var(--muted)] mb-1">{label}</p>
            <p className="mono text-3xl text-[var(--ink)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
