'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Place } from '@/types'

interface Props {
  places: Pick<Place, 'id' | 'slug' | 'name_en' | 'lat' | 'lng'>[]
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

export function EmbeddedMap({
  places,
  center = { lat: 35.5648, lng: 139.6490 },
  zoom = 16,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    window.initMap = () => {
      if (!ref.current || !window.google) return
      const map = new window.google.maps.Map(ref.current, { center, zoom })
      places.forEach((place) => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          title: place.name_en,
        })
        marker.addListener('click', () => router.push(`/places/${place.slug}`))
      })
    }

    const existingScript = document.getElementById('gmaps-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'gmaps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      document.head.appendChild(script)
    } else if (window.google) {
      window.initMap()
    }
  }, [places, center, zoom, router])

  return (
    <div
      ref={ref}
      className="w-full h-[500px] rounded-xl bg-slate-100"
      aria-label="Map of food places"
    />
  )
}
