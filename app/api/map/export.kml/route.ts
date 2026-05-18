import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data: places } = await supabase
    .from('places')
    .select('name_en, description_short_en, lat, lng, slug')

  const placemarks = (places ?? [])
    .map(
      (p) => `
    <Placemark>
      <name>${escapeXml(p.name_en)}</name>
      <description>${escapeXml(p.description_short_en)}</description>
      <Point><coordinates>${p.lng},${p.lat},0</coordinates></Point>
    </Placemark>`
    )
    .join('')

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>HiyoshiFood</name>${placemarks}
  </Document>
</kml>`

  return new NextResponse(kml, {
    headers: {
      'Content-Type': 'application/vnd.google-earth.kml+xml',
      'Content-Disposition': 'attachment; filename="hiyoshifood.kml"',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
