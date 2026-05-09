import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({
  message = 'Cargando...',
  size = 'md',
}: LoadingSpinnerProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDark(isDarkMode)
    }
    
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }

  const trackColor = isDark ? 'rgba(241, 208, 10, 0.2)' : 'rgba(34, 50, 92, 0.15)'
  const indicatorColor = isDark ? '#F1D00A' : '#22325C'
  const textColor = isDark ? '#f8fafc' : '#1e293b'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="relative">
        <svg
          className={`animate-spin ${sizeClasses[size]}`}
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={trackColor}
            strokeWidth="4"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={indicatorColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="75"
            className="animate-loading-dash"
          />
        </svg>
      </div>
      <p
        className="mt-6 text-lg font-medium"
        style={{ color: textColor }}
      >
        {message}
      </p>
      <style>{`
        @keyframes loading-dash {
          0% { stroke-dashoffset: 100; }
          50% { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 100; }
        }
        .animate-loading-dash {
          animation: loading-dash 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}