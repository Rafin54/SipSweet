import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'petal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95',
          
          // Variants
          {
            'bg-blossom-pink text-charcoal hover:bg-opacity-80 focus:ring-blossom-pink shadow-lg': 
              variant === 'primary',
            'bg-lilac-lavender text-charcoal hover:bg-opacity-80 focus:ring-lilac-lavender shadow-lg': 
              variant === 'secondary',
            'bg-mint-green text-charcoal hover:bg-opacity-80 focus:ring-mint-green shadow-lg': 
              variant === 'accent',
            'bg-transparent text-charcoal hover:bg-blossom-pink hover:bg-opacity-20 focus:ring-blossom-pink': 
              variant === 'ghost',
            'bg-gradient-to-br from-blossom-pink to-lilac-lavender text-charcoal hover:shadow-xl focus:ring-blossom-pink transform hover:scale-105 shadow-lg': 
              variant === 'petal',
          },
          
          // Sizes
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-16 px-8 text-xl': size === 'xl',
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
