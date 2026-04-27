import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useUserStore } from '@/store/useUserStore';

// ────────────────────────────────────────────────────────────────────────────
// 모듈 모킹
// ────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// ────────────────────────────────────────────────────────────────────────────
// mock 함수 선언 — 각 describe 스코프에서 재사용
// ────────────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockGetSession = vi.fn();

// ────────────────────────────────────────────────────────────────────────────
// beforeEach: 스토어 초기화 + mock 재설정
// ────────────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  useUserStore.getState().reset();
  vi.clearAllMocks();

  // mock 구현 재주입 (clearAllMocks로 구현이 제거되기 때문)
  mockSignInWithOAuth.mockResolvedValue({ error: null });
  mockSignOut.mockResolvedValue({ error: null });
  mockUnsubscribe.mockReturnValue(undefined);
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

  const { createClient } = await import('@/lib/supabase/client');
  vi.mocked(createClient).mockReturnValue({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
      getSession: mockGetSession,
    },
  } as unknown as ReturnType<typeof createClient>);

  const { useRouter } = await import('next/navigation');
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  });

  // window.location.origin 고정
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000' },
    writable: true,
    configurable: true,
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 테스트
// ────────────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  it('signInWithGoogle 호출 시 Google OAuth signInWithOAuth를 호출한다', async () => {
    const { useAuth } = await import('./useAuth');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });

  it('signInWithKakao 호출 시 Kakao OAuth signInWithOAuth를 호출한다', async () => {
    const { useAuth } = await import('./useAuth');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithKakao();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'kakao',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });

  it('signOut 호출 시 supabase.auth.signOut을 호출하고 /로 이동한다', async () => {
    const { useAuth } = await import('./useAuth');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('마운트 시 onAuthStateChange 리스너가 등록된다', async () => {
    const { useAuth } = await import('./useAuth');
    renderHook(() => useAuth());

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('언마운트 시 onAuthStateChange 구독이 해제된다', async () => {
    const { useAuth } = await import('./useAuth');
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('isLoading은 useUserStore.isLoading에서 파생된다 (초기값 true)', async () => {
    // useUserStore.reset()은 isLoading을 true로 초기화
    expect(useUserStore.getState().isLoading).toBe(true);

    const { useAuth } = await import('./useAuth');
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('SIGNED_IN 이벤트 수신 시 useUserStore에 user가 설정되고 isLoading이 false가 된다', async () => {
    // onAuthStateChange 콜백을 캡처하도록 mock 재설정
    let capturedCallback:
      | ((event: AuthChangeEvent, session: Session | null) => void)
      | null = null;

    mockOnAuthStateChange.mockImplementation(
      (cb: (event: AuthChangeEvent, session: Session | null) => void) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    );

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    const { useAuth } = await import('./useAuth');
    renderHook(() => useAuth());

    await act(async () => {
      capturedCallback?.('SIGNED_IN', { user: mockUser } as Session);
    });

    await waitFor(() => {
      expect(useUserStore.getState().user).toEqual(mockUser);
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  it('SIGNED_OUT 이벤트 수신 시 useUserStore의 user가 비워지고 isLoading이 false가 된다', async () => {
    let capturedCallback:
      | ((event: AuthChangeEvent, session: Session | null) => void)
      | null = null;

    mockOnAuthStateChange.mockImplementation(
      (cb: (event: AuthChangeEvent, session: Session | null) => void) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    );

    // 먼저 user를 설정한 뒤 SIGNED_OUT 수신
    useUserStore.getState().setUser({
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00.000Z',
    });

    const { useAuth } = await import('./useAuth');
    renderHook(() => useAuth());

    await act(async () => {
      capturedCallback?.('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('getSession', () => {
    const sessionMockUser = {
      id: 'user-456',
      email: 'session@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    it('세션이 있으면 useUserStore에 user가 설정되고 isLoading이 false가 된다', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: sessionMockUser } as Session },
        error: null,
      });

      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.getSession();
      });

      await waitFor(() => {
        expect(useUserStore.getState().user).toEqual(sessionMockUser);
        expect(useUserStore.getState().isLoading).toBe(false);
      });
    });

    it('세션이 없으면 user가 null이고 isLoading이 false가 된다', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // 사전에 user를 설정해 두어 clearUser 효과를 검증
      useUserStore.getState().setUser(sessionMockUser);

      const { useAuth } = await import('./useAuth');
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.getSession();
      });

      await waitFor(() => {
        expect(useUserStore.getState().user).toBeNull();
        expect(useUserStore.getState().isLoading).toBe(false);
      });
    });
  });
});
