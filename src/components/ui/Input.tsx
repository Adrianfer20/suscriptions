import React from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  id?: string
  error?: string
  helpText?: React.ReactNode
  endContent?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, helpText, endContent, ...props }, ref) => {
    const inputId = id || (props.name as string) || undefined

    return (
      <div className={cn('flex flex-col')}>
        {label && (
          <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow',
              error ? 'border-red-500 focus:ring-red-500' : '',
              endContent ? 'pr-10' : '',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            {...props}
          />
          {endContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {endContent}
            </div>
          )}
        </div>

        {helpText && !error && (
            <p id={`${inputId}-help`} className="mt-1 text-xs text-gray-500">{helpText}</p>
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
