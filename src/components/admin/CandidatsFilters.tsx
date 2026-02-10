/**
 * CandidatsFilters
 * Composant de filtres pour la page Candidats (Client Component)
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface CandidatsFiltersProps {
  statutsDossier: string[]
  statutsFinancement: string[]
  formations: Array<{ code: string; label: string }>
}

export function CandidatsFilters({ statutsDossier, statutsFinancement, formations }: CandidatsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const currentStatutDossier = searchParams.get('statutDossier') || 'TOUS'
  const currentStatutFinancement = searchParams.get('statutFinancement') || 'TOUS'
  const currentFormation = searchParams.get('formation') || 'TOUS'

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || value === 'TOUS') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/admin/candidats?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value === '') {
      params.delete('search')
    } else {
      params.set('search', value)
    }

    router.push(`/admin/candidats?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      {/* Barre de recherche */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Rechercher un candidat (nom, email, n° dossier)..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
        />
      </div>

      {/* Filtre Statut Dossier */}
      <select
        value={currentStatutDossier}
        onChange={(e) => handleFilterChange('statutDossier', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="TOUS">Tous les dossiers</option>
        {statutsDossier.map((statut) => (
          <option key={statut} value={statut}>
            {statut.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      {/* Filtre Statut Financement */}
      <select
        value={currentStatutFinancement}
        onChange={(e) => handleFilterChange('statutFinancement', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="TOUS">Tous les financements</option>
        {statutsFinancement.map((statut) => (
          <option key={statut} value={statut}>
            {statut.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      {/* Filtre Formation */}
      <select
        value={currentFormation}
        onChange={(e) => handleFilterChange('formation', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="TOUS">Toutes les formations</option>
        {formations.map((formation) => (
          <option key={formation.code} value={formation.code}>
            {formation.label}
          </option>
        ))}
      </select>
    </div>
  )
}
