import './LoadingSpinner.css'

export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" />
      <div className="loading-message">{message}</div>
    </div>
  )
}
