/**
 * Composant de filtres pour la liste des formateurs
 * Gestion des filtres server-side via URL params
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react'

interface FormateursFiltersProps {
  statuts: string[]
  specialites: string[]
}

export function FormateursFilters({ statuts, specialites }: FormateursFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // États locaux pour les inputs
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const currentStatut = searchParams.get('statut') || ''
  const currentSpecialite = searchParams.get('specialite') || ''
  const currentConformite = searchParams.get('conformeQualiopi') || ''

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || value === 'TOUS' || value === 'TOUTES') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/admin/formateurs?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Barre de recherche */}
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-[rgb(var(--accent))]"
          />
        </div>
      </div>

      {/* Filtre Statut */}
      <div className="min-w-[180px]">
        <select
          value={currentStatut}
          onChange={(e) => handleFilterChange('statut', e.target.value)}
          className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-[rgb(var(--accent))]"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="ARRET_MALADIE">Arrêt maladie</option>
          <option value="EN_COURS_INTEGRATION">En cours d'intégration</option>
          {statuts.map(statut => (
            !['ACTIF', 'INACTIF', 'ARRET_MALADIE', 'EN_COURS_INTEGRATION'].includes(statut) && (
              <option key={statut} value={statut}>
                {statut.replace(/_/g, ' ')}
              </option>
            )
          ))}
        </select>
      </div>

      {/* Filtre Spécialité */}
      <div className="min-w-[200px]">
        <select
          value={currentSpecialite}
          onChange={(e) => handleFilterChange('specialite', e.target.value)}
          className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-[rgb(var(--accent))]"
        >
          <option value="">Toutes les spécialités</option>
          {specialites.map(specialite => (
            <option key={specialite} value={specialite}>
              {specialite.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre Conformité Qualiopi */}
      <div className="min-w-[200px]">
        <select
          value={currentConformite}
          onChange={(e) => handleFilterChange('conformeQualiopi', e.target.value)}
          className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-[rgb(var(--accent))]"
        >
          <option value="">Conformité Qualiopi</option>
          <option value="true">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
              Conforme
            </span>
          </option>
          <option value="false">
            <span className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-[rgb(var(--error))]" />
              Non conforme
            </span>
          </option>
        </select>
      </div>

      {/* Indicateur de filtres actifs */}
      {(currentStatut || currentSpecialite || currentConformite || searchTerm) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--accent))]/10 rounded-lg">
          <Filter className="w-4 h-4 text-[rgb(var(--accent))]" />
          <span className="text-sm text-[rgb(var(--text-secondary))]">
            Filtres actifs
          </span>
          <button
            onClick={() => {
              setSearchTerm('')
              router.push('/admin/formateurs')
            }}
            className="ml-2 text-sm text-[rgb(var(--accent))] hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  )
}