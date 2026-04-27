import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

function buildCspHeader(nonce: string, isDev: boolean): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseWss = supabaseUrl.replace('https://', 'wss://')
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    img-src 'self' blob: data: https://lh3.googleusercontent.com;
    font-src 'self';
    connect-src 'self' ${supabaseUrl} ${supabaseWss};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const sessionResponse = await updateSession(request)

  // 리다이렉트 응답(3xx)에는 CSP 헤더 불필요
  if (sessionResponse.status >= 300 && sessionResponse.status < 400) {
    return sessionResponse
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const cspHeader = buildCspHeader(nonce, isDev)

  sessionResponse.headers.set('x-nonce', nonce)
  sessionResponse.headers.set('Content-Security-Policy', cspHeader)

  return sessionResponse
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
