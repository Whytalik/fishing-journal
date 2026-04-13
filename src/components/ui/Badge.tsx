import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-n-hover text-n-muted',
  blue:    'bg-n-blue-surface text-n-blue',
  green:   'bg-n-green-surface text-n-green',
  orange:  'bg-n-orange-surface text-n-orange',
  red:     'bg-n-red-surface text-n-red',
  purple:  'bg-n-purple-surface text-n-purple',
  gray:    'bg-n-gray-surface text-n-gray',
};

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
