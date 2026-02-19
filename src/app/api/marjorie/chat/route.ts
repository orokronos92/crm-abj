/**
 * Endpoint API pour le chat avec Marjorie IA
 * Route les messages vers n8n et retourne les réponses
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config'

const N8N_WEBHOOK_URL = process.env.N8N_MARJORIE_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/marjorie-chat'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // 2. Extraire les données de la requête
    const body = await request.json() as ChatRequest
    const { message, conversationHistory = [] } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message vide' },
        { status: 400 }
      )
    }

    // 3. Déterminer le rôle utilisateur
    const userRole = session.user.role || 'admin'
    const userId = session.user.id
    const userName = `${session.user.prenom || ''} ${session.user.nom || ''}`.trim() || 'Utilisateur'

    // 4. Construire le payload pour n8n
    const payload = {
      // Identification utilisateur
      userId,
      userName,
      userRole,

      // Message actuel
      message: message.trim(),

      // Contexte conversation
      conversationHistory: conversationHistory.slice(-10), // Garder les 10 derniers messages pour le contexte

      // Métadonnées
      timestamp: new Date().toISOString(),
      source: 'crm_chat',
    }

    // 5. Appeler le webhook n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Erreur webhook n8n:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec Marjorie' },
        { status: 500 }
      )
    }

    // 6. Récupérer la réponse de n8n
    const marjorieResponse = await response.json()

    // 7. Formater la réponse
    return NextResponse.json({
      success: true,
      message: marjorieResponse.reply || marjorieResponse.message || 'Réponse reçue',
      suggestions: marjorieResponse.suggestions || [],
      metadata: {
        timestamp: new Date().toISOString(),
        role: userRole,
      },
    })

  } catch (error) {
    console.error('Erreur API chat Marjorie:', error)
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
