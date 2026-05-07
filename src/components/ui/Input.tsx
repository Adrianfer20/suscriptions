import React from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  id?: string
  error?: string
  helpText?: React.ReactNode
  endContent?: React.ReactNode
  startContent?: React.ReactNode
  variant?: 'default' | 'search' | 'compact'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, helpText, endContent, startContent, variant = 'default', ...props }, ref) => {
    const inputId = id || (props.name as string) || undefined

    return (
      <div className={cn('flex flex-col')}>
        {label && (
          <label htmlFor={inputId} className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            // Mobile-First: inputMode para teclado optimizado, autoComplete para autofill
            inputMode={props.type === 'email' ? 'email' : props.type === 'tel' ? 'tel' : props.type === 'numeric' ? 'numeric' : props.type === 'search' ? 'search' : 'text'}
            autoComplete={props.type === 'email' ? 'email' : props.type === 'tel' ? 'tel' : props.type === 'numeric' ? 'numeric' : undefined}
            className={cn(
              // Mobile-First: altura mínima 48px para touch target comfortable
              // Variants control tamaño y padding consistente
              variant === 'compact'
                ? 'flex h-9 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white'
                : variant === 'search'
                ? 'flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-12 pr-12 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white'
                : 'flex h-12 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow',
              error ? 'border-red-500 focus:ring-red-500' : '',
              endContent ? 'pr-12' : (startContent ? 'pl-12' : 'pr-4'),
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            {...props}
          />
          {startContent && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {startContent}
            </div>
          )}
          {endContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {endContent}
            </div>
          )}
        </div>

        {helpText && !error && (
            <p id={`${inputId}-help`} className="mt-1 text-xs text-slate-500">{helpText}</p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-rose-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
