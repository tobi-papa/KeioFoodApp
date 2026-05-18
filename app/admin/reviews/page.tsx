import { createServerClient } from '@/lib/supabase-server'
import { DeleteReviewButton } from '@/components/admin/DeleteReviewButton'

export default async function AdminReviewsPage() {
  const supabase = createServerClient()

  // Mark all notifications as read
  await supabase.from('notifications').update({ read: true }).eq('read', false)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, places(name_en)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-6">Reviews</h1>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {['Place', 'Reviewer', 'Visited', 'Meal', 'Recommend', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((r) => (
              <tr
                key={r.id}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  {(r.places as { name_en: string } | null)?.name_en}
                </td>
                <td className="px-4 py-3">{r.display_name}</td>
                <td className="px-4 py-3 mono text-xs">{r.visited_on}</td>
                <td className="px-4 py-3">{r.meal_ordered}</td>
                <td className="px-4 py-3">{r.would_recommend ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <DeleteReviewButton reviewId={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
