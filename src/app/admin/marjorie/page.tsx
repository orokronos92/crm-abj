/**
 * Chat avec Marjorie IA
 * Interface de chat avec l'assistant intelligent
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Send,
  Sparkles,
  Mic,
  Paperclip,
  User,
  Bot,
  FileText,
  Copy,
  RefreshCw,
  Settings,
  Zap,
  Brain,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { useMarjorieChat } from '@/hooks/use-marjorie-chat'

// Message de bienvenue initial
const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant' as const,
  content: 'Bonjour ! Je suis Marjorie, votre assistante IA pour le CRM ABJ. Comment puis-je vous aider aujourd\'hui ?',
  timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
}

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Générer un devis', prompt: 'Génère un devis pour' },
  { icon: User, label: 'Nouveau prospect', prompt: 'Crée un nouveau prospect' },
  { icon: MessageSquare, label: 'Email de relance', prompt: 'Rédige un email de relance pour' },
  { icon: Brain, label: 'Analyse candidat', prompt: 'Analyse le profil du candidat' },
]

export default function MarjoriePage() {
  const { messages, isTyping, sendMessage } = useMarjorieChat([INITIAL_MESSAGE])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const messageToSend = inputMessage
    setInputMessage('') // Vider immédiatement pour meilleure UX

    await sendMessage(messageToSend)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] gap-6">
        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden">
          {/* Header du chat */}
          <div className="p-4 border-b border-[rgba(var(--border),0.3)] bg-gradient-to-r from-[rgb(var(--card))] to-[rgba(var(--accent),0.05)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center animate-pulse-gold">
                  <Sparkles className="w-7 h-7 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                    Marjorie IA
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(var(--success))] rounded-full animate-pulse" />
                    <span className="text-sm text-[rgb(var(--success))]">En ligne</span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">• Assistant intelligent ABJ</span>
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                <Settings className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </div>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''} animate-fadeIn`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-[rgb(var(--primary))]" />
                  </div>
                )}

                <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-4 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))]'
                        : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-2 px-1">
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      {message.timestamp}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <Copy className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                        </button>
                        <button className="p-1 rounded hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <RefreshCw className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggestions de réponses */}
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputMessage(suggestion)}
                          className="px-3 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] rounded-lg text-sm text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.2)] transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[rgb(var(--primary))]" />
                </div>
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-[rgba(var(--border),0.3)]">
            <div className="flex gap-3">
              <button className="p-3 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                <Paperclip className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Demandez-moi n'importe quoi..."
                  disabled={isTyping}
                  className="w-full px-4 py-3 pr-12 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)] disabled:opacity-50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Mic className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Panneau latéral - Actions rapides */}
        <div className="w-80 space-y-4">
          {/* Actions rapides */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[rgb(var(--accent))]" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Actions rapides</h3>
            </div>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(action.prompt)}
                    className="w-full p-3 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors flex items-center gap-3 text-left"
                  >
                    <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Capacités de Marjorie */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-[rgb(var(--accent))]" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Capacités</h3>
            </div>
            <div className="space-y-3 text-sm text-[rgb(var(--muted-foreground))]">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Création et modification de prospects/candidats</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Génération de devis et documents</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Rédaction d'emails personnalisés</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Analyse de profils et recommandations</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Statistiques et rapports</span>
              </div>
            </div>
          </div>

          {/* Statistiques d'utilisation */}
          <div className="bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Aujourd'hui</h3>
              <ChevronDown className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">42</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Actions réalisées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">8</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Documents générés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">15</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Emails envoyés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">98%</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Taux de succès</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}