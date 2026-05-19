'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Place } from '@/types'

interface Props {
  place?: Partial<Place>
  isEdit?: boolean
}

const CATEGORIES = ['ramen', 'café', 'izakaya', 'teishoku', 'fast food', 'other']
const PRICE_RANGES = ['¥', '¥¥', '¥¥¥'] as const

export function PlaceForm({ place, isEdit }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    slug: place?.slug ?? '',
    name_en: place?.name_en ?? '',
    name_jp: place?.name_jp ?? '',
    category: place?.category ?? 'ramen',
    address: place?.address ?? '',
    lat: String(place?.lat ?? ''),
    lng: String(place?.lng ?? ''),
    price_range: place?.price_range ?? '¥',
    hours_text: place?.hours_text ?? '',
    description_short_en: place?.description_short_en ?? '',
    description_short_jp: place?.description_short_jp ?? '',
    description_long_en: place?.description_long_en ?? '',
    description_long_jp: place?.description_long_jp ?? '',
    cash_only: place?.cash_only ?? false,
    seating_capacity: String(place?.seating_capacity ?? ''),
  })

  function setField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    let cover_photo_url = place?.cover_photo_url ?? null

    if (coverFile) {
      const path = `covers/${Date.now()}-${coverFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('places')
        .upload(path, coverFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('places').getPublicUrl(path)
        cover_photo_url = data.publicUrl
      }
    }

    const payload = {
      slug: form.slug,
      name_en: form.name_en,
      name_jp: form.name_jp,
      category: form.category,
      address: form.address,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      price_range: form.price_range,
      hours_text: form.hours_text,
      description_short_en: form.description_short_en,
      description_short_jp: form.description_short_jp,
      description_long_en: form.description_long_en,
      description_long_jp: form.description_long_jp,
      cash_only: form.cash_only,
      seating_capacity: form.seating_capacity ? parseInt(form.seating_capacity) : null,
      cover_photo_url,
    }

    let dbError
    if (isEdit && place?.id) {
      const { error } = await supabase.from('places').update(payload).eq('id', place.id)
      dbError = error
    } else {
      const { error } = await supabase.from('places').insert(payload)
      dbError = error
    }

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/admin/places')
    router.refresh()
  }

  const textFields: { id: string; label: string; key: keyof typeof form; required?: boolean }[] = [
    { id: 'slug', label: 'Slug (URL-friendly)', key: 'slug', required: true },
    { id: 'name_en', label: 'Name (EN)', key: 'name_en', required: true },
    { id: 'name_jp', label: 'Name (JP)', key: 'name_jp', required: true },
    { id: 'address', label: 'Address', key: 'address', required: true },
    { id: 'lat', label: 'Latitude', key: 'lat', required: true },
    { id: 'lng', label: 'Longitude', key: 'lng', required: true },
    { id: 'hours_text', label: 'Hours', key: 'hours_text' },
    { id: 'description_short_en', label: 'Short description (EN)', key: 'description_short_en' },
    { id: 'description_short_jp', label: 'Short description (JP)', key: 'description_short_jp' },
    { id: 'seating_capacity', label: 'Seating capacity', key: 'seating_capacity' },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-5">
      {textFields.map(({ id, label, key, required }) => (
        <div key={id} className="flex flex-col gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          <Input id={id} value={form[key] as string} onChange={setField(key)} required={required} />
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Price Range</Label>
        <Select
          value={form.price_range}
          onValueChange={(v) => setForm((f) => ({ ...f, price_range: v as Place['price_range'] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="cash_only">Cash only</Label>
        <input
          id="cash_only"
          type="checkbox"
          checked={form.cash_only}
          onChange={(e) => setForm((f) => ({ ...f, cash_only: e.target.checked }))}
          className="w-4 h-4 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cover">Cover Photo</Label>
        <input
          id="cover"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="text-sm cursor-pointer"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="cursor-pointer w-fit">
        {loading ? 'Saving…' : isEdit ? 'Update Place' : 'Create Place'}
      </Button>
    </form>
  )
}
