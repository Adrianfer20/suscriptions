import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'overlay'
}

export default function LoadingSpinner({
  message = 'Cargando...',
  size = 'md',
  variant = 'default',
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-container variant-${variant}`}>
      <div className={`loading-spinner size-${size}`}>
        <svg viewBox="0 0 50 50">
          <circle className="loading-spinner-track" cx="25" cy="25" r="20" fill="none" />
          <circle className="loading-spinner-indicator" cx="25" cy="25" r="20" fill="none" />
        </svg>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}
