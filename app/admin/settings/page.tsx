import { createServerClient } from '@/lib/supabase-server'
import { DimensionToggle } from '@/components/admin/DimensionToggle'

export default async function AdminSettingsPage() {
  const supabase = createServerClient()
  const { data: dimensions } = await supabase
    .from('grading_dimensions')
    .select('*')
    .order('order')

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Settings</h1>
      <section className="mb-8">
        <h2 className="display text-xl text-[var(--ink)] mb-4">Grading Dimensions</h2>
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {(dimensions ?? []).map((dim) => (
            <div key={dim.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{dim.emoji}</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">{dim.name_en}</p>
                  <p className="text-sm text-[var(--muted)]">{dim.name_jp}</p>
                </div>
              </div>
              <DimensionToggle dimensionId={dim.id} active={dim.active} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
