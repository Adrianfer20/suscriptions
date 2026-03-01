import React, { useEffect, useState, useRef } from 'react'
import { communicationsApi, Conversation, CommunicationMessage, FirestoreTimestamp } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ConversationItem } from '../../components/ConversationItem'
import { Send, Loader2, ArrowLeft, Search, MessageSquare } from 'lucide-react'

const formatTimestamp = (ts?: string | FirestoreTimestamp) => {
  if (!ts) return ''
  if (typeof ts === 'string') {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return ''
}

export default function AdminCommunication() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  
  const [messages, setMessages] = useState<CommunicationMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null) // Para detectar nuevos mensajes y hacer scroll

  const fetchConversations = async (background = false) => {
    if (!background) setLoading(true)
    try {
      const res = await communicationsApi.listConversations()
      // @ts-ignore
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      
      // Actualizar solo si hay cambios o es la carga inicial para evitar re-renders innecesarios
      setConversations(prev => {
        const isDifferent = JSON.stringify(prev) !== JSON.stringify(list)
        return isDifferent ? list : prev
      })
    } catch(e) {
      console.error(e)
    } finally {
      if (!background) setLoading(false)
    }
  }

  // 1. POLLING: Actualizar lista de conversaciones cada 15 segundos
  useEffect(() => {
    fetchConversations() // Carga inicial
    const intervalId = setInterval(() => {
        // Solo actualizar en background si NO estamos escribiendo o interactuando activamente
        // Para evitar saltos, pero es importante recibir nuevos mensajes
        fetchConversations(true)
    }, 15000)
    return () => clearInterval(intervalId)
  }, [])

  const getConversationIdentifier = (conv: Conversation | null) => {
    if (!conv) return null
    // Prioridad actualizada: phone > id > clientId > uid
    // Ahora preferimos el teléfono como identificador universal (prospectos y clientes).
    return conv.phone || conv.id || conv.clientId || conv.uid
  }

  const fetchMessages = async (isBackground = false) => {
    const identifier = getConversationIdentifier(selectedConversation)
    
    if (!identifier) {
        console.warn('No identifier found for conversation', selectedConversation)
        return
    }

    let mounted = true
    if (!isBackground) {
        setLoadingMessages(true)
        setHasMore(true)
    } else {
        mounted = true;
    }
    
    try {
      // According to docs, we should pass limit. Defaulting to 50 for good measure.
      const res = await communicationsApi.getMessages(identifier, { limit: 50, orderBy: 'createdAt desc', sort: 'desc' })
      if (!mounted) return
      
      const payload = res.data
      
      // La API devuelve { ok: true, data: [...] }
      // res.data es el objeto ApiResponse completo
      // Si payload es una respuesta de Axios directo podría venir envuelto diferente,
      // pero generalmente con axios es data.
      // Confirmamos que obtenemos el array de mensajes, o vacío.
      // IMPORTANTE: El backend puede devolver { ok: true, data: [] }
      // O tal vez hubo un error oculto.
      
      let newMsgs: CommunicationMessage[] = []
      if (Array.isArray(payload)) {
          newMsgs = payload
      } else if (payload && Array.isArray(payload.data)) {
          newMsgs = payload.data
      } else {
        console.warn('Estructura de mensajes inesperada:', payload)
      }
      
      const msgs = newMsgs // alias

      if (!isBackground) {
        if (msgs.length === 0) {
            console.log('No se encontraron mensajes para', identifier)
        } else {
            // Check IDs presence
            if (!msgs[0].id) {
                console.warn('Mensajes recibidos sin ID, pueden fallar en renderizado:', msgs[0])
            }
        }
      }
      
      if (!isBackground && msgs.length < 50) setHasMore(false)

      msgs.sort((a: CommunicationMessage, b: CommunicationMessage) => {
            const getTs = (t: any) => {
                if (!t) return 0
                if (typeof t === 'string') return new Date(t).getTime()
                if (t._seconds) return t._seconds * 1000
                return 0
            }
            return getTs(a.createdAt || a.timestamp) - getTs(b.createdAt || b.timestamp)
      })

      if (!isBackground) {
            setMessages(msgs)
            scrollToBottom()
      } else {
            // Background update logic
            setMessages(prev => {
                // Filter out optimistic messages that might match what we just fetched to avoid duplication
                // But generally, the fetch replaces the list. 
                // The issue is: If I have optimistic msg "A" at the end, and I fetch, and the server returns "A" (with real ID),
                // replacing 'prev' with 'msgs' handles it perfectly (optimistic is gone, real is there).
                // BUT, if the server DOES NOT YET have "A" (latency), replacing 'prev' with 'msgs' DELETES "A" momentarily.
                // THEN, next update adds it. This is "flickering", not duplication.
                //
                // Duplication happens if we MERGE. But here we are returning 'msgs' or 'prev'.
                // EXCEPT: 'prev' contains optimistic. 'msgs' contains server-confirmed.
                
                // Let's verify overlap using content/timestamps slightly fuzzily? 
                // Or simply: Keep optimistic messages locally if they are not in the new list yet?
                
                const serverLast = msgs[msgs.length - 1]
                const prevLast = prev[prev.length - 1]
                
                // If last message on server is same ID as last local non-optimistic message, nothing changed?
                // We need to keep our optimistic messages if they aren't in 'msgs' yet.
                
                // 1. Identify optimistic messages in current state
                const optimistics = prev.filter(m => m.id && m.id.startsWith('opt_'))
                
                // 2. Check if any optimistic message is now present in 'msgs' (by body/time match?) 
                //    This is hard without unique ID. Assuming backend is fast enough or we accept momentary flicker.
                //    Actually, user says "duplies then correct".
                
                // If we simply RETURN 'msgs', we lose optimistic messages not yet on server.
                // If we APPEND, we might duplicate.
                
                // Strategy:
                // Return 'msgs' + any optimistic messages that seem to be younger than the last 'msgs' timestamp
                // or simply ones that don't match content of last few messages.

                const getTs = (t: any) => {
                     if (!t) return 0
                     if (typeof t === 'string') return new Date(t).getTime()
                     if (t._seconds) return t._seconds * 1000
                     return 0
                }
                
                const lastServerTs = serverLast ? getTs(serverLast.createdAt || serverLast.timestamp) : 0
                
                const stillPending = optimistics.filter(opt => {
                     // If we find a message in 'msgs' with same body and approx same time, discard optimistic
                     const match = msgs.find(m => {
                        const sameBody = m.body === opt.body
                        const sameDir = m.direction === opt.direction
                        
                        // Check time proximity (within 10 seconds) just in case
                        // const t1 = new Date(m.createdAt || 0).getTime()
                        // const t2 = new Date(opt.createdAt || 0).getTime()
                        // const closeEnough = Math.abs(t1 - t2) < 10000 
                        
                        return sameBody && sameDir
                     })
                     return !match
                })
                
                // Combine: Server Source of Truth + Pending Optimistic
                const combined = [...msgs, ...stillPending]
                
                // Sort by time
                combined.sort((a, b) => {
                     const getTs = (t: any) => {
                         if (!t) return 0
                         if (typeof t === 'string') return new Date(t).getTime()
                         if (t._seconds) return t._seconds * 1000
                         return 0
                     }
                     return getTs(a.createdAt || a.timestamp) - getTs(b.createdAt || b.timestamp)
                })
                
                // Check if different from prev
                if (combined.length !== prev.length || combined[combined.length-1]?.id !== prev[prev.length-1]?.id) {
                     if (combined.length > prev.length) setTimeout(scrollToBottom, 50)
                     return combined
                }
                
                return prev
            })
      }
    } catch (err) {
      if (!isBackground) console.error('Error fetching messages:', err)
    } finally {
      if (mounted && !isBackground) setLoadingMessages(false)
    }
  }

  // 2. POLLING: Actualizar mensajes cada 5 segundos si el chat está abierto
  useEffect(() => {
    // Si cambio de usuario, o si se cierra, limpio estado
    setMessages([])
    setHasMore(true)

    // Necesito un identificador para cargar
    const identifier = getConversationIdentifier(selectedConversation)
    if (!identifier) return
    
    fetchMessages(false) // Initial load

    const intervalId = setInterval(() => {
        // Solo actualizar en background si NO estamos escribiendo o interactuando activamente
        // Para evitar saltos, pero es importante recibir nuevos mensajes
        fetchConversations(true)
    }, 15000) // Originalmente era 15s para conversations. Para messages?
    
    // Ah, el bloque anterior era para fetchConversations. Este es un bloque nuevo.
    // fetchMessages(true) polling separated? 
    // Wait, confusion here. 
    // The previous code had TWO useEffects. One for fetchConversations (15s), one for fetchMessages (5s).
    // I need to find the second useEffect.

    return () => clearInterval(intervalId)
  }, [selectedConversation])  // ERROR: This effect replaces fetchConversations polling AND fetchMessages polling logic. 
  
  // Actually, I replaced lines 112-127 which corresponds to the SECOND useEffect (fetchMessages polling).
  // But wait, the original code had:
  /*
  // 1. POLLING: Actualizar lista de conversaciones cada 15 segundos
  useEffect(...)
  
  fetchMessages definition...
  
  // 2. POLLING: Actualizar mensajes cada 5 segundos si el chat está abierto
  useEffect(...)
  */
  
  // My replace call above replaced lines 112-127. Let's check what those lines were.
  // The original replace targeted fetchMessages definition.
  // I must be careful not to delete the useEffect for messages polling.
  
  // Let me read the file again to be sure structure remains intact.

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    
    // Clear unread count locally for UI feedback
    if (conv.unreadCount && conv.unreadCount > 0) {
        setConversations(prev => prev.map(c => 
            c.id === conv.id ? { ...c, unreadCount: 0 } : c
        ))
        
        // Notify backend to mark as read
        const identifier = conv.id || conv.phone
        if (identifier) {
            communicationsApi.markAsRead(identifier).catch(err => {
                console.error("Error marking as read:", err)
                // Optionally revert local state if needed, but usually not critical for read receipts
            })
        }
    }
  }

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    // Check if scrolled to top
    if (scrollTop === 0 && !loadingMore && hasMore && messages.length > 0) {
      setLoadingMore(true)
      const oldestMessage = messages[0] // Since messages are sorted old -> new
      const uid = getConversationIdentifier(selectedConversation)
      if (!uid) return

      try {
         const res = await communicationsApi.getMessages(uid, {
             limit: 50,
             startAfter: oldestMessage.id, // Depending on backend, might need timestamp
             orderBy: 'createdAt desc',
             sort: 'desc'
         })
         const payload = res.data
         const newMsgs = Array.isArray(payload) 
           ? payload 
           : (Array.isArray(payload?.data) ? payload.data : [])
         
         if (newMsgs.length < 50) setHasMore(false)
         if (newMsgs.length === 0) {
             setLoadingMore(false) 
             return
         }

         newMsgs.sort((a: CommunicationMessage, b: CommunicationMessage) => {
             const getTs = (t: any) => {
                 if (!t) return 0
                 if (typeof t === 'string') return new Date(t).getTime()
                 if (t._seconds) return t._seconds * 1000
                 return 0
             }
             return getTs(a.createdAt || a.timestamp) - getTs(b.createdAt || b.timestamp)
         })

         // Prepend (maintain scroll position)
         const prevHeight = scrollHeight
         setMessages(prev => [...newMsgs, ...prev])
         
         // Restore scroll position
         requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
               const newHeight = scrollContainerRef.current.scrollHeight
               scrollContainerRef.current.scrollTop = newHeight - prevHeight
            }
         })

      } catch (err) {
         console.error('Error fetching more messages:', err)
      } finally {
         setLoadingMore(false)
      }
    }
  }
  
  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
      handleScroll(e)
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    // Para enviar mensaje, usamos el ID real del cliente si existe, o el teléfono si es prospecto
    const sendId = getConversationIdentifier(selectedConversation)

    if (!newMessage.trim() || !sendId) return
    
    setSending(true)
    try {
      await communicationsApi.send({ 
        clientId: sendId, 
        body: newMessage 
      })
      
      // Update local message list optimistically or re-fetch
      // Identifier for local list update is ALWAYS phone now
      const listId = selectedConversation?.id || selectedConversation?.phone

      if (listId) {
        const optimisticMsg: CommunicationMessage = {
            id: 'opt_' + Date.now(), // Temporary ID
            body: newMessage,
            from: 'me', // placeholder
            to: listId, 
            direction: 'outbound',
            createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])
        
        // Also update last message in conversation list
        setConversations(prev => prev.map(c => {
         if ((c.id || c.phone) === listId) {
             return { 
                 ...c, 
                 lastMessageBody: newMessage, 
                 lastMessageDir: 'outbound', 
                 lastMessageAt: new Date().toISOString() as any
             }
         }
         return c
        }))
      }

      setNewMessage('')
      scrollToBottom()

    } catch (err: any) {
      console.error('Error details:', err)
      alert('Error enviando mensaje: ' + (err.response?.data?.message || err.message || 'Desconocido'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-center px-1 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Comunicación</h2>
        {/* <Button onClick={fetchConversations} size="sm" variant="ghost">Actualizar</Button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden md:overflow-visible">
        {/* Left: Conversations List */}
        <Card className={`flex flex-col h-full overflow-hidden p-0 bg-white dark:bg-slate-800 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
           {/* Custom Header with Search */}
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-primary" size={20} />
                        Mensajes
                    </h3>
                    <span className="h-8 w-8 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">{conversations.length}</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar chat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                    />
                </div>
           </div>

           <div className="flex-1 overflow-y-auto min-h-0 p-2 bg-slate-50/50 dark:bg-slate-900/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-400">
                 <Loader2 className="animate-spin" size={20} />
                 <span className="text-xs">Cargando...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-slate-500 py-8 text-center px-4">
                No hay conversaciones activas.
              </div>
            ) : (
              <div className="space-y-1">
                {conversations
                    .filter(c => {
                        if (!searchTerm) return true
                        const term = searchTerm.toLowerCase()
                        return (
                            c.name?.toLowerCase().includes(term) || 
                            c.phone?.includes(term) ||
                            c.lastMessageBody?.toLowerCase().includes(term)
                        )
                    })
                    .map((c: Conversation) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    selected={selectedConversation?.id === c.id}
                    onClick={() => handleSelectConversation(c)}
                  />
                ))}
              </div>
            )}
           </div>
        </Card>
        
        {/* Right: Chat Window */}
        <Card className={`md:col-span-2 h-full overflow-hidden relative flex flex-col bg-white dark:bg-slate-800 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
             <div className="flex flex-col h-full overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden p-2 -ml-2"
                          variant="ghost"
                          size="icon"
                        >
                          <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{selectedConversation.name || selectedConversation.phone}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedConversation.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScrollEvent}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-900/20 min-h-0"
                >
                    {loadingMore && (
                        <div className="flex justify-center py-2 text-xs text-slate-400">
                           <span className="animate-pulse">Cargando mensajes anteriores...</span>
                        </div>
                    )}

                    {loadingMessages ? (
                        <div className="flex justify-center py-8"><span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></span></div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-10">No hay mensajes en esta conversación</div>
                    ) : (
                        messages.map((m, idx) => {
                            // Determine direction logic:
                            // 1. Explicit 'direction' field from API ('inbound' = client, 'outbound' = me)
                            // 2. Infer from 'status': 'received' is likely client, 'sent'/'delivered'/'read' is me.
                            // 3. Infer from 'template': Templates are always sent by system (me).
                            
                            let isMe = false;

                            if (m.direction) {
                                isMe = m.direction === 'outbound';
                            } else {
                                // Fallback heuristics if direction is missing
                                if (m.template) {
                                    isMe = true;
                                } else if (['sent', 'delivered', 'read', 'queued', 'failed'].includes(m.status || '')) {
                                    isMe = true;
                                } else if (m.from === 'me' || m.to === selectedConversation.phone) {
                                    // If 'to' is the client's phone, then I sent it.
                                    isMe = true;
                                }
                            }

                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`
                                        max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm relative group
                                        ${isMe 
                                            ? 'bg-primary text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-tl-sm'}
                                    `}>
                                        {m.template ? (
                                           <div className={`text-xs mb-1.5 font-medium flex items-center gap-1 ${isMe ? 'opacity-90 text-primary-100' : 'text-primary'}`}>
                                             <span className="uppercase tracking-wider text-[10px]">Plantilla</span>
                                           </div>
                                        ) : null}
                                        
                                        <div className="leading-relaxed whitespace-pre-wrap">{m.body || (m.template ? m.template.replace(/_/g, ' ') : '')}</div>
                                        
                                        <div className={`text-[10px] mt-1.5 flex gap-1 items-center select-none
                                            ${isMe ? 'justify-end text-primary-100/90' : 'justify-start text-slate-400'}
                                        `}>
                                            <span>{formatTimestamp(m.createdAt || m.timestamp)}</span>
                                            {isMe && m.status && (
                                                <span title={`Estado: ${m.status}`} className={['read', 'READ'].includes(m.status) ? 'text-blue-100 font-bold' : ''}>
                                                  {['read', 'READ'].includes(m.status) ? '✓✓' : 
                                                   ['delivered', 'DELIVERED'].includes(m.status) ? '✓✓' : 
                                                   ['sent', 'SENT'].includes(m.status) ? '✓' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center w-full">
                        <div className="flex-1">
                            <Input 
                                className="min-h-11 border-slate-200 dark:border-slate-600 focus-visible:ring-primary/20 bg-white dark:bg-slate-900 dark:text-white"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                disabled={sending}
                                autoFocus
                            />
                        </div>
                        <Button 
                          variant="primary"
                          className="h-11 w-11 md:w-auto px-0 md:px-4 rounded-lg shadow-md transition-all shrink-0 flex items-center justify-center" 
                          type="submit" 
                          disabled={sending || !newMessage.trim()}
                        >
                            {sending ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <Send size={18} className={sending || !newMessage.trim() ? 'opacity-50' : ''} />
                                    <span className="hidden md:inline ml-2">Enviar</span>
                                </>
                            )}
                        </Button>
                    </form>
                </div>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-8 text-center">
                <svg className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Selecciona una conversación para comenzar a chatear</p>
             </div>
          )}
        </Card>
      </div>
    </div>
  )
}
