'use client'

import { useState } from 'react'
import { X, Send, CheckCircle, Loader2, Mail, User, MessageSquare } from 'lucide-react'
import { useActionNotification } from '@/hooks/use-action-notification'

interface EnvoyerMessageEleveModalProps {
  eleve: {
    idEleve: number
    numeroDossier: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    formation?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function EnvoyerMessageEleveModal({
  eleve,
  onClose,
  onSuccess
}: EnvoyerMessageEleveModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { createActionNotification } = useActionNotification()

  const [formData, setFormData] = useState({
    objet: '',
    contenu: ''
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.objet.trim() || !formData.contenu.trim()) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setSubmitting(true)

    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'ELEVE',
        type: 'ENVOI_MESSAGE',
        priorite: 'NORMALE',
        titre: `Message envoyé à ${eleve.prenom} ${eleve.nom}`,
        message: `Objet: ${formData.objet} - Dossier ${eleve.numeroDossier}`,
        entiteType: 'eleve',
        entiteId: eleve.idEleve.toString(),
        actionRequise: true,
        typeAction: 'RELANCER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'ENVOYER_MESSAGE_ELEVE',
        actionSource: 'admin.eleves.detail',
        actionButton: 'envoyer_message',

        // === CONTEXTE MÉTIER ===
        entiteType: 'eleve',
        entiteId: eleve.idEleve.toString(),
        entiteData: {
          idEleve: eleve.idEleve,
          numeroDossier: eleve.numeroDossier,
          nom: eleve.nom,
          prenom: eleve.prenom,
          email: eleve.email,
          telephone: eleve.telephone,
          formation: eleve.formation
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'envoi_message',
        commentaire: formData.objet,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          objet: formData.objet,
          contenu: formData.contenu,
          destinataire: eleve.email,
          numeroDossier: eleve.numeroDossier
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

      if (response.ok && result.success) {
        // Demande envoyée avec succès
        setSubmitted(true)
        // Auto-close après 3 secondes
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 5000)
      } else if (response.status === 409) {
        // Envoi déjà en cours
        alert(result.message || 'Un envoi de message est déjà en cours pour cet élève')
        onClose()
      } else {
        alert(result.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setSubmitting(false)
    }
  }

  // Modal de succès
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Message en cours d'envoi
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Le message pour <strong>{eleve.prenom} {eleve.nom}</strong> a été transmis à Marjorie.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📧 Destinataire : <strong>{eleve.email}</strong>
              </p>
              <p className="text-sm text-[rgb(var(--foreground))] mt-1">
                💬 Objet : <strong>{formData.objet}</strong>
              </p>
            </div>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                🔔 Vous serez averti par les notifications lorsque le message sera envoyé.
              </p>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Fermeture automatique dans 3 secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Modal de saisie du message
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
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
                Envoyer un email personnalisé à l'élève
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations élève */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Destinataire
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {eleve.prenom} {eleve.nom}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">
                    {eleve.email}
                  </span>
                </div>
                {eleve.formation && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Formation : {eleve.formation}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Objet */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Objet du message *
              </label>
              <input
                type="text"
                value={formData.objet}
                onChange={(e) => handleChange('objet', e.target.value)}
                placeholder="Ex: Votre planning de formation, Résultats d'évaluation, etc."
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                disabled={submitting}
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Message *
              </label>
              <textarea
                value={formData.contenu}
                onChange={(e) => handleChange('contenu', e.target.value)}
                placeholder="Rédigez votre message ici..."
                rows={10}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
                disabled={submitting}
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Astuce : Marjorie ajoutera automatiquement les formules de politesse et la signature ABJ
              </p>
            </div>
          </div>
        </div>

        {/* Footer sticky */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.objet.trim() || !formData.contenu.trim()}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
