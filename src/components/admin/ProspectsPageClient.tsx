/**
 * ProspectsPageClient
 * Wrapper Client Component pour gérer le state du panel
 */

'use client'

import { useState } from 'react'
import { ProspectDetailPanel } from './ProspectDetailPanel'
import { MessageSquare } from 'lucide-react'

interface Prospect {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formationSouhaitee: string
  statut: string
  source: string
  financement: string
  nbEchanges: number
  dernierContact: string
  ville: string
  codePostal: string
}

interface ProspectsPageClientProps {
  prospects: Prospect[]
  total: number
}

const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: 'badge-info',
  EN_ATTENTE: 'badge-warning',
  EN_ATTENTE_DOSSIER: 'badge-warning',
  CANDIDAT: 'badge-warning', // Candidat actif (admission en cours)
  ANCIEN_CANDIDAT: 'badge-error', // Candidat refusé ou abandonné
  ELEVE: 'badge-success', // Élève en formation
  ANCIEN_ELEVE: 'badge-info', // Formation terminée, redevenu prospect
  REFUSE: 'badge-error',
  TIEDE: 'badge-warning',
  CHAUD: 'badge-success',
  FROID: 'badge-info',
  PERDU: 'badge-error',
  INSCRIT: 'badge-success',
  CONTACT: 'badge-info',
}

export function ProspectsPageClient({ prospects: initialProspects, total }: ProspectsPageClientProps) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  const handleProspectConverti = (prospectId: string) => {
    setProspects(prev => prev.filter(p => p.id !== prospectId))
    setSelectedProspectId(null)
  }

  return (
    <div className="flex">
      {/* Liste principale */}
      <div className={`flex-1 flex flex-col ${selectedProspectId ? 'pr-96' : ''}`}>
        {/* Tableau */}
        <div>
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(var(--border),0.3)]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Prospect
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Échanges
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                    Dernier contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--border),0.2)]">
                {prospects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className="hover:bg-[rgba(var(--accent),0.03)] transition-colors cursor-pointer"
                    onClick={() => setSelectedProspectId(prospect.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                          {prospect.prenom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {prospect.prenom} {prospect.nom}
                          </p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            {prospect.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                      {prospect.formationSouhaitee}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          STATUT_COLORS[prospect.statut] || 'badge-info'
                        }`}
                      >
                        {prospect.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                      {prospect.source}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        <span className="text-sm text-[rgb(var(--foreground))]">
                          {prospect.nbEchanges}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                      {prospect.dernierContact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Panel détail latéral */}
      {selectedProspectId && (
        <ProspectDetailPanel
          prospectId={selectedProspectId}
          onClose={() => setSelectedProspectId(null)}
          onProspectConverti={handleProspectConverti}
        />
      )}
    </div>
  )
}
