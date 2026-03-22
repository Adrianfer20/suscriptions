import { Conversation, FirestoreTimestamp } from '../services/api'
import { Button } from './ui/Button'

const formatTimestamp = (ts?: string | FirestoreTimestamp) => {
  if (!ts) return ''
  
  let date: Date
  if (typeof ts === 'string') {
    date = new Date(ts)
  } else if (isFirestoreTimestamp(ts)) {
    date = new Date(ts._seconds * 1000)
  } else {
    return ''
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  // Same day - show time
  if (messageDate.getTime() === today.getTime()) {
    return timeStr
  }
  
  // Yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Ayer'
  }
  
  // This week - show day name
  const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (24 * 60 * 60 * 1000))
  if (daysDiff < 7) {
    return date.toLocaleDateString('es-VE', { weekday: 'short' })
  }
  
  // Older - show date
  return date.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' })
}

function isFirestoreTimestamp(ts: any): ts is FirestoreTimestamp {
  return ts && typeof ts._seconds === 'number'
}

// Helper to format message preview - clean up technical template names
// Helper to determine message delivery status for display
// Checks multiple possible status fields
const getMessageStatusDisplay = (conversation: { lastMessageStatus?: string; status?: string; messageStatus?: string }): { icon: 'sent' | 'delivered' | 'read'; color: string } => {
  // Check multiple possible status fields
  const status = conversation.lastMessageStatus || conversation.status || conversation.messageStatus
  
  if (!status) return { icon: 'sent', color: 'text-slate-400' }
  
  const lowerStatus = status.toLowerCase()
  if (lowerStatus === 'read') return { icon: 'read', color: 'text-blue-500' }
  if (lowerStatus === 'delivered') return { icon: 'delivered', color: 'text-slate-400' }
  if (lowerStatus === 'sent') return { icon: 'sent', color: 'text-slate-400' }
  if (lowerStatus === 'failed' || lowerStatus === 'error') return { icon: 'sent', color: 'text-red-500' }
  if (lowerStatus === 'queued') return { icon: 'sent', color: 'text-slate-400' }
  
  return { icon: 'sent', color: 'text-slate-400' }
}

const formatMessagePreview = (body?: string, isTemplate?: boolean): { text: string; isAutomated: boolean } => {
  if (!body) return { text: 'Sin mensajes', isAutomated: false };
  
  // If it's a template, show a friendly name with robot indicator
  if (isTemplate || body.startsWith('Template:')) {
    // Extract the template name and make it friendly
    const templateName = body.replace('Template:', '').replace(/_/g, ' ').trim();
    // Map common templates to friendly names
    const friendlyNames: Record<string, string> = {
      'subscription_cutoff': 'Aviso de corte enviado',
      'subscription_welcome': 'Mensaje de bienvenida',
      'subscription_renewed': 'Notificación de renovación',
      'subscription_payment': 'Recordatorio de pago',
      'subscription_reminder': 'Recordatorio automático',
    };
    
    const lowerName = templateName.toLowerCase();
    for (const [key, friendly] of Object.entries(friendlyNames)) {
      if (lowerName.includes(key)) return { text: friendly, isAutomated: true };
    }
    return { text: `Mensaje automático: ${templateName}`, isAutomated: true };
  }
  
  // Truncate long messages
  if (body.length > 45) {
    return { text: body.substring(0, 45) + '...', isAutomated: false };
  }
  return { text: body, isAutomated: false };
}

interface ConversationItemProps {
  conversation: Conversation
  selected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation: c, selected, onClick }: ConversationItemProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        group w-full text-left px-4 py-6 rounded-none flex items-center gap-3 transition-all duration-200 cursor-pointer border-b border-slate-100 dark:border-slate-700/30

        ${selected
          ? 'bg-primary/5 dark:bg-secondary/10'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
        }
      `}
      variant="ghost"
    >
      {/* Avatar - simplified without extra borders */}
      <div
        className={`
          h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-colors

          ${selected
            ? 'bg-primary text-secondary'
            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-secondary/50 group-hover:bg-indigo-200 group-hover:text-indigo-800'
          }
        `}
      >
        {(c.name || c.phone || '?').charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Header - improved layout with proper spacing */}
        <div className="flex justify-between items-center gap-2">
          {/* Left side: Name - bolder when unread */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Unread indicator dot */}
            {!!c.unreadCount && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            )}
            <span
              className={`
                text-sm truncate transition-colors min-w-0
                ${selected
                  ? 'text-primary dark:text-secondary font-semibold'
                  : c.unreadCount 
                    ? 'text-slate-900 dark:text-slate-100 font-bold'
                    : 'text-slate-600 dark:text-slate-300 font-medium group-hover:text-primary'
                }
              `}
            >
              {c.name || c.phone || 'Usuario Desconocido'}
            </span>
          </div>

          {/* Right side: Time - smaller, more subtle */}
          {c.lastMessageAt && (
            <span
              className={`
                text-[11px] shrink-0 transition-colors
                ${selected
                  ? 'text-primary/60 dark:text-secondary/60'
                  : 'text-slate-400 dark:text-slate-500'
                }
              `}
            >
              {formatTimestamp(c.lastMessageAt)}
            </span>
          )}
        </div>

        {/* Second row: Badge + Message preview */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Prospect badge - outline style */}
          {c.prospect && (
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600/50 px-1.5 py-0.5 rounded shrink-0">
              PROSPECTO
            </span>
          )}
          {/* Message preview - show robot icon for automated messages */}
          {(() => {
            const preview = formatMessagePreview(c.lastMessageBody, c.lastMessageBody?.startsWith('Template:'))
            return (
              <p className="text-xs truncate text-slate-500 dark:text-slate-400 flex-1 min-w-0 items-center gap-1">
                {preview.isAutomated && (
                  <span className="inline-flex items-center text-slate-400" title="Mensaje automático">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </span>
                )}
                {c.lastMessageDir === 'outbound' && (
                  <span className={`inline-flex items-center mr-0.5 ${
                    getMessageStatusDisplay(c).color
                  }`}>
                    {getMessageStatusDisplay(c).icon === 'read' ? (
                      // Double check blue (read)
                      <svg className="w-4 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : getMessageStatusDisplay(c).icon === 'delivered' ? (
                      // Double check gray (delivered)
                      <svg className="w-4 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      // Single check (sent) or failed
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                )}
                <span className={c.lastMessageDir === 'outbound' ? 'italic opacity-70' : ''}>
                  {preview.text}
                </span>
              </p>
            )
          })()}
        </div>
      </div>
    </Button>
  )
}

