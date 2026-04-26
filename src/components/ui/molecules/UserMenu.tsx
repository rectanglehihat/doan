'use client';

import { useState, useMemo, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/atoms/Button';

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
  isLoading?: boolean;
}

export function UserMenu({ user, onSignOut, isLoading = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initial = useMemo(
    () => (user.email?.[0] ?? '?').toUpperCase(),
    [user.email],
  );

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    onSignOut();
  }, [onSignOut]);

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-8 h-8 rounded-full p-0 font-semibold"
      >
        {initial}
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border border-slate-200 bg-white shadow-md z-10">
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start"
            >
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
