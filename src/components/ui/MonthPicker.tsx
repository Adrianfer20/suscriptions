import React, { useState, useRef, useEffect } from 'react'
import Calendar from 'react-calendar'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import 'react-calendar/dist/Calendar.css'

interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MonthPicker({ value, onChange, placeholder = 'Seleccionar mes' }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse the current value to a Date
  const currentDate = value ? new Date(value + '-01') : new Date()

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle date selection - only allow month selection
  const handleDateChange = (dateValue: Date | null) => {
    if (!dateValue) return
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    onChange(`${year}-${month}`)
    setIsOpen(false)
  }

  // Format display value
  const displayValue = value 
    ? new Date(value + '-01').toLocaleDateString('es-VE', { year: 'numeric', month: 'long' })
    : placeholder

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-primary transition-colors w-full justify-between min-w-40"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className="truncate">{displayValue}</span>
        </div>
        {value && (
          <X 
            className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" 
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
          />
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 top-full left-0">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-2">
            <Calendar
              onChange={handleDateChange as any}
              value={currentDate}
              locale="es-VE"
              minDetail="decade"
              maxDetail="year"
              showNeighboringMonth={false}
              className="border-0"
            />
          </div>
        </div>
      )}
    </div>
  )
}
