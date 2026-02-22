/**
 * ConvertirEleveModal
 * Modal de conversion candidat → élève via n8n
 * Vérifie que les 4 étapes sont validées/exemptées avant d'envoyer
 */

'use client'

import { useState, useRef } from 'react'
import { X, GraduationCap, Loader2, CheckCircle, AlertCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useCallbackListener } from '@/hooks/use-callback-listener'

interface EtapeStatus {
  label: string
  done: boolean
}

interface ConvertirEleveModalProps {
  candidat: {
    idCandidat: number
    numeroDossier: string
    nom: string
    prenom: string
    email: string
    formation: string
    etapes: EtapeStatus[]
  }
  onClose: () => void
  onSuccess: () => void
}

export function ConvertirEleveModal({ candidat, onClose, onSuccess }: ConvertirEleveModalProps) {
  const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const correlationId = useRef(crypto.randomUUID())

  useCallbackListener({
    correlationId: correlationId.current,
    onCallback: (status) => {
      setSubmitting(false)
      setActionStatus(status)
      if (status === 'success') {
        setTimeout(() => { onSuccess() }, 1000)
      }
    },
    timeoutSeconds: 60
  })

  const etapesIncompletes = candidat.etapes.filter(e => !e.done)
  const toutesEtapesFaites = etapesIncompletes.length === 0

  const handleConfirmer = async () => {
    setSubmitting(true)
    // Passer en pending AVANT l'envoi pour afficher le spinner immédiatement
    setActionStatus('pending')

    try {
      const payload = {
        correlationId: correlationId.current,
        actionType: 'CONVERTIR_ELEVE',
        actionSource: 'admin.candidats.detail',
        actionButton: 'convertir_eleve',
        entiteType: 'candidat',
        entiteId: String(candidat.idCandidat),
        entiteData: {
          idCandidat: candidat.idCandidat,
          numeroDossier: candidat.numeroDossier,
          nom: candidat.nom,
          prenom: candidat.prenom,
          email: candidat.email,
          formation: candidat.formation
        },
        decisionType: 'conversion_eleve',
        commentaire: `Conversion en élève — ${candidat.formation}`,
        metadonnees: {
          numeroDossier: candidat.numeroDossier
        },
        responseConfig: {
          expectedResponse: 'eleve_created',
          timeoutSeconds: 60
        }
      }

      const response = await fetch('/api/actions/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setActionStatus('idle')
        setSubmitting(false)
        alert(result.error || 'Erreur lors de la conversion')
      }
      // Sinon on reste en pending — le callback SSE passera à success ou error
    } catch (error) {
      console.error('Erreur:', error)
      setActionStatus('idle')
      setSubmitting(false)
      alert('Erreur lors de la conversion en élève')
    }
  }

  // En attente de confirmation n8n
  if (actionStatus === 'pending') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-full">
              <Loader2 className="w-12 h-12 text-[rgb(var(--accent))] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Conversion en cours...
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Marjorie inscrit <strong>{candidat.prenom} {candidat.nom}</strong> en tant qu'élève.
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              En attente de confirmation (max 60s)...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Succès
  if (actionStatus === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Élève créé avec succès
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              <strong>{candidat.prenom} {candidat.nom}</strong> est maintenant inscrit(e) en tant qu'élève.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Erreur
  if (actionStatus === 'error') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <AlertCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Erreur de conversion
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La conversion n&apos;a pas pu être confirmée. Vérifiez les notifications pour plus de détails.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Popup d'avertissement si étapes incomplètes
  if (!toutesEtapesFaites) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(var(--warning),0.1)] rounded-lg">
                <AlertTriangle className="w-6 h-6 text-[rgb(var(--warning))]" />
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                Parcours incomplet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Les étapes suivantes n'ont pas encore été effectuées pour{' '}
              <strong className="text-[rgb(var(--foreground))]">
                {candidat.prenom} {candidat.nom}
              </strong>{' '}
              :
            </p>

            <div className="space-y-2">
              {etapesIncompletes.map((etape, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-[rgba(var(--warning),0.08)] border border-[rgba(var(--warning),0.25)] rounded-lg"
                >
                  <XCircle className="w-4 h-4 text-[rgb(var(--warning))] flex-shrink-0" />
                  <span className="text-sm text-[rgb(var(--foreground))]">{etape.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Veuillez valider ou exempter ces étapes avant de convertir le candidat en élève.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all"
            >
              Retour au dossier
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation avant envoi (toutes étapes OK)
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--success),0.1)] rounded-lg">
              <GraduationCap className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                Convertir en élève
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {candidat.prenom} {candidat.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[rgba(var(--success),0.08)] border border-[rgba(var(--success),0.25)] rounded-lg space-y-2">
            {candidat.etapes.map((etape, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))] flex-shrink-0" />
                <span className="text-sm text-[rgb(var(--foreground))]">{etape.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Toutes les étapes du parcours sont validées. Marjorie va inscrire{' '}
            <strong className="text-[rgb(var(--foreground))]">
              {candidat.prenom} {candidat.nom}
            </strong>{' '}
            en tant qu'élève pour la formation{' '}
            <strong className="text-[rgb(var(--foreground))]">{candidat.formation}</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] rounded-b-lg">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmer}
              disabled={submitting}
              className="px-6 py-2 bg-[rgb(var(--success))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Confirmer la conversion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
