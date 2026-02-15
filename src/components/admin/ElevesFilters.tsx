'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, GraduationCap, Users, AlertTriangle } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'

interface ElevesFiltersProps {
  formations: Array<{ codeFormation: string; nom: string }>
  formateurs: Array<{ id: number; label: string }>
  statuts: string[]
}

export function ElevesFilters({ formations, formateurs, statuts }: ElevesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // État local pour éviter les requêtes multiples
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'TOUS') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/admin/eleves?${params.toString()}`)
  }

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('search', searchTerm)
      } else {
        params.delete('search')
      }
      router.push(`/admin/eleves?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, router, searchParams])

  const toggleAlert = () => {
    const params = new URLSearchParams(searchParams.toString())
    const hasAlert = params.get('hasAlert') === 'true'
    if (hasAlert) {
      params.delete('hasAlert')
    } else {
      params.set('hasAlert', 'true')
    }
    router.push(`/admin/eleves?${params.toString()}`)
  }

  const currentFormation = searchParams.get('formation') || 'TOUS'
  const currentFormateur = searchParams.get('formateur') || 'TOUS'
  const currentStatut = searchParams.get('statut') || 'TOUS'
  const hasAlert = searchParams.get('hasAlert') === 'true'

  return (
    <div className="flex flex-wrap gap-4">
      {/* Recherche */}
      <div className="flex-1 min-w-[250px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Rechercher un élève..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
        />
      </div>

      {/* Filtre Formation */}
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))] pointer-events-none" />
        <select
          value={currentFormation}
          onChange={(e) => handleFilterChange('formation', e.target.value)}
          className="pl-10 pr-8 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] appearance-none cursor-pointer"
        >
          <option value="TOUS">Toutes les formations</option>
          {formations.map((formation) => (
            <option key={formation.codeFormation} value={formation.codeFormation}>
              {formation.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre Formateur */}
      <div className="relative">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))] pointer-events-none" />
        <select
          value={currentFormateur}
          onChange={(e) => handleFilterChange('formateur', e.target.value)}
          className="pl-10 pr-8 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] appearance-none cursor-pointer"
        >
          <option value="TOUS">Tous les formateurs</option>
          {formateurs.map((formateur) => (
            <option key={formateur.id} value={formateur.id}>
              {formateur.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre Statut */}
      <select
        value={currentStatut}
        onChange={(e) => handleFilterChange('statut', e.target.value)}
        className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] appearance-none cursor-pointer"
      >
        <option value="TOUS">Tous les statuts</option>
        {statuts.map((statut) => (
          <option key={statut} value={statut}>
            {statut.replace('_', ' ')}
          </option>
        ))}
      </select>

      {/* Bouton Alertes */}
      <button
        onClick={toggleAlert}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
          hasAlert
            ? 'bg-[rgba(var(--error),0.1)] border-[rgba(var(--error),0.3)] text-[rgb(var(--error))]'
            : 'bg-[rgb(var(--secondary))] border-[rgba(var(--accent),0.1)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
        }`}
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium">Alertes uniquement</span>
      </button>
    </div>
  )
}