/**
 * Modal pour envoyer un message personnalisé à un formateur
 * Workflow: CRM → n8n → Email envoyé + MAJ BDD
 * Pattern: Fire-and-forget (202 Accepted)
 */

'use client'

import { useState } from 'react'
import { X, Send, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useActionNotification } from '@/hooks/use-action-notification'

interface EnvoyerMessageFormateurModalProps {
  formateur: {
    idFormateur: number
    nom: string
    prenom: string
    email: string
    telephone?: string
  }
  onClose: () => void
  onSuccess?: () => void
}

export function EnvoyerMessageFormateurModal({
  formateur,
  onClose,
  onSuccess
}: EnvoyerMessageFormateurModalProps) {
  const [objet, setObjet] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createActionNotification } = useActionNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!objet.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setSending(true)
    setError(null)

    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'FORMATEUR',
        type: 'ENVOI_MESSAGE',
        priorite: 'NORMALE',
        titre: `Message envoyé à ${formateur.prenom} ${formateur.nom}`,
        message: `Objet: ${objet.trim()}`,
        entiteType: 'formateur',
        entiteId: formateur.idFormateur.toString(),
        actionRequise: true,
        typeAction: 'RELANCER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'ENVOYER_MESSAGE_FORMATEUR',
        actionSource: 'admin.formateurs.detail',
        actionButton: 'envoyer_message',

        // === CONTEXTE MÉTIER ===
        entiteType: 'formateur',
        entiteId: formateur.idFormateur.toString(),
        entiteData: {
          idFormateur: formateur.idFormateur,
          nom: formateur.nom,
          prenom: formateur.prenom,
          email: formateur.email,
          telephone: formateur.telephone
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'envoi_message',
        commentaire: objet.trim(),

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          objet: objet.trim(),
          contenu: message.trim(),
          destinataire: formateur.email
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'message_sent',
          timeoutSeconds: 30
        }
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.status === 202 && result.success) {
        // Succès : 202 Accepted (traitement en arrière-plan)
        setSent(true)

        // Appeler le callback de succès si fourni
        if (onSuccess) {
          onSuccess()
        }

        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          onClose()
        }, 2000)
      } else if (response.status === 409) {
        // Conflit : message déjà en cours d'envoi
        setError(result.message || 'Un message est déjà en cours d\'envoi')
      } else {
        // Autre erreur
        setError(result.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <Mail className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Envoyer un message
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {formateur.prenom} {formateur.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Destinataire (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Destinataire
              </label>
              <div className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--muted-foreground))]">
                {formateur.email}
              </div>
            </div>

            {/* Objet */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Objet <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <input
                type="text"
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                placeholder="Ex: Information sur votre prochaine session"
                disabled={sending || sent}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Message <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bonjour,

Je vous contacte concernant..."
                rows={10}
                disabled={sending || sent}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none disabled:opacity-50"
                required
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
                <p className="text-sm text-[rgb(var(--error))]">{error}</p>
              </div>
            )}

            {/* Message de succès */}
            {sent && (
              <div className="p-4 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)] rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />
                  <p className="text-sm text-[rgb(var(--success))]">
                    Message transmis à Marjorie pour envoi
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer avec boutons */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={sending || sent || !objet.trim() || !message.trim()}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : sent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Envoyé
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
