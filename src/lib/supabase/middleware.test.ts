import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/types/supabase', () => ({}))

import { updateSession } from './middleware'

const mockUser = { id: 'user-1', email: 'test@example.com' }

describe('updateSession', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetUser.mockClear()
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('인증된 사용자의 / 접근 시 NextResponse를 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const request = new NextRequest('http://localhost:3000/')
    const response = await updateSession(request)
    expect(response).toBeDefined()
  })

  it('auth.getUser()를 호출해 세션을 갱신한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const request = new NextRequest('http://localhost:3000/')
    await updateSession(request)
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })

  it('NEXT_PUBLIC_SUPABASE_URL이 없으면 에러를 던진다', async () => {
    vi.unstubAllEnvs()
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    const request = new NextRequest('http://localhost:3000/login')
    await expect(updateSession(request)).rejects.toThrow('NEXT_PUBLIC_SUPABASE_URL')
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl
  })

  it('NEXT_PUBLIC_SUPABASE_ANON_KEY가 없으면 에러를 던진다', async () => {
    vi.unstubAllEnvs()
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    const request = new NextRequest('http://localhost:3000/login')
    await expect(updateSession(request)).rejects.toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey
  })

  describe('라우트 보호', () => {
    it('미인증 사용자가 / 에 접근하면 /login 으로 리다이렉트한다', async () => {
      const request = new NextRequest('http://localhost:3000/')
      const response = await updateSession(request)
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('인증된 사용자가 /login 에 접근하면 / 으로 리다이렉트한다', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      const request = new NextRequest('http://localhost:3000/login')
      const response = await updateSession(request)
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('인증된 사용자는 / 에 리다이렉트 없이 접근할 수 있다', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      const request = new NextRequest('http://localhost:3000/')
      const response = await updateSession(request)
      expect(response.status).not.toBe(307)
    })

    it('미인증 사용자는 /login 에 리다이렉트 없이 접근할 수 있다', async () => {
      const request = new NextRequest('http://localhost:3000/login')
      const response = await updateSession(request)
      expect(response.status).not.toBe(307)
    })

    it('미인증 사용자는 /auth/callback 에 리다이렉트 없이 접근할 수 있다', async () => {
      const request = new NextRequest('http://localhost:3000/auth/callback')
      const response = await updateSession(request)
      expect(response.status).not.toBe(307)
    })
  })
})
