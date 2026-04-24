import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping bg-primary/20 rounded-full`} />
      </div>
      {text && (
        <span className="ml-3 text-primary/80 font-mono text-sm">{text}</span>
      )}
    </div>
  );
}
