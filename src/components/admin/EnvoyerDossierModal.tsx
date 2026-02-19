'use client'

import { useState } from 'react'
import { X, Send, CheckCircle, Loader2, Mail, User, Phone, MapPin } from 'lucide-react'
import { useActionNotification } from '@/hooks/use-action-notification'

interface EnvoyerDossierModalProps {
  prospect: {
    idProspect: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    ville?: string
    codePostal?: string
    formationPrincipale?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function EnvoyerDossierModal({
  prospect,
  onClose,
  onSuccess
}: EnvoyerDossierModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { createActionNotification } = useActionNotification()

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'PROSPECT',
        type: 'ENVOI_DOSSIER',
        priorite: 'NORMALE',
        titre: `Dossier envoyé à ${prospect.prenom} ${prospect.nom}`,
        message: `Lien formulaire candidature envoyé pour ${prospect.formationPrincipale || 'formation'}`,
        entiteType: 'prospect',
        entiteId: prospect.idProspect,
        actionRequise: true,
        typeAction: 'RELANCER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'ENVOYER_DOSSIER_PROSPECT',
        actionSource: 'admin.prospects.detail',
        actionButton: 'envoyer_dossier',

        // === CONTEXTE MÉTIER ===
        entiteType: 'prospect',
        entiteId: prospect.idProspect,
        entiteData: {
          nom: prospect.nom,
          prenom: prospect.prenom,
          email: prospect.email,
          telephone: prospect.telephone,
          ville: prospect.ville,
          codePostal: prospect.codePostal,
          formationPrincipale: prospect.formationPrincipale
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'envoi_dossier_complet',
        commentaire: 'Envoi du lien formulaire dossier de candidature',

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          formationCiblee: prospect.formationPrincipale,
          destinataire: prospect.email
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'dossier_sent',
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
        alert(result.message || 'Un envoi est déjà en cours pour ce prospect')
        onClose()
      } else {
        alert(result.error || 'Erreur lors de l\'envoi du dossier')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi du dossier')
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
              Demande envoyée
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La demande d'envoi du dossier de candidature à <strong>{prospect.prenom} {prospect.nom}</strong> a été transmise à Marjorie.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📧 L'email avec le lien du formulaire sera envoyé sous peu à <strong>{prospect.email}</strong>
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

  // Modal de confirmation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <Send className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Envoyer le dossier de candidature
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Confirmation avant envoi
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
                Prospect concerné
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-3">
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
                {prospect.telephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {prospect.telephone}
                    </span>
                  </div>
                )}
                {(prospect.ville || prospect.codePostal) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {prospect.codePostal} {prospect.ville}
                    </span>
                  </div>
                )}
                {prospect.formationPrincipale && (
                  <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                      Formation souhaitée
                    </p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {prospect.formationPrincipale}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ce qui va se passer */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Ce qui va se passer
              </h3>
              <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Génération du lien unique
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Marjorie crée un formulaire personnalisé pour ce prospect
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Envoi de l'email
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Email personnalisé avec lien du formulaire envoyé à {prospect.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Mise à jour du statut
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Le statut du prospect passera à "EN_ATTENTE_DOSSIER"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Notification de confirmation
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Vous recevrez une notification lorsque l'email sera envoyé
                    </p>
                  </div>
                </div>
              </div>
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
                  <Send className="w-4 h-4" />
                  Envoyer le dossier
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
