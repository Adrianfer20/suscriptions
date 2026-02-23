import React, { useState, useRef, useEffect } from 'react'
import { Calendar, X, ChevronDown } from 'lucide-react'

interface MonthFilterSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function MonthFilterSelect({ value, onChange, className = '' }: MonthFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedMonth = value ? value.split('-')[1] : ''
  const selectedYear = value ? value.split('-')[0] : ''

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMonthChange = (month: string) => {
    if (selectedYear) {
      onChange(`${selectedYear}-${month}`)
    } else {
      onChange(`${currentYear}-${month}`)
    }
  }

  const handleYearChange = (year: string) => {
    if (selectedMonth) {
      onChange(`${year}-${selectedMonth}`)
    } else {
      onChange(`${year}-01`)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
  }

  const displayValue = value
    ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    : 'Mes'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors min-w-35 whitespace-nowrap
          ${value ? 'border-slate-300 dark:border-slate-400 bg-slate-400/5 dark:bg-slate-800 text-slate-900 dark:text-slate-400':'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-200 dark:text-slate-300 hover:border-slate-400'
          }
        `}
      >
        <Calendar className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">{displayValue}</span>
        {value ? (
          <X
            className="w-4 h-4 shrink-0 hover:text-red-500 transition-colors"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-100 bottom-0 top-0 right-0 left-0 min-w-55 bg-white dark:bg-slate-800 rounded-md">
          <div className="flex gap-2">
            {/* Month Select */}
            <div className="relative flex-1">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Mes</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Year Select */}
            <div className="relative w-24">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Año</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

         
        </div>
      )}
    </div>
  )
}
