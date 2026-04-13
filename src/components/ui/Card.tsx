import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover }: CardProps) {
  return (
    <div className={cn(
      'bg-n-surface border border-n-border rounded-lg',
      hover && 'hover:bg-n-hover transition-colors cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-2 px-5 py-3.5 border-b border-n-border', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-sm font-semibold text-n-text', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  );
}

export function CardSection({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-5 py-4 border-t border-n-border', className)}>
      {children}
    </div>
  );
}
