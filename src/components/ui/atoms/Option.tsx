import { useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

export interface OptionProps {
  value: string;
  isSelected?: boolean;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Option({ value, isSelected = false, onSelect, disabled = false, children }: OptionProps) {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect?.(value);
    }
  }, [disabled, onSelect, value]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-slate-900 outline-none',
        'hover:bg-slate-100',
        isSelected && 'font-medium',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <svg
          data-check
          className="ml-2 h-4 w-4 text-slate-900"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="4 12 9 17 20 7" />
        </svg>
      )}
    </div>
  );
}
