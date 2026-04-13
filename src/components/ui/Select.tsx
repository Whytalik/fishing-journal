import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-n-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'w-full px-3 py-2 pr-8 bg-n-active border border-n-border rounded text-sm text-n-text appearance-none',
              'transition-colors outline-none',
              'hover:border-n-muted',
              'focus:border-n-accent focus:ring-1 focus:ring-n-accent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error && 'border-n-red focus:border-n-red focus:ring-n-red',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
            <svg className="w-3.5 h-3.5 text-n-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-n-red">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
