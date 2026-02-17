/**
 * ProspectsFilters
 * Composant client pour gérer les filtres avec URL params
 * Filtres toujours visibles à côté de la barre de recherche (comme Candidats)
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function ProspectsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || value === 'TOUS') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/admin/prospects?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value === '') {
      params.delete('search')
    } else {
      params.set('search', value)
    }

    router.push(`/admin/prospects?${params.toString()}`)
  }

  const currentStatut = searchParams.get('statut') || ''
  const currentFormation = searchParams.get('formation') || ''
  const currentFinancement = searchParams.get('financement') || ''

  return (
    <div className="flex gap-4">
      {/* Barre de recherche */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Rechercher un prospect (nom, email, téléphone)..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
        />
      </div>

      {/* Filtre Statut */}
      <select
        value={currentStatut}
        onChange={(e) => handleFilterChange('statut', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="">Disponibles (hors actifs)</option>
        <option value="NOUVEAU">Nouveau</option>
        <option value="EN_ATTENTE_DOSSIER">En attente dossier</option>
        <option value="ANCIEN_CANDIDAT">Ancien candidat</option>
        <option value="ANCIEN_ELEVE">Ancien élève</option>
        <option value="CANDIDAT">Candidat (actif)</option>
        <option value="ELEVE">Élève (en formation)</option>
        <option value="TOUS">Tous les statuts</option>
      </select>

      {/* Filtre Formation */}
      <select
        value={currentFormation}
        onChange={(e) => handleFilterChange('formation', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="">Toutes les formations</option>
        <option value="CAP_BJ">CAP Bijouterie-Joaillerie</option>
        <option value="INIT_BJ">Initiation Bijouterie</option>
        <option value="PERF_SERTI">Perfectionnement Sertissage</option>
        <option value="CAO_DAO">CAO/DAO Bijouterie</option>
        <option value="GEMMO">Gemmologie</option>
      </select>

      {/* Filtre Financement */}
      <select
        value={currentFinancement}
        onChange={(e) => handleFilterChange('financement', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
      >
        <option value="">Tous les financements</option>
        <option value="CPF">CPF</option>
        <option value="OPCO">OPCO</option>
        <option value="France Travail">France Travail</option>
        <option value="Personnel">Personnel</option>
      </select>
    </div>
  )
}
