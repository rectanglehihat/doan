import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'error';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
};

const variantClasses: Record<InputVariant, string> = {
  default:
    'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900',
  error:
    'border-red-500 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-red-500',
};

const base =
  'flex w-full rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', variant = 'default', className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(base, sizeClasses[size], variantClasses[variant], className)}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
