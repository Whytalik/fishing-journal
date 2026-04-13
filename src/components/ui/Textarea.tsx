import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-n-muted">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 bg-n-active border border-n-border rounded text-sm text-n-text min-h-[100px]',
            'placeholder:text-n-placeholder transition-colors outline-none resize-none',
            'hover:border-n-muted',
            'focus:border-n-accent focus:ring-1 focus:ring-n-accent',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-n-red focus:border-n-red focus:ring-n-red',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-n-red">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
