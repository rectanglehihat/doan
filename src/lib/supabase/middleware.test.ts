import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/types/supabase', () => ({}))

import { updateSession } from './middleware'

describe('updateSession', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetUser.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('NextResponse를 반환한다', async () => {
    const request = new NextRequest('http://localhost:3000/')
    const response = await updateSession(request)
    expect(response).toBeDefined()
  })

  it('auth.getUser()를 호출해 세션을 갱신한다', async () => {
    const request = new NextRequest('http://localhost:3000/')
    await updateSession(request)
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })

  it('NEXT_PUBLIC_SUPABASE_URL이 없으면 에러를 던진다', async () => {
    vi.unstubAllEnvs()
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    const request = new NextRequest('http://localhost:3000/')
    await expect(updateSession(request)).rejects.toThrow('NEXT_PUBLIC_SUPABASE_URL')
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl
  })

  it('NEXT_PUBLIC_SUPABASE_ANON_KEY가 없으면 에러를 던진다', async () => {
    vi.unstubAllEnvs()
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    const request = new NextRequest('http://localhost:3000/')
    await expect(updateSession(request)).rejects.toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey
  })
})
