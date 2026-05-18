import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { PlaceForm } from '@/components/admin/PlaceForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: place } = await supabase.from('places').select('*').eq('id', id).single()
  if (!place) notFound()

  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Edit Place</h1>
      <PlaceForm place={place} isEdit />
    </div>
  )
}
