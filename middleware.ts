import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const accessToken = req.cookies.get('sb-access-token')?.value

  if (!accessToken) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.getUser(accessToken)

  if (error) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
