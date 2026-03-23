import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950',
  outline: 'border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-100 active:bg-slate-200',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-100 active:bg-slate-200',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  link: 'bg-transparent text-slate-900 underline underline-offset-4 hover:text-slate-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-8 py-3 text-sm',
};

const base =
  'inline-flex items-center justify-center rounded-md font-medium leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', type = 'button', className = '', children, ...props }, ref) => {
    const sizeClass = variant !== 'link' ? sizeClasses[size] : '';

    return (
      <button
        ref={ref}
        type={type}
        className={`${base} ${variantClasses[variant]} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
