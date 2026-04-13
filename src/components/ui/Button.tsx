import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors rounded focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none',
          size === 'sm' && 'text-xs px-2.5 py-1 h-7 gap-1',
          size === 'md' && 'text-sm px-3 py-1.5 h-8 gap-1.5',
          size === 'lg' && 'text-sm px-4 py-2 h-9 gap-2',
          variant === 'primary'   && 'bg-n-accent text-white hover:bg-n-accent-hover',
          variant === 'secondary' && 'bg-n-hover text-n-text hover:bg-n-active border border-n-border',
          variant === 'ghost'     && 'bg-transparent text-n-text hover:bg-n-hover',
          variant === 'danger'    && 'bg-n-red-surface text-n-red hover:opacity-90',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
