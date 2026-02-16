/**
 * Panel de révision de la proposition IA
 * Affiche le rapport Marjorie + calendrier des séances + stats
 */

import React, { useState } from 'react'
import { Sparkles, Calendar, Clock, MapPin, User, Users, TrendingUp, AlertCircle, CheckCircle2, X } from 'lucide-react'
import type { SessionProposal } from './session-form/session-form.types'

interface SessionProposalReviewProps {
  proposal: SessionProposal
  onValidate: () => void
  onReject: () => void
  onAdjust: () => void
}

export function SessionProposalReview({
  proposal,
  onValidate,
  onReject,
  onAdjust
}: SessionProposalReviewProps) {
  const [expandedSeance, setExpandedSeance] = useState<number | null>(null)

  // Calcul des stats
  const totalHeures = proposal.planningGenere.seances.reduce((sum: number, s) => {
    const debut = new Date(`1970-01-01T${s.heureDebut}`)
    const fin = new Date(`1970-01-01T${s.heureFin}`)
    const diff = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60)
    return sum + diff
  }, 0)

  const formateursUniques = [...new Set(proposal.planningGenere.seances.map((s) => s.formateurNom))].filter(Boolean).length
  const sallesUniques = [...new Set(proposal.planningGenere.seances.map((s) => s.salleNom))].length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
            <Sparkles className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Proposition de Marjorie
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Planning généré automatiquement
            </p>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Rapport IA */}
          <div className="bg-[rgba(var(--accent),0.05)] rounded-lg p-5 border border-[rgba(var(--accent),0.2)]">
            <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--foreground))] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
              Rapport de génération
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed whitespace-pre-wrap">
                {proposal.planningGenere.rapportIA}
              </p>
            </div>
          </div>

          {/* Statistiques clés */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Séances</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{proposal.planningGenere.seances.length}</p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Total heures</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{totalHeures}h</p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Formateurs</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{formateursUniques}</p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[rgb(var(--accent))]" />
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Salles</p>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{sallesUniques}</p>
            </div>
          </div>

          {/* Calendrier des séances */}
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
            <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
              Calendrier des séances ({proposal.planningGenere.seances.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {proposal.planningGenere.seances.map((seance, idx) => {
                const isExpanded = expandedSeance === idx
                const date = new Date(seance.date)

                return (
                  <div
                    key={idx}
                    className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.3)] overflow-hidden hover:border-[rgba(var(--accent),0.3)] transition-colors"
                  >
                    <div
                      className="p-3 cursor-pointer"
                      onClick={() => setExpandedSeance(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[rgba(var(--accent),0.1)] flex flex-col items-center justify-center">
                            <span className="text-xs text-[rgb(var(--muted-foreground))]">
                              {date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                            </span>
                            <span className="text-lg font-bold text-[rgb(var(--accent))]">
                              {date.getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">{seance.matiere}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {date.toLocaleDateString('fr-FR', { weekday: 'long' })} • {seance.heureDebut} - {seance.heureFin}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">{seance.salleNom}</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{seance.formateurNom || 'Non assigné'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Statistiques d'occupation (si disponibles) */}
          {proposal.planningGenere.statsOccupation && (
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
              <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                Statistiques d'occupation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Salles utilisées</p>
                  <div className="space-y-1">
                    {proposal.planningGenere.statsOccupation.salles.map((salle, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium text-[rgb(var(--foreground))]">{salle.nom}</span>
                        <span className="text-[rgb(var(--muted-foreground))]"> • {salle.tauxOccupation}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Charge formateurs</p>
                  <div className="space-y-1">
                    {proposal.planningGenere.statsOccupation.formateurs.map((formateur, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium text-[rgb(var(--foreground))]">{formateur.nom}</span>
                        <span className="text-[rgb(var(--muted-foreground))]"> • {formateur.heuresTotal}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer sticky */}
      <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <button
            type="button"
            onClick={onReject}
            className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors flex items-center gap-2 text-[rgb(var(--error))]"
          >
            <X className="w-4 h-4" />
            Refuser
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAdjust}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-colors"
            >
              Ajuster le planning
            </button>
            <button
              type="button"
              onClick={onValidate}
              className="px-6 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[rgb(var(--success))]/90 transition-all font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider et créer la session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
