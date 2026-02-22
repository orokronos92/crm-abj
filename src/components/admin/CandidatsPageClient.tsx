/**
 * CandidatsPageClient
 * Client Component pour la liste des candidats avec tableau interactif
 */

'use client'

import { useState } from 'react'
import { STATUT_DOSSIER_COLORS, STATUT_FINANCEMENT_COLORS } from '@/services/candidat.service'
import { CandidatDetailModal } from './CandidatDetailModal'

interface Candidat {
  id: number
  numero_dossier: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formation: string
  session: string
  statut_dossier: string
  statut_financement: string
  score: number
  date_candidature: string
}

interface CandidatsPageClientProps {
  candidats: Candidat[]
  total: number
}

export function CandidatsPageClient({ candidats: initialCandidats, total: initialTotal }: CandidatsPageClientProps) {
  const [candidats, setCandidats] = useState<Candidat[]>(initialCandidats)
  const [total, setTotal] = useState(initialTotal)
  const [selectedCandidatId, setSelectedCandidatId] = useState<number | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[rgb(var(--success))]'
    if (score >= 60) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  // Éjecter un candidat de la liste locale (après conversion élève ou refus)
  const handleCandidatEjecte = (candidatId: number) => {
    setCandidats(prev => prev.filter(c => c.id !== candidatId))
    setTotal(prev => Math.max(0, prev - 1))
    setSelectedCandidatId(null)
  }

  return (
    <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden">
      {/* Compteur */}
      {total > 0 && (
        <div className="px-6 py-3 border-b border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] text-sm text-[rgb(var(--muted-foreground))]">
          {total} candidat{total > 1 ? 's' : ''}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Candidat
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                N° Dossier
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Formation
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Statut dossier
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Statut financement
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Score
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                Date candidature
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(var(--border),0.3)]">
            {candidats.map((candidat) => (
              <tr
                key={candidat.id}
                onClick={() => setSelectedCandidatId(candidat.id)}
                className="hover:bg-[rgb(var(--secondary))] cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                      {candidat.prenom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(var(--foreground))]">
                        {candidat.prenom} {candidat.nom}
                      </p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">{candidat.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-[rgb(var(--accent))]">
                    {candidat.numero_dossier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[rgb(var(--foreground))]">{candidat.formation}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{candidat.session}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      STATUT_DOSSIER_COLORS[
                        candidat.statut_dossier as keyof typeof STATUT_DOSSIER_COLORS
                      ] || 'badge-info'
                    }`}
                  >
                    {candidat.statut_dossier.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      STATUT_FINANCEMENT_COLORS[
                        candidat.statut_financement as keyof typeof STATUT_FINANCEMENT_COLORS
                      ] || 'badge-warning'
                    }`}
                  >
                    {candidat.statut_financement.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-lg font-bold ${getScoreColor(candidat.score)}`}>
                    {candidat.score}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[rgb(var(--foreground))]">
                    {candidat.date_candidature}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {candidats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--muted-foreground))]">Aucun candidat trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détail candidat */}
      {selectedCandidatId && (
        <CandidatDetailModal
          candidatId={selectedCandidatId}
          onClose={() => setSelectedCandidatId(null)}
          onCandidatEjecte={handleCandidatEjecte}
        />
      )}
    </div>
  )
}
