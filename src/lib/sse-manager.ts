/**
 * SSE Manager - Gestion centralisée des connexions Server-Sent Events
 *
 * Architecture:
 * - Singleton côté serveur pour gérer toutes les connexions SSE actives
 * - Broadcast intelligent selon audience et rôle
 * - Heartbeat automatique pour maintenir les connexions
 * - Nettoyage automatique des connexions fermées
 *
 * Utilisation:
 * - Importé dans l'endpoint /api/notifications/stream
 * - Appelé depuis l'endpoint /api/notifications/ingest après création
 * - Gère automatiquement le filtrage par rôle et audience
 */

interface SSEClient {
  id: string
  idUtilisateur: number | null
  role: string // 'admin' | 'professeur' | 'eleve'
  controller: ReadableStreamDefaultController
  connectedAt: Date
  lastHeartbeat: Date
}

interface NotificationBroadcast {
  idNotification: number
  sourceAgent: string
  categorie: string
  type: string
  priorite: string
  titre: string
  message: string
  audience: string
  idUtilisateurCible?: number | null
  idFormateurCible?: number | null
  idEleveCible?: number | null
  lienAction?: string | null
  actionRequise?: boolean
  typeAction?: string | null
  creeLe: Date
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map()
  private encoder = new TextEncoder()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    // Démarrer le heartbeat global toutes les 30 secondes
    this.startGlobalHeartbeat()
  }

  /**
   * Ajoute un nouveau client SSE
   */
  addClient(
    controller: ReadableStreamDefaultController,
    idUtilisateur: number | null = null,
    role: string = 'admin'
  ): string {
    const clientId = this.generateClientId(idUtilisateur)

    const client: SSEClient = {
      id: clientId,
      idUtilisateur,
      role,
      controller,
      connectedAt: new Date(),
      lastHeartbeat: new Date()
    }

    this.clients.set(clientId, client)

    console.log(`[SSE] Client connecté: ${clientId} (role: ${role}, userId: ${idUtilisateur})`)
    console.log(`[SSE] Clients actifs: ${this.clients.size}`)

    // Envoyer un message de bienvenue
    this.sendToClient(client, {
      event: 'connected',
      data: {
        clientId,
        role,
        message: 'Connexion SSE établie avec succès'
      }
    })

    return clientId
  }

  /**
   * Retire un client SSE
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId)
    if (client) {
      this.clients.delete(clientId)
      console.log(`[SSE] Client déconnecté: ${clientId}`)
      console.log(`[SSE] Clients actifs: ${this.clients.size}`)
    }
  }

  /**
   * Envoie le compteur initial de notifications à un client
   */
  async sendInitialCount(
    clientId: string,
    counts: {
      total: number
      nonLues: number
      urgentes: number
      actionsRequises: number
    }
  ): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client) return

    this.sendToClient(client, {
      event: 'count',
      data: counts
    })
  }

  /**
   * Broadcast une notification aux clients concernés
   */
  broadcast(notification: NotificationBroadcast): void {
    const targetClients = this.getTargetClients(notification)

    console.log(`[SSE] Broadcasting notification ${notification.idNotification} to ${targetClients.length} clients`)

    for (const client of targetClients) {
      this.sendToClient(client, {
        event: 'notification',
        data: notification
      })
    }
  }

  /**
   * Broadcast une mise à jour de compteurs
   */
  broadcastCount(
    counts: {
      total: number
      nonLues: number
      urgentes: number
      actionsRequises: number
    },
    targetRole?: string,
    targetUserId?: number
  ): void {
    const clients = targetUserId
      ? Array.from(this.clients.values()).filter(c => c.idUtilisateur === targetUserId)
      : targetRole
      ? Array.from(this.clients.values()).filter(c => c.role === targetRole)
      : Array.from(this.clients.values())

    for (const client of clients) {
      this.sendToClient(client, {
        event: 'count',
        data: counts
      })
    }
  }

  /**
   * Broadcast qu'une action a été effectuée
   */
  broadcastActionCompleted(
    notificationId: number,
    typeAction: string,
    resultat: string,
    targetRole?: string
  ): void {
    const clients = targetRole
      ? Array.from(this.clients.values()).filter(c => c.role === targetRole)
      : Array.from(this.clients.values())

    for (const client of clients) {
      this.sendToClient(client, {
        event: 'action_completed',
        data: {
          notificationId,
          typeAction,
          resultat
        }
      })
    }
  }

  /**
   * Envoie un message à un client spécifique
   */
  private sendToClient(client: SSEClient, message: { event: string; data: any }): void {
    try {
      const formattedMessage = this.formatSSEMessage(message.event, message.data)
      client.controller.enqueue(this.encoder.encode(formattedMessage))
      client.lastHeartbeat = new Date()
    } catch (error) {
      // Client déconnecté, le retirer
      console.log(`[SSE] Erreur envoi au client ${client.id}, suppression`)
      this.removeClient(client.id)
    }
  }

  /**
   * Formate un message au format SSE
   */
  private formatSSEMessage(event: string, data: any): string {
    const jsonData = JSON.stringify(data)
    return `event: ${event}\ndata: ${jsonData}\n\n`
  }

  /**
   * Détermine les clients cibles selon l'audience de la notification
   */
  private getTargetClients(notification: NotificationBroadcast): SSEClient[] {
    return Array.from(this.clients.values()).filter(client => {
      // Audience TOUS
      if (notification.audience === 'TOUS') return true

      // Audience par rôle
      if (notification.audience === 'ADMIN' && client.role === 'admin') return true
      if (notification.audience === 'FORMATEUR' && client.role === 'professeur') return true
      if (notification.audience === 'ELEVE' && client.role === 'eleve') return true

      // Audience spécifique
      if (notification.audience === 'SPECIFIQUE') {
        if (notification.idUtilisateurCible && client.idUtilisateur === notification.idUtilisateurCible) {
          return true
        }
        // Note: idFormateurCible et idEleveCible nécessitent une jointure BDD
        // pour mapper vers idUtilisateur, non implémenté ici pour simplifier
      }

      return false
    })
  }

  /**
   * Génère un ID unique pour un client
   */
  private generateClientId(idUtilisateur: number | null): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const userId = idUtilisateur || 'anonymous'
    return `${userId}-${timestamp}-${random}`
  }

  /**
   * Heartbeat global pour maintenir les connexions actives
   */
  private startGlobalHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      const now = new Date()
      const deadClients: string[] = []

      // Envoyer heartbeat et détecter clients morts
      for (const [clientId, client] of this.clients) {
        try {
          const heartbeat = ': heartbeat\n\n'
          client.controller.enqueue(this.encoder.encode(heartbeat))
          client.lastHeartbeat = new Date()
        } catch {
          deadClients.push(clientId)
        }
      }

      // Nettoyer les clients morts
      for (const clientId of deadClients) {
        this.removeClient(clientId)
      }

      if (this.clients.size > 0) {
        console.log(`[SSE] Heartbeat envoyé à ${this.clients.size} clients`)
      }
    }, 30000) // 30 secondes
  }

  /**
   * Obtient le nombre de clients connectés
   */
  getClientCount(): number {
    return this.clients.size
  }

  /**
   * Obtient les statistiques des clients
   */
  getStats(): {
    total: number
    byRole: Record<string, number>
    connectedSince: Record<string, Date>
  } {
    const stats = {
      total: this.clients.size,
      byRole: {} as Record<string, number>,
      connectedSince: {} as Record<string, Date>
    }

    for (const [clientId, client] of this.clients) {
      // Compter par rôle
      if (!stats.byRole[client.role]) {
        stats.byRole[client.role] = 0
      }
      stats.byRole[client.role]++

      // Enregistrer depuis quand connecté
      stats.connectedSince[clientId] = client.connectedAt
    }

    return stats
  }

  /**
   * Nettoie toutes les connexions (pour shutdown gracieux)
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    for (const clientId of this.clients.keys()) {
      this.removeClient(clientId)
    }

    console.log('[SSE] Manager nettoyé, toutes les connexions fermées')
  }
}

// Singleton global (survit aux hot reloads en dev)
const globalForSSE = globalThis as unknown as { sseManager: SSEManager }

if (!globalForSSE.sseManager) {
  globalForSSE.sseManager = new SSEManager()
}

export const sseManager = globalForSSE.sseManager

// Export du type pour utilisation dans les endpoints
export type { NotificationBroadcast }