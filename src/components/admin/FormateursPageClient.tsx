/**
 * Composant client pour l'affichage de la liste des formateurs
 * Tableau interactif avec ouverture du modal détail
 */

'use client'

import { useState } from 'react'
import { User, Users, Award, AlertTriangle, Clock, FileText, Euro } from 'lucide-react'
import { FormateurDetailModal } from './FormateurDetailModal'

interface Formateur {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  specialites: string[]
  statut: string
  elevesActifs: number
  sessionsActives: number
  heuresHebdo: number
  tauxHoraire: number
  conformeQualiopi: boolean
  documentsManquants: number
  dateProchaineCertification: string | null
  satisfactionMoyenne: number
}

interface FormateursPageClientProps {
  formateurs: Formateur[]
  total: number
}

export function FormateursPageClient({ formateurs, total }: FormateursPageClientProps) {
  const [selectedFormateurId, setSelectedFormateurId] = useState<number | null>(null)

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      ACTIF: 'badge-success',
      INACTIF: 'badge-error',
      ARRET_MALADIE: 'badge-warning',
      EN_COURS_INTEGRATION: 'badge-info'
    }
    return colors[statut] || 'badge'
  }

  const getQualiopiStatus = (conforme: boolean, documentsManquants: number) => {
    if (conforme) {
      return (
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-[rgb(var(--success))]" />
          <span className="text-xs text-[rgb(var(--success))]">Conforme</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1">
        <AlertTriangle className="w-4 h-4 text-[rgb(var(--error))]" />
        <span className="text-xs text-[rgb(var(--error))]">
          {documentsManquants} doc{documentsManquants > 1 ? 's' : ''} manquant{documentsManquants > 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-[rgb(var(--card))] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[rgb(var(--secondary))] border-b border-[rgba(var(--border),0.3)]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Formateur
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Spécialités
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Statut
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Élèves
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Sessions
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Heures/sem
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Taux horaire
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Qualiopi
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Proch. certif
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(var(--border),0.2)]">
            {formateurs.map((formateur) => (
              <tr
                key={formateur.id}
                onClick={() => setSelectedFormateurId(formateur.id)}
                className="hover:bg-[rgba(var(--accent),0.05)] cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgba(var(--accent),0.6)] flex items-center justify-center text-white font-medium">
                      {formateur.prenom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formateur.prenom} {formateur.nom}
                      </p>
                      <p className="text-sm text-[rgb(var(--text-tertiary))]">
                        {formateur.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {formateur.specialites.slice(0, 2).map(specialite => (
                      <span
                        key={specialite}
                        className="px-2 py-1 text-xs bg-[rgb(var(--secondary))] rounded"
                      >
                        {specialite.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {formateur.specialites.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-[rgb(var(--secondary))] rounded">
                        +{formateur.specialites.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${getStatutColor(formateur.statut)}`}>
                    {formateur.statut.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">{formateur.elevesActifs}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium">{formateur.sessionsActives}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                    <span>{formateur.heuresHebdo}h</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Euro className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">{formateur.tauxHoraire.toFixed(0)}€</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getQualiopiStatus(formateur.conformeQualiopi, formateur.documentsManquants)}
                </td>
                <td className="px-6 py-4 text-center">
                  {formateur.dateProchaineCertification ? (
                    <span className="text-sm">
                      {formateur.dateProchaineCertification}
                    </span>
                  ) : (
                    <span className="text-sm text-[rgb(var(--text-tertiary))]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message si aucun formateur */}
      {formateurs.length === 0 && (
        <div className="py-12 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--text-tertiary))]" />
          <p className="text-[rgb(var(--text-secondary))]">Aucun formateur trouvé</p>
          <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
            Modifiez vos filtres ou ajoutez un nouveau formateur
          </p>
        </div>
      )}

      {/* Footer avec total */}
      <div className="px-6 py-3 border-t border-[rgba(var(--border),0.2)] bg-[rgb(var(--secondary))]">
        <p className="text-sm text-[rgb(var(--text-tertiary))]">
          {total} formateur{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Modal détail formateur */}
      {selectedFormateurId && (
        <FormateurDetailModal
          formateurId={selectedFormateurId}
          onClose={() => setSelectedFormateurId(null)}
        />
      )}
    </div>
  )
}