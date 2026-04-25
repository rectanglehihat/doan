import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

function buildCspHeader(nonce: string, isDev: boolean): string {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    img-src 'self' blob: data: https://lh3.googleusercontent.com;
    font-src 'self';
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
  // Supabase 세션 갱신 — 쿠키 포함된 응답 반환
  const sessionResponse = await updateSession(request)

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
