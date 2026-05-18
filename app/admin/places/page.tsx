import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export default async function AdminPlacesPage() {
  const supabase = createServerClient()
  const { data: places } = await supabase
    .from('places')
    .select('id, name_en, category, price_range, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="display text-3xl text-[var(--ink)]">Places</h1>
        <Link href="/admin/places/new">
          <Button className="cursor-pointer">+ Add Place</Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {['Name', 'Category', 'Price', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(places ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{p.name_en}</td>
                <td className="px-4 py-3 mono text-xs">{p.category}</td>
                <td className="px-4 py-3 mono text-xs">{p.price_range}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/places/${p.id}/edit`}
                    className="flex items-center gap-1.5 text-[var(--accent-d)] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
