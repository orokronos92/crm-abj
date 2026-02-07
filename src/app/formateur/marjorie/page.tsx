/**
 * Chat avec Marjorie IA - Interface Formateur
 * Assistant intelligent pour les formateurs
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Send,
  Sparkles,
  Mic,
  Paperclip,
  Settings,
  User,
  Bot,
  Copy,
  RefreshCw,
  Zap,
  Brain,
  Users as UsersIcon,
  Calendar,
  FileText,
  Award,
  ChevronDown,
} from 'lucide-react'

// Messages mockés adaptés au formateur
const MOCK_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: 'Bonjour ! Je suis Marjorie, votre assistante IA. Je peux vous aider avec vos élèves, votre planning, vos évaluations et vos disponibilités. Comment puis-je vous aider ?',
    timestamp: '09:00',
  },
  {
    id: 2,
    role: 'user',
    content: 'Peux-tu me donner un résumé de mes prochaines sessions cette semaine ?',
    timestamp: '09:02',
  },
  {
    id: 3,
    role: 'assistant',
    content: `Voici vos prochaines sessions cette semaine :

📅 **5 sessions planifiées**

**Lundi 12/02 :**
• 09h-12h : CAP Bijouterie (12 élèves) - Atelier principal
• 14h-17h : Sertissage Niveau 1 (8 élèves) - Atelier B

**Mercredi 14/02 :**
• 09h-17h : CAP Bijouterie (12 élèves) - Atelier principal

**Vendredi 16/02 :**
• 09h-12h : Perfectionnement Sertissage (6 élèves) - Atelier B
• 14h-16h : Évaluation pratique CAP (5 élèves) - Atelier principal

⚠️ **Point d'attention :** 3 élèves en CAP ont des absences à surveiller.

Souhaitez-vous que je vous prépare les listes d'émargement ou que je vérifie les présences ?`,
    timestamp: '09:03',
    suggestions: ['Listes d\'émargement', 'Voir absences', 'Mes évaluations'],
  },
]

const QUICK_ACTIONS = [
  { icon: UsersIcon, label: 'Voir mes élèves', prompt: 'Donne-moi la liste de mes élèves actuels' },
  { icon: Calendar, label: 'Mon planning', prompt: 'Affiche mon planning de la semaine' },
  { icon: Award, label: 'Saisir des notes', prompt: 'Je veux saisir des notes pour' },
  { icon: FileText, label: 'Générer attestation', prompt: 'Génère une attestation de présence pour' },
]

export default function MarjorieFormateurPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    // Ajouter le message utilisateur
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...messages, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simuler la réponse de Marjorie
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Je traite votre demande... Dans une vraie implémentation, je communiquerais avec les webhooks n8n pour accéder à vos données de formateur et exécuter vos actions.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
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
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">• Assistant formateur</span>
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
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Demandez-moi n'importe quoi sur vos élèves, sessions, évaluations..."
                  className="w-full px-4 py-3 pr-12 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)]"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Mic className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
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

          {/* Capacités de Marjorie pour formateurs */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-[rgb(var(--accent))]" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Capacités</h3>
            </div>
            <div className="space-y-3 text-sm text-[rgb(var(--muted-foreground))]">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Consultation planning et sessions</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Gestion des disponibilités</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Suivi des élèves et présences</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Saisie et consultation des notes</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5 flex-shrink-0" />
                <span>Génération d'attestations</span>
              </div>
            </div>
          </div>

          {/* Statistiques d'utilisation */}
          <div className="bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Cette semaine</h3>
              <ChevronDown className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">5</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Sessions planifiées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">18</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Élèves actifs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">12</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Évaluations saisies</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">92%</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Taux présence moyen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
