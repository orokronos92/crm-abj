/**
 * Panel de révision de la proposition IA
 * Affiche le rapport Marjorie + calendrier des séances + stats
 */

import React, { useState } from 'react'
import { Sparkles, Calendar, Clock, MapPin, User, Users, TrendingUp, AlertCircle, CheckCircle2, X, BookOpen } from 'lucide-react'
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

  // DEBUG: Afficher les données reçues
  console.log('🔍 SessionProposalReview - Données reçues:', {
    type: proposal.type,
    nomSession: proposal.nomSession,
    programme: proposal.programme?.length,
    formateurs: proposal.formateurs?.length,
    salles: proposal.salles?.length,
    totalHeuresFormation: proposal.planningGenere?.total_heures_formation,
    nbParticipants: proposal.planningGenere?.nb_participants,
    joursActifs: proposal.joursActifs?.length,
    fullProposal: proposal
  })

  // Calcul des stats
  // IMPORTANT: Pour un CAP, les heures des matières sont une RÉPARTITION des 800h totales
  // On ne doit PAS additionner toutes les heures de toutes les séances
  // On prend le total_heures_formation du proposal s'il existe, sinon on calcule
  const totalHeures = proposal.planningGenere.total_heures_formation
    ? proposal.planningGenere.total_heures_formation
    : proposal.planningGenere.seances.reduce((sum: number, s) => {
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
          {/* Synthèse de la session */}
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
            <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
              Synthèse de la session
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Type de formation */}
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Type de formation</p>
                <p className="font-medium text-[rgb(var(--foreground))]">
                  {proposal.type === 'CAP' ? 'Formation CAP longue durée' : 'Formation courte'}
                </p>
              </div>

              {/* Nom de la session (CAP uniquement) */}
              {proposal.type === 'CAP' && proposal.nomSession && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Nom de la session</p>
                  <p className="font-medium text-[rgb(var(--foreground))]">{proposal.nomSession}</p>
                </div>
              )}

              {/* Date de début */}
              {proposal.dateDebutGlobale && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date de début</p>
                  <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                    {new Date(proposal.dateDebutGlobale).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Date de fin */}
              {(proposal.dateFinGlobale || proposal.dateFin) && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date de fin</p>
                  <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                    {new Date(proposal.dateFinGlobale || proposal.dateFin!).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Nombre de participants */}
              {proposal.planningGenere.nb_participants && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Participants</p>
                  <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                    {proposal.planningGenere.nb_participants} élèves
                  </p>
                </div>
              )}

              {/* Jours actifs */}
              {proposal.joursActifs && proposal.joursActifs.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Jours de cours</p>
                  <div className="flex flex-wrap gap-1">
                    {proposal.joursActifs.map((jour) => (
                      <span
                        key={jour}
                        className="px-2 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded text-xs font-medium"
                      >
                        {jour.charAt(0) + jour.slice(1).toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Programme (CAP uniquement) */}
          {proposal.type === 'CAP' && proposal.programme && proposal.programme.length > 0 && (
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
              <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                Programme détaillé
              </h3>
              <div className="space-y-2">
                {proposal.programme.map((matiere, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.3)]"
                  >
                    <span className="font-medium text-[rgb(var(--foreground))]">{matiere.nom}</span>
                    <span className="text-sm text-[rgb(var(--accent))] font-semibold">{matiere.heures}h</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[rgb(var(--foreground))]">Total du programme</span>
                  <span className="text-xl font-bold text-[rgb(var(--accent))]">{totalHeures}h</span>
                </div>
              </div>
            </div>
          )}

          {/* Ressources (formateurs et salles) */}
          {((proposal.formateurs && proposal.formateurs.length > 0) || (proposal.salles && proposal.salles.length > 0)) && (
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
              <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[rgb(var(--accent))]" />
                Ressources
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Formateurs */}
                {proposal.formateurs && proposal.formateurs.length > 0 && (
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Formateurs ({proposal.formateurs.length})</p>
                    <div className="space-y-1">
                      {proposal.formateurs.map((formateur, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-[rgb(var(--foreground))]">{formateur.nom}</p>
                          {formateur.matieres && formateur.matieres.length > 0 && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {formateur.matieres.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salles */}
                {proposal.salles && proposal.salles.length > 0 && (
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Salles ({proposal.salles.length})</p>
                    <div className="space-y-1">
                      {proposal.salles.map((salle, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-[rgb(var(--foreground))]">{salle.nom}</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            Capacité: {salle.capacite} places
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
          <div className="grid grid-cols-5 gap-4">
            {proposal.planningGenere.nb_participants && (
              <div className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Participants</p>
                </div>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{proposal.planningGenere.nb_participants}</p>
              </div>
            )}
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
