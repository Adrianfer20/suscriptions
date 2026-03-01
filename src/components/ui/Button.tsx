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
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer align-middle select-none'

    const focusOffsetLight = 'focus-visible:ring-offset-slate-50'
    const focusOffsetDark = 'dark:focus-visible:ring-offset-slate-900'

    const variants: Record<ButtonVariant, string> = {
      // primary: use primary in light mode, but switch to secondary-like background in dark for better contrast
      primary:
        `bg-primary hover:bg-primary-600 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${focusOffsetLight} dark:bg-secondary dark:hover:bg-secondary/90 dark:focus-visible:ring-secondary ${focusOffsetDark}`,
      secondary:
        `bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-gray-200 focus-visible:ring-offset-2 ${focusOffsetLight} shadow-sm`,
      ghost:
        `bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-gray-200 focus-visible:ring-offset-2 ${focusOffsetLight}`,
      outline:
        `bg-transparent border border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${focusOffsetLight}`,
      danger:
        `bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${focusOffsetLight} shadow-sm`,
      destructive:
        `bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${focusOffsetLight} shadow-sm`,
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-lg',
      icon: 'h-10 w-10 p-2 rounded-md',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], 'active:scale-98', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

