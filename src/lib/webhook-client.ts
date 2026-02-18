/**
 * Client Webhook pour intégration n8n
 * Gère les appels aux workflows Marjorie avec retry et logging
 */

import prisma from '@/lib/prisma'

const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'
const N8N_API_KEY = process.env.N8N_API_KEY || ''

export interface WebhookResponse {
  success: boolean
  data?: any
  error?: string
  workflowId?: string
  executionId?: string
}

export interface WebhookOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  logErrors?: boolean
}

const DEFAULT_OPTIONS: WebhookOptions = {
  maxRetries: 3,
  retryDelay: 1000, // 1 seconde
  timeout: 30000, // 30 secondes
  logErrors: true
}

/**
 * Fonction utilitaire pour attendre un certain délai
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Enregistre une erreur dans la table journal_erreurs
 */
async function logError(
  nomWorkflow: string,
  messageErreur: string,
  donneesEntree?: any
): Promise<void> {
  try {
    await prisma.journalErreur.create({
      data: {
        nomWorkflow,
        nomNoeud: 'webhook-client',
        messageErreur,
        donneesEntree: donneesEntree || {},
        resolu: false
      }
    })
  } catch (err) {
    // Si le logging échoue, au moins logger en console
    console.error('Erreur lors du logging en BDD:', err)
  }
}

/**
 * Appelle un webhook n8n avec retry et logging
 */
export async function callWebhook(
  webhookPath: string,
  payload: any,
  options: WebhookOptions = {}
): Promise<WebhookResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const url = `${N8N_BASE_URL}${webhookPath}`

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= (opts.maxRetries || 3); attempt++) {
    try {
      console.log(`[Webhook] Tentative ${attempt}/${opts.maxRetries} - ${webhookPath}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${N8N_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      console.log(`[Webhook] ✅ Succès - ${webhookPath}`)

      return {
        success: true,
        data,
        workflowId: data.workflowId,
        executionId: data.executionId
      }

    } catch (error) {
      lastError = error as Error
      console.error(`[Webhook] ❌ Tentative ${attempt} échouée:`, lastError.message)

      // Si c'est la dernière tentative, on log en BDD
      if (attempt === opts.maxRetries && opts.logErrors) {
        await logError(
          webhookPath,
          lastError.message,
          { payload, attempt, url }
        )
      }

      // Si ce n'est pas la dernière tentative, on attend avant de retry
      if (attempt < (opts.maxRetries || 3)) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = (opts.retryDelay || 1000) * Math.pow(2, attempt - 1)
        console.log(`[Webhook] ⏳ Retry dans ${delay}ms...`)
        await wait(delay)
      }
    }
  }

  // Toutes les tentatives ont échoué
  return {
    success: false,
    error: lastError?.message || 'Erreur inconnue lors de l\'appel webhook'
  }
}

/**
 * Webhooks spécifiques pour les actions Prospects
 */
export const prospectWebhooks = {
  /**
   * Convertir un prospect en candidat
   */
  async convertirEnCandidat(data: {
    idProspect: string
    formationRetenue: string
    sessionVisee?: string
    dateDebutSouhaitee?: string
    idConversion?: number
  }): Promise<WebhookResponse> {
    return callWebhook('/prospect/convertir-candidat', data)
  },

  /**
   * Envoyer le dossier de candidature complet
   */
  async envoyerDossier(data: {
    idProspect: string
    idAction?: number
    email: string
    nom: string
    prenom: string
    telephone?: string
    ville?: string
    codePostal?: string
    formationPrincipale?: string
  }): Promise<WebhookResponse> {
    return callWebhook('/prospect/envoyer-dossier', data)
  },

  /**
   * Générer et envoyer un devis
   */
  async genererDevis(data: {
    idProspect: string
    idAction?: number
    formationCode: string
    montant: number
    modeFinancement?: string
    messageMarjorie?: string
    email?: string
    nom?: string
    prenom?: string
    telephone?: string
    ville?: string
    codePostal?: string
  }): Promise<WebhookResponse> {
    return callWebhook('/prospect/generer-devis', data)
  },

  /**
   * Envoyer un email personnalisé
   */
  async envoyerEmail(data: {
    idProspect: string
    idAction?: number
    destinataire: string
    objet: string
    contenu: string
  }): Promise<WebhookResponse> {
    return callWebhook('/prospect/envoyer-email', data)
  }
}
