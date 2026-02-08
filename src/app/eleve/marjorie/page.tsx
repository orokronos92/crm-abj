/**
 * Chat Marjorie - Interface Élève
 * Assistant IA pour les élèves
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Send,
  Sparkles,
  Calendar,
  Award,
  FileText,
  MessageSquare,
  User,
  Bot,
} from 'lucide-react'

// Messages mockés pour l'élève
const MOCK_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: 'Bonjour ! 👋 Je suis Marjorie, votre assistante personnelle.\n\nJe peux vous aider avec vos cours, vos notes, vos documents et votre planning.',
    timestamp: '10:30',
    suggestions: ['Mon planning', 'Mes notes', 'Mes documents'],
  },
  {
    id: 2,
    role: 'assistant',
    content: `📚 **Votre formation actuelle**

**CAP Bijouterie-Joaillerie** - Session Mars 2024

✅ Progression : **65%**
📊 Moyenne générale : **15.5/20**
📅 Prochain cours : **Lundi 12/02 - 09h00** (Soudure avec M. Durand)

💡 Vous progressez bien ! Continuez comme ça !`,
    timestamp: '10:31',
    suggestions: ['Voir mon planning détaillé', 'Mes dernières notes', 'Demander une attestation'],
  },
]

// Actions rapides pour l'élève
const QUICK_ACTIONS = [
  { icon: Calendar, label: 'Mon planning', prompt: 'Affiche mon planning de la semaine' },
  { icon: Award, label: 'Mes notes', prompt: 'Montre-moi mes dernières notes' },
  { icon: FileText, label: 'Mes documents', prompt: 'Liste mes documents disponibles' },
  { icon: MessageSquare, label: 'Attestation', prompt: 'Je voudrais demander une attestation de présence' },
]

export default function EleveMarjoriePage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!inputValue.trim()) return

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simuler une réponse après 1 seconde
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Je traite votre demande...\n\n*Cette fonctionnalité sera bientôt disponible.*',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Mon planning', 'Mes notes', 'Mes documents'],
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-6 p-6 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-1">
                Chat Marjorie
              </h1>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Votre assistante personnelle pour vos cours, notes et documents
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.2)] rounded-full">
              <div className="w-2 h-2 rounded-full bg-[rgb(var(--success))] animate-pulse" />
              <span className="text-xs font-medium text-[rgb(var(--success))]">En ligne</span>
            </div>
          </div>
        </div>

        {/* Stats semaine */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Progression</p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">65%</p>
          </div>
          <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Moyenne</p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">15.5/20</p>
          </div>
          <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Présence</p>
            <p className="text-2xl font-bold text-[rgb(var(--info))]">92%</p>
          </div>
          <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Cours suivis</p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">8/12</p>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))]'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-[rgb(var(--primary))]" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'assistant'
                      ? 'bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]'
                      : 'bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))]'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'assistant' ? 'text-[rgb(var(--muted-foreground))]' : 'opacity-70'
                    }`}>
                      {message.timestamp}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.role === 'assistant' && message.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(suggestion)}
                          className="px-3 py-1.5 text-xs bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-full border border-[rgba(var(--accent),0.2)] hover:bg-[rgba(var(--accent),0.2)] transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[rgb(var(--primary))]" />
                </div>
                <div className="p-4 rounded-2xl bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
            {/* Actions rapides */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors whitespace-nowrap text-sm"
                  >
                    <Icon className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <span className="text-[rgb(var(--foreground))]">{action.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question à Marjorie..."
                className="flex-1 px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Capacités Marjorie */}
        <div className="mt-6 p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-xl">
          <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            💡 Ce que Marjorie peut faire pour vous :
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-[rgb(var(--muted-foreground))]">
            <div>• Consulter votre planning</div>
            <div>• Voir vos notes</div>
            <div>• Accéder à vos documents</div>
            <div>• Demander des attestations</div>
            <div>• Répondre à vos questions</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
