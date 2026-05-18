import { PlaceForm } from '@/components/admin/PlaceForm'

export default function NewPlacePage() {
  return (
    <div>
      <h1 className="display text-3xl text-[var(--ink)] mb-8">Add Place</h1>
      <PlaceForm />
    </div>
  )
}
