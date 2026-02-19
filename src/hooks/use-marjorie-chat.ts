/**
 * Hook React pour gérer le chat avec Marjorie IA
 * Gère l'envoi de messages, l'historique et l'état du chat
 */

'use client'

import { useState, useCallback } from 'react'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: string[]
}

interface UseMarjorieChatReturn {
  messages: ChatMessage[]
  isTyping: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearHistory: () => void
}

export function useMarjorieChat(initialMessages: ChatMessage[] = []): UseMarjorieChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    setError(null)
    setIsTyping(true)

    // 1. Ajouter le message utilisateur immédiatement
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // 2. Envoyer au backend
      const response = await fetch('/api/marjorie/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la communication avec Marjorie')
      }

      const data = await response.json()

      // 3. Ajouter la réponse de Marjorie
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions,
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('Erreur envoi message Marjorie:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')

      // Message d'erreur dans le chat
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '❌ Désolée, je rencontre une difficulté technique. Veuillez réessayer dans quelques instants.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMessage])

    } finally {
      setIsTyping(false)
    }
  }, [messages])

  const clearHistory = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearHistory,
  }
}
