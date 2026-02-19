'use client'

import { useState } from 'react'
import { X, Mail, CheckCircle, Loader2, User, FileText } from 'lucide-react'
import { useActionNotification } from '@/hooks/use-action-notification'

interface EnvoyerEmailModalProps {
  prospect: {
    idProspect: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    formationPrincipale?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function EnvoyerEmailModal({
  prospect,
  onClose,
  onSuccess
}: EnvoyerEmailModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { createActionNotification, userId } = useActionNotification()

  const [formData, setFormData] = useState({
    objet: '',
    contenu: ''
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.objet.trim() || !formData.contenu.trim()) {
      alert('Veuillez remplir l\'objet et le message')
      return
    }

    setSubmitting(true)

    try {
      // 1. Créer une vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'PROSPECT',
        type: 'ENVOI_EMAIL',
        priorite: 'NORMALE',
        titre: `Email à ${prospect.prenom} ${prospect.nom}`,
        message: `Objet: ${formData.objet}`,
        entiteType: 'prospect',
        entiteId: prospect.idProspect,
        actionRequise: true,
        typeAction: 'RELANCER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'RELANCE_PROSPECT_EMAIL',
        actionSource: 'admin.prospects.detail',
        actionButton: 'envoyer_email',

        // === CONTEXTE MÉTIER ===
        entiteType: 'prospect',
        entiteId: prospect.idProspect,
        entiteData: {
          nom: prospect.nom,
          prenom: prospect.prenom,
          email: prospect.email,
          telephone: prospect.telephone,
          formationPrincipale: prospect.formationPrincipale
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId, // ID utilisateur depuis NextAuth session
        decisionType: 'envoi_email',
        commentaire: formData.objet,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          objet: formData.objet,
          contenu: formData.contenu,
          destinataire: prospect.email
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'email_sent',
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
        // Demande envoyée avec succès
        setSubmitted(true)
        // Auto-close après 3 secondes
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else if (response.status === 409) {
        // Envoi déjà en cours
        alert(result.message || 'Un envoi d\'email est déjà en cours pour ce prospect')
        onClose()
      } else {
        alert(result.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi de l\'email')
    } finally {
      setSubmitting(false)
    }
  }

  // Demande envoyée avec succès
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Email envoyé
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              L'email pour <strong>{prospect.prenom} {prospect.nom}</strong> a été transmis à Marjorie pour envoi.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📧 L'email sera envoyé à <strong>{prospect.email}</strong>
              </p>
            </div>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                🔔 Vous serez averti par les notifications lorsque l'email sera envoyé.
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

  // Modal de composition d'email
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
                Envoyer un email
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Composer un email personnalisé pour le prospect
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

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations prospect */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Destinataire
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {prospect.prenom} {prospect.nom}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--foreground))]">
                    {prospect.email}
                  </span>
                </div>
                {prospect.formationPrincipale && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Formation d'intérêt : {prospect.formationPrincipale}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Objet de l'email */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Objet de l'email *
              </label>
              <input
                type="text"
                value={formData.objet}
                onChange={(e) => handleChange('objet', e.target.value)}
                placeholder="Ex: Informations complémentaires sur la formation CAP Bijouterie"
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                disabled={submitting}
                required
              />
            </div>

            {/* Contenu de l'email */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Message *
              </label>
              <textarea
                value={formData.contenu}
                onChange={(e) => handleChange('contenu', e.target.value)}
                placeholder="Rédigez votre message ici. Marjorie se chargera de l'envoi et du suivi de cet email."
                rows={10}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
                disabled={submitting}
                required
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Astuce : Soyez clair et professionnel. Marjorie conservera l'historique de cet échange.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
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
              disabled={submitting}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer l'email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
