import React, { forwardRef } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode
  as?: React.ElementType
  title?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className, title, ...props }, ref) => {
  return (
    <div
      ref={ref}
      /* Mobile-First: padding más comfortable en móvil */
      className={cn('bg-white dark:bg-slate-800 rounded-2xl sm:rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden flex flex-col', className)}
      {...props}
    >
      {title && (
        <div className="px-4 sm:px-4 py-4 sm:py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
           {typeof title === 'string' ? <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-sm">{title}</h3> : title}
        </div>
      )}
      <div className={cn("flex-1 min-h-0 flex flex-col", title ? "p-4 sm:p-4" : "p-4 sm:p-4")}>
        {children}
      </div>
    </div>
  )
})
