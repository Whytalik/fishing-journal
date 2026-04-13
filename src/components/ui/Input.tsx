import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-n-muted">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-3 py-2 bg-n-active border border-n-border rounded text-sm text-n-text',
            'placeholder:text-n-placeholder transition-colors outline-none',
            'hover:border-n-muted',
            'focus:border-n-accent focus:ring-1 focus:ring-n-accent',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-n-red focus:border-n-red focus:ring-n-red',
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && <p className="text-xs text-n-subtle">{hint}</p>}
        {error && <p className="text-xs text-n-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
