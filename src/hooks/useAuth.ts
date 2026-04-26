'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/useUserStore';

interface UseAuthReturn {
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        useUserStore.getState().setUser(session.user);
      } else {
        useUserStore.getState().clearUser();
      }
      useUserStore.getState().setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signInWithKakao = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/auth/signout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  return {
    signInWithGoogle,
    signInWithKakao,
    signOut,
    isLoading,
  };
}
