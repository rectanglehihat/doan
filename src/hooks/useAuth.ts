'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/useUserStore';

interface UseAuthReturn {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getSession: () => Promise<void>;
  isLoading: boolean;
}

function syncSessionToStore(session: Session | null) {
  if (session) {
    useUserStore.getState().setUser(session.user);
  } else {
    useUserStore.getState().clearUser();
  }
  useUserStore.getState().setLoading(false);
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSessionToStore(session);
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

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const getSession = useCallback(async () => {
    useUserStore.getState().setLoading(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    syncSessionToStore(session);
  }, []);

  return {
    signInWithGoogle,
    signOut,
    getSession,
    isLoading,
  };
}
