'use client'

import { useState } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

interface SessionToDelete {
  idSession: number
  nomSession: string | null
  nbInscrits: number
  listeAttente: number
  formation: string
}

interface ConfirmDeleteSessionModalProps {
  session: SessionToDelete
  onConfirm: (motif: string) => void
  onCancel: () => void
  loading: boolean
}

export function ConfirmDeleteSessionModal({
  session,
  onConfirm,
  onCancel,
  loading
}: ConfirmDeleteSessionModalProps) {
  const [motif, setMotif] = useState('')

  const nbPersonnesAffectees = session.nbInscrits + session.listeAttente

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[rgb(var(--card))] rounded-xl w-full max-w-full sm:max-w-md shadow-2xl border border-[rgba(var(--error),0.3)]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--error),0.15)] rounded-lg">
              <Trash2 className="w-5 h-5 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
              Annuler la session
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">

          {/* Nom de la session */}
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Session à annuler</p>
            <p className="font-semibold text-[rgb(var(--foreground))] mt-0.5">
              {session.nomSession || 'Sans nom'} — {session.formation}
            </p>
          </div>

          {/* Avertissement si des personnes sont affectées */}
          {nbPersonnesAffectees > 0 && (
            <div className="flex items-start gap-3 p-3 bg-[rgba(var(--error),0.08)] border border-[rgba(var(--error),0.25)] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[rgb(var(--error))] mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-[rgb(var(--error))]">
                  {nbPersonnesAffectees} personne{nbPersonnesAffectees > 1 ? 's' : ''} affectée{nbPersonnesAffectees > 1 ? 's' : ''}
                </p>
                <p className="text-[rgb(var(--muted-foreground))] mt-0.5">
                  {session.nbInscrits > 0 && `${session.nbInscrits} inscrit${session.nbInscrits > 1 ? 's' : ''}`}
                  {session.nbInscrits > 0 && session.listeAttente > 0 && ' · '}
                  {session.listeAttente > 0 && `${session.listeAttente} en liste d'attente`}
                  {' — '}leurs inscriptions seront annulées et ils pourront être réinscrits à une autre session.
                </p>
              </div>
            </div>
          )}

          {/* Motif optionnel */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
              Motif d'annulation <span className="text-[rgb(var(--muted-foreground))] font-normal">(optionnel)</span>
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Formateur indisponible, nombre d'inscrits insuffisant..."
              rows={2}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(motif)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-[rgb(var(--error))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Annulation…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Confirmer l'annulation
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
