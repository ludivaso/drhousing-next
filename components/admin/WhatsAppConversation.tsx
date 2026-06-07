'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Message = {
  id: string
  lead_id: string
  direction: 'inbound' | 'outbound'
  message_text: string
  created_at: string
}

export default function WhatsAppConversation({
  leadId,
  leadPhone,
}: {
  leadId: string
  leadPhone: string | null
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true })
    if (!error && data) setMessages(data as Message[])
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('wa-messages-' + leadId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: 'lead_id=eq.' + leadId },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages, leadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!leadPhone || !inputValue.trim() || sending) return
    setSending(true)
    setSendError(null)
    const text = inputValue.trim()
    const { data, error } = await supabase.functions.invoke('send-whatsapp-reply', {
      body: { lead_id: leadId, to_phone: leadPhone, message_text: text },
    })
    setSending(false)
    if (error) {
      setSendError(error.message ?? 'Error al enviar')
      return
    }
    if (data?.ok === false) {
      setSendError(data.error ?? 'Error al enviar')
      return
    }
    setInputValue('')
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        lead_id: leadId,
        direction: 'outbound',
        message_text: text,
        created_at: new Date().toISOString(),
      },
    ])
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })

  if (!leadPhone) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin teléfono — no se puede enviar WhatsApp
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Message list */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay mensajes aún</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] gap-0.5 ${
                msg.direction === 'outbound' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.direction === 'outbound'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm'
                }`}
              >
                {msg.message_text}
              </div>
              <span className="text-xs text-muted-foreground">{fmtTime(msg.created_at)}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && <p className="text-xs text-destructive">{sendError}</p>}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder="Escribir mensaje..."
          disabled={sending}
          className="flex-1 px-3 py-1.5 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={sending || !inputValue.trim()}
          className="px-3 py-1.5 rounded bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {sending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Send className="w-3.5 h-3.5" />}
          Enviar
        </button>
      </div>
    </div>
  )
}
