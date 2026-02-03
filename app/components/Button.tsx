'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  pill?: boolean;
  iconOnly?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      pill = false,
      iconOnly = false,
      disabled,
      href,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-darkest disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    const variantStyles = {
      primary:
        'bg-neon-cyan text-bg-darkest hover:bg-neon-cyan/90 focus:ring-neon-cyan active:scale-95',
      secondary:
        'bg-neon-purple text-text-primary hover:bg-neon-purple/90 focus:ring-neon-purple active:scale-95',
      ghost:
        'bg-transparent border-2 border-gray-700 text-text-primary hover:border-neon-cyan hover:text-neon-cyan focus:ring-neon-cyan active:scale-95',
      danger:
        'bg-neon-magenta text-text-primary hover:bg-neon-magenta/90 focus:ring-neon-magenta active:scale-95',
    };

    const sizeStyles = {
      sm: iconOnly ? 'p-2' : 'px-3 py-1.5 text-sm',
      md: iconOnly ? 'p-3' : 'px-4 py-2 text-base',
      lg: iconOnly ? 'p-4' : 'px-6 py-3 text-lg',
      xl: iconOnly ? 'p-5' : 'px-8 py-4 text-xl',
    };

    const glowStyles = glow
      ? {
          primary: 'neon-glow-cyan hover:shadow-[0_0_30px_var(--neon-cyan)]',
          secondary: 'neon-glow-purple hover:shadow-[0_0_30px_var(--neon-purple)]',
          ghost: 'hover:neon-glow-cyan',
          danger: 'neon-glow-magenta hover:shadow-[0_0_30px_var(--neon-magenta)]',
        }[variant]
      : '';

    const roundedStyles = pill ? 'rounded-full' : 'rounded-lg';

    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      glowStyles,
      roundedStyles,
      disabled && 'hover:shadow-none hover:scale-100',
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;