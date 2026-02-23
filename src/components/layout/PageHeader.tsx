import React from 'react'

export default function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex items-center">{action}</div>}
    </div>
  )
}
