import { Conversation, FirestoreTimestamp } from '../api'

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

interface ConversationItemProps {
  conversation: Conversation
  selected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation: c, selected, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm

        ${selected
          ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
        }
      `}
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
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <span
              className={`
                font-semibold text-sm truncate transition-colors
                ${selected
                  ? 'text-primary'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-primary'
                }
              `}
            >
              {c.name || c.phone || 'Usuario Desconocido'}
            </span>
            {c.prospect && (
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">
                Prospecto
              </span>
            )}
          </div>

          {c.lastMessageAt && (
            <span
              className={`
                text-[10px] font-medium shrink-0 transition-colors
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

        {/* Last message */}
        <div className="flex justify-between items-center">
          <p
            className={`
              text-xs truncate max-w-[85%] font-medium transition-colors
              ${selected
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }
            `}
          >
            {c.lastMessageDir === 'outbound' && (
              <span className="font-bold mr-1 opacity-70">Tú:</span>
            )}
            {c.lastMessageBody || 'Sin mensajes'}
          </p>

          {!!c.unreadCount && (
            <span className="
              min-w-5 h-5 px-1 ml-2 flex items-center justify-center rounded-full
              bg-primary text-white text-[10px] font-bold shadow-sm border border-white dark:border-slate-800
            ">
              {c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

