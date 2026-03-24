'use client';

import { Children, cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { OptionProps } from '@/components/ui/atoms/Option';

type SelectSize = 'sm' | 'md' | 'lg';
type SelectVariant = 'default' | 'error';

interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  disabled?: boolean;
  children: React.ReactNode;
}

const triggerSizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 px-2 pr-7 text-xs',
  md: 'h-10 px-3 pr-9 text-sm',
  lg: 'h-12 px-4 pr-10 text-base',
};

const triggerVariantClasses: Record<SelectVariant, string> = {
  default: 'border-slate-200 focus-visible:ring-slate-900',
  error: 'border-red-500 focus-visible:ring-red-500',
};

const triggerBase =
  'relative flex w-full items-center justify-between rounded-md border bg-white text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function Select({
  value,
  onChange,
  placeholder = '선택',
  size = 'md',
  variant = 'default',
  disabled = false,
  children,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleOptionSelect = useCallback(
    (selectedValue: string) => {
      onChange?.(selectedValue);
      setIsOpen(false);
    },
    [onChange],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedLabel = (() => {
    let label: string | null = null;
    Children.forEach(children, (child) => {
      if (isValidElement<OptionProps>(child) && child.props.value === value) {
        label = child.props.children as string;
      }
    });
    return label;
  })();

  const mappedChildren = Children.map(children, (child) => {
    if (!isValidElement<OptionProps>(child)) return null;
    return cloneElement(child, {
      isSelected: child.props.value === value,
      onSelect: handleOptionSelect,
    });
  });

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleTriggerClick}
        className={cn(triggerBase, triggerSizeClasses[size], triggerVariantClasses[variant])}
      >
        <span className={cn(!selectedLabel && 'text-slate-400')}>
          {selectedLabel ?? placeholder}
        </span>
        <svg
          className="ml-2 h-4 w-4 shrink-0 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md"
        >
          <div className="max-h-48 overflow-y-auto p-1">
            {mappedChildren}
          </div>
        </div>
      )}
    </div>
  );
}
