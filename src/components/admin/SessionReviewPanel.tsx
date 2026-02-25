/**
 * Panel de révision des données avant envoi à l'IA
 * Affiche un récapitulatif complet selon le type de session
 */

import React from 'react'
import { ChevronLeft, Sparkles, Calendar, Users, Clock, Euro, BookOpen, Target } from 'lucide-react'
import type { SessionFormData, SessionType } from './session-form/session-form.types'

interface SessionReviewPanelProps {
  data: SessionFormData
  type: SessionType
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

export function SessionReviewPanel({
  data,
  type,
  onBack,
  onConfirm,
  isSubmitting
}: SessionReviewPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
            <Target className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Révision avant envoi
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Vérifiez les informations avant la génération IA
            </p>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Section Informations Générales */}
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
            <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
              Informations générales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Type de formation</p>
                <p className="font-medium text-[rgb(var(--foreground))]">{type === 'COURTE' ? 'Formation courte' : 'Formation CAP'}</p>
              </div>
              {type === 'CAP' && data.dataCAP && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Nom de la session</p>
                  <p className="font-medium text-[rgb(var(--foreground))]">{data.dataCAP.nomSession}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date de début</p>
                <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                  {type === 'COURTE' && data.dataCourte
                    ? new Date(data.dataCourte.dateDebut).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : type === 'CAP' && data.dataCAP
                    ? new Date(data.dataCAP.dateDebutGlobale).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Non défini'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Nombre de participants</p>
                <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                  {(type === 'COURTE' && data.dataCourte ? data.dataCourte.nbParticipants : type === 'CAP' && data.dataCAP ? data.dataCAP.nbParticipants : 0)} élèves
                </p>
              </div>
            </div>
          </div>

          {/* Section spécifique COURTE */}
          {type === 'COURTE' && data.dataCourte && (
            <>
              {/* Dates et Jours */}
              <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Période et rythme
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date de fin</p>
                    <p className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                      {new Date(data.dataCourte.dateFin).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Jours actifs</p>
                    <p className="font-medium text-[rgb(var(--foreground))]/80 text-sm">
                      {data.dataCourte.joursActifs.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ressources */}
              <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))]">
                  Ressources
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Salle</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {data.dataCourte.salleId ? `Salle ID ${data.dataCourte.salleId}` : 'À planifier'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formateur</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {data.dataCourte.formateurId && data.dataCourte.formateurId !== 'SANS_FORMATEUR'
                        ? `Formateur ID ${data.dataCourte.formateurId}`
                        : 'À planifier'}
                    </p>
                  </div>
                </div>
                {data.dataCourte.description && (
                  <div className="mt-4">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Description</p>
                    <p className="text-sm text-[rgb(var(--foreground))]/80">{data.dataCourte.description}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section spécifique CAP */}
          {type === 'CAP' && data.dataCAP && (
            <>
              {/* Rythme */}
              <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Rythme de formation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date de fin</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">{data.dataCAP.dateFinGlobale}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Jours actifs</p>
                    <p className="font-medium text-[rgb(var(--foreground))]/80 text-sm">
                      {data.dataCAP.joursActifs.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Programme */}
              {data.dataCAP.programme && data.dataCAP.programme.length > 0 && (
                <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
                  <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Programme
                  </h3>
                  <div className="space-y-2">
                    {data.dataCAP.programme.map((matiere, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[rgb(var(--card))] rounded">
                        <span className="font-medium">{matiere.nom}</span>
                        <span className="text-sm text-[rgb(var(--muted-foreground))]">{matiere.heures}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ressources */}
              <div className="bg-[rgb(var(--secondary))] rounded-lg p-5 border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--foreground))]">
                  Ressources
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formateurs</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {data.dataCAP.formateursPlanifierPlusTard
                        ? 'À planifier plus tard'
                        : `${data.dataCAP.formateurs?.length || 0} formateur(s)`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Salles</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {data.dataCAP.sallesPlanifierPlusTard
                        ? 'À planifier plus tard'
                        : `${data.dataCAP.salles?.length || 0} salle(s)`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Note d'information */}
          <div className="bg-[rgba(var(--accent),0.05)] rounded-lg p-4 border border-[rgba(var(--accent),0.2)]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Génération automatique par Marjorie
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                  {type === 'COURTE'
                    ? "Marjorie va générer un planning détaillé jour par jour en respectant les horaires, le rythme et les disponibilités de la salle et du formateur."
                    : "Marjorie va générer un planning complet sur toute la durée du CAP, en attribuant les matières aux formateurs disponibles et en optimisant l'occupation des salles."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer sticky */}
      <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent))]/90 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Envoyer à Marjorie pour validation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
