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
      className={cn('bg-white dark:bg-slate-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-slate-700 overflow-hidden flex flex-col p-4', className)}
      {...props}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
           {typeof title === 'string' ? <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h3> : title}
        </div>
      )}
      <div className={cn("flex-1 min-h-0 flex flex-col", title ? "p-4" : "")}>
        {children}
      </div>
    </div>
  )
})
