/**
 * RefuserCandidatModal
 * Mini-popup formulaire pour refuser un candidat via n8n
 * Motif du refus obligatoire — n8n gère tous les updates BDD
 */

'use client'

import { useState, useRef } from 'react'
import { X, XCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useCallbackListener } from '@/hooks/use-callback-listener'

interface RefuserCandidatModalProps {
  candidat: {
    idCandidat: number
    numeroDossier: string
    nom: string
    prenom: string
    email: string
    formation: string
    idProspect: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function RefuserCandidatModal({ candidat, onClose, onSuccess }: RefuserCandidatModalProps) {
  const [motif, setMotif] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!motif.trim()) return

    setSubmitting(true)
    // Passer en pending AVANT l'envoi pour afficher le spinner immédiatement
    setActionStatus('pending')

    try {
      const payload = {
        correlationId: correlationId.current,
        actionType: 'REFUSER_CANDIDAT',
        actionSource: 'admin.candidats.detail',
        actionButton: 'refuser_candidat',
        entiteType: 'candidat',
        entiteId: String(candidat.idCandidat),
        entiteData: {
          idCandidat: candidat.idCandidat,
          numeroDossier: candidat.numeroDossier,
          nom: candidat.nom,
          prenom: candidat.prenom,
          email: candidat.email,
          formation: candidat.formation,
          idProspect: candidat.idProspect
        },
        decisionType: 'refus_candidat',
        commentaire: motif.trim(),
        metadonnees: {
          motifRefus: motif.trim(),
          numeroDossier: candidat.numeroDossier,
          idProspect: candidat.idProspect
        },
        responseConfig: {
          expectedResponse: 'candidat_refused',
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
        alert(result.error || 'Erreur lors du refus')
      }
      // Sinon on reste en pending — le callback SSE passera à success ou error
    } catch (error) {
      console.error('Erreur:', error)
      setActionStatus('idle')
      setSubmitting(false)
      alert('Erreur lors du refus du candidat')
    }
  }

  // En attente de confirmation n8n
  if (actionStatus === 'pending') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <Loader2 className="w-12 h-12 text-[rgb(var(--error))] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Traitement en cours...
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Marjorie traite le refus de <strong>{candidat.prenom} {candidat.nom}</strong>.
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
              Candidature refusée
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              <strong>{candidat.prenom} {candidat.nom}</strong> a été notifié(e) du refus
              et remis(e) dans les prospects.
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
              Erreur
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Le refus n&apos;a pas pu être confirmé. Vérifiez les notifications.
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

  // Formulaire de refus
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--error),0.1)] rounded-lg">
              <XCircle className="w-6 h-6 text-[rgb(var(--error))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                Refuser la candidature
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {candidat.prenom} {candidat.nom} — {candidat.numeroDossier}
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Motif du refus <span className="text-[rgb(var(--error))]">*</span>
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Profil ne correspondant pas aux prérequis de la formation, niveau insuffisant en dessin technique..."
              rows={4}
              required
              className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
            />
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Ce motif sera enregistré dans le dossier et peut être communiqué au candidat.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgba(var(--border),0.3)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !motif.trim()}
              className="px-6 py-2 bg-[rgb(var(--error))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Confirmer le refus
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
