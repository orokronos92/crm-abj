'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, X, Trash2 } from 'lucide-react'
import { useMarjorieChat } from '@/hooks/use-marjorie-chat'

interface MarjorieChatBannerProps {
  onClose: () => void
}

const MESSAGE_BIENVENUE = 'Bonjour ! Je suis Marjorie, votre assistante IA. Comment puis-je vous aider ? (envoi de devis, relance candidat, génération de documents, questions sur le CRM…)'

export function MarjorieChatBanner({ onClose }: MarjorieChatBannerProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, isTyping, sendMessage, clearHistory } = useMarjorieChat([
    {
      id: 0,
      role: 'assistant',
      content: MESSAGE_BIENVENUE,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus sur le textarea à l'ouverture
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return
    setInput('')
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className="bg-[rgb(var(--card))] border-t-2 border-[rgb(var(--accent))] shadow-2xl">
        <div className="max-w-5xl mx-auto flex flex-col" style={{ height: '420px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(var(--border),0.3)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[rgb(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] leading-none">Marjorie</h3>
                <p className="text-xs text-[rgb(var(--success))] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--success))] inline-block" />
                  En ligne
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                title="Effacer la conversation"
                className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </div>
          </div>

          {/* Zone messages scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar Marjorie */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[rgb(var(--primary))]" />
                  </div>
                )}

                {/* Bulle */}
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-br-sm'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-bl-sm border border-[rgba(var(--border),0.3)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-[rgba(var(--primary),0.7)] text-right' : 'text-[rgb(var(--muted-foreground))]'}`}>
                    {msg.timestamp}
                  </p>
                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-2 py-1 bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] rounded-full hover:bg-[rgba(var(--accent),0.25)] transition-colors border border-[rgba(var(--accent),0.2)]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicateur typing */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[rgb(var(--primary))]" />
                </div>
                <div className="px-4 py-3 bg-[rgb(var(--secondary))] rounded-2xl rounded-bl-sm border border-[rgba(var(--border),0.3)]">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone input */}
          <div className="px-4 py-3 border-t border-[rgba(var(--border),0.3)] flex-shrink-0">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question à Marjorie… (Entrée pour envoyer, Shift+Entrée pour aller à la ligne)"
                rows={2}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-xl text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] resize-none text-sm disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-5 py-2.5 h-[58px] bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
