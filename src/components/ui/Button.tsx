import React from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary hover:bg-primary-600 text-white shadow-sm focus:ring-primary',
      secondary: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 focus:ring-gray-200 shadow-sm',
      ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white focus:ring-gray-200',
      outline: 'bg-transparent border border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/20 focus:ring-primary',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm',
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

