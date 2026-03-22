import { Conversation, FirestoreTimestamp } from '../services/api'
import { Button } from './ui/Button'

const formatTimestamp = (ts?: string | FirestoreTimestamp) => {
  if (!ts) return ''
  if (typeof ts === 'string') {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (isFirestoreTimestamp(ts)) {
    return new Date(ts._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return ''
}

function isFirestoreTimestamp(ts: any): ts is FirestoreTimestamp {
  return ts && typeof ts._seconds === 'number'
}

// Helper to format message preview - clean up technical template names
const formatMessagePreview = (body?: string, isTemplate?: boolean): string => {
  if (!body) return 'Sin mensajes';
  
  // If it's a template, show a friendly name
  if (isTemplate || body.startsWith('Template:')) {
    // Extract the template name and make it friendly
    const templateName = body.replace('Template:', '').replace(/_/g, ' ').trim();
    // Map common templates to friendly names
    const friendlyNames: Record<string, string> = {
      'subscription_cutoff': '📋 Aviso de corte',
      'subscription_welcome': '👋 Bienvenida',
      'subscription_renewed': '✅ Renovación',
      'subscription_payment': '💳 Recordatorio de pago',
      'subscription_reminder': '⏰ Recordatorio',
    };
    
    const lowerName = templateName.toLowerCase();
    for (const [key, friendly] of Object.entries(friendlyNames)) {
      if (lowerName.includes(key)) return friendly;
    }
    return `📋 ${templateName}`;
  }
  
  // Truncate long messages
  if (body.length > 40) {
    return body.substring(0, 40) + '...';
  }
  return body;
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
        group w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm

        ${selected
          ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
        }
      `}
      variant="ghost"
    >
      {/* Avatar */}
      <div
        className={`
          h-11 w-11 rounded-full flex items-center justify-center font-semibold text-sm ring-2 shadow-sm shrink-0 transition-colors

          ${selected
            ? 'bg-primary/20 text-primary/foreground ring-primary/20'
            : 'bg-primary/20 dark:bg-primary/30 text-slate-700 dark:text-slate-200 ring-primary dark:ring-slate-700 group-hover:bg-primary/30 group-hover:text-primary'
          }
        `}
      >
        {(c.name || c.phone || '?').charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header - improved layout with proper spacing */}
        <div className="flex justify-between items-start gap-2">
          {/* Left side: Name */}
          <span
            className={`
              font-bold text-sm truncate transition-colors flex-1 min-w-0
              ${selected
                ? 'text-primary dark:text-secondary'
                : 'text-slate-900 dark:text-slate-100 group-hover:text-primary'
              }
            `}
          >
            {c.name || c.phone || 'Usuario Desconocido'}
          </span>

          {/* Right side: Time */}
          {c.lastMessageAt && (
            <span
              className={`
                text-[10px] shrink-0 transition-colors opacity-60
                ${selected
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }
              `}
            >
              {formatTimestamp(c.lastMessageAt)}
            </span>
          )}
        </div>

        {/* Second row: Badge + Message preview + Unread */}
        <div className="flex justify-between items-center gap-2 mt-0.5">
          {/* Prospect badge */}
          {c.prospect && (
            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">
              Prospecto
            </span>
          )}
          {/* Message preview fills remaining space */}
          <p className="text-xs truncate font-medium text-slate-500 dark:text-slate-400 flex-1">
            {c.lastMessageDir === 'outbound' && <span className="font-bold mr-1 opacity-70">Tú:</span>}
            {formatMessagePreview(c.lastMessageBody, c.lastMessageBody?.startsWith('Template:'))}
          </p>
          {/* Unread badge */}
          {!!c.unreadCount && (
            <span className="min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
              {c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Button>
  )
}

