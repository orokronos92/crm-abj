'use client'

import { useState } from 'react'
import { EleveDetailModal } from '@/components/admin/EleveDetailModal'
import { GraduationCap, AlertTriangle } from 'lucide-react'

interface Eleve {
  id: number
  nom: string
  prenom: string
  email: string
  numero_dossier: string
  formation: string
  session: string
  statut: string
  progression: number
  moyenne: number
  heures_effectuees: number
  heures_totales: number
  absences: number
  retards: number
  hasAlert: boolean
  alertes: Array<{ type: string; message: string; niveau: string }>
}

interface ElevesPageClientProps {
  eleves: Eleve[]
  total: number
}

const getProgressionColor = (progression: number) => {
  if (progression >= 80) return 'text-[rgb(var(--success))]'
  if (progression >= 50) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}

const getMoyenneColor = (moyenne: number) => {
  if (moyenne >= 16) return 'text-[rgb(var(--success))]'
  if (moyenne >= 12) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}

const getStatutBadgeClass = (statut: string) => {
  switch (statut) {
    case 'EN_COURS':
      return 'badge-success'
    case 'TERMINE':
      return 'badge-info'
    case 'ABANDONNE':
      return 'badge-error'
    case 'SUSPENDU':
      return 'badge-warning'
    default:
      return 'badge-info'
  }
}

export function ElevesPageClient({ eleves, total }: ElevesPageClientProps) {
  const [selectedEleveId, setSelectedEleveId] = useState<number | null>(null)

  return (
    <>
      {/* Total élèves */}
      <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
              Total élèves en formation
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{total}</p>
          </div>
        </div>
      </div>

      {/* Tableau élèves */}
      <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Élève
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Formation
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Progression
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Moyenne
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Heures
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Absences
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Alertes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(var(--border),0.3)]">
              {eleves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[rgb(var(--muted-foreground))]">
                    Aucun élève trouvé
                  </td>
                </tr>
              ) : (
                eleves.map((eleve) => (
                  <tr
                    key={eleve.id}
                    onClick={() => setSelectedEleveId(eleve.id)}
                    className="hover:bg-[rgb(var(--secondary))] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                          {eleve.prenom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">
                            {eleve.prenom} {eleve.nom}
                          </p>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">{eleve.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[rgb(var(--foreground))]">{eleve.formation}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{eleve.session}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden w-24">
                          <div
                            className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all"
                            style={{ width: `${eleve.progression}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getProgressionColor(eleve.progression)}`}>
                          {eleve.progression}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${getMoyenneColor(eleve.moyenne)}`}>
                        {eleve.moyenne.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[rgb(var(--foreground))]">
                        {eleve.heures_effectuees}/{eleve.heures_totales}h
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          eleve.absences >= 3
                            ? 'text-[rgb(var(--error))] font-bold'
                            : 'text-[rgb(var(--foreground))]'
                        }`}
                      >
                        {eleve.absences}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {eleve.hasAlert && (
                        <div className="relative group">
                          <AlertTriangle className="w-5 h-5 text-[rgb(var(--error))]" />
                          <div className="absolute z-10 invisible group-hover:visible bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg shadow-lg p-2 whitespace-nowrap bottom-full mb-2 left-0">
                            {eleve.alertes.map((alerte, idx) => (
                              <p key={idx} className="text-xs text-[rgb(var(--foreground))]">
                                {alerte.message}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détail élève */}
      {selectedEleveId && (
        <EleveDetailModal
          eleveId={selectedEleveId}
          onClose={() => setSelectedEleveId(null)}
        />
      )}
    </>
  )
}