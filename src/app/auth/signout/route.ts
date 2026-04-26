import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/constants/site'
import { NextResponse } from 'next/server'

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', baseUrl))
}
