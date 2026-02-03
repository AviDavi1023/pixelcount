'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            className={cn(
              'w-full px-4 py-2.5 bg-dark-lighter border-2 border-gray-700 rounded-lg',
              'text-text-primary',
              'transition-all duration-200',
              'focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20',
              'hover:border-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700',
              'appearance-none cursor-pointer',
              error && 'border-neon-magenta focus:border-neon-magenta focus:ring-neon-magenta/20',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          >
            {children}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-neon-magenta">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
