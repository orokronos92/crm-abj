/**
 * Composant Filtres pour les notifications formateur
 */

'use client'

import { Search, Filter, BookOpen } from 'lucide-react'

interface NotificationFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  categorieFilter: string
  onCategorieChange: (value: string) => void
}

// Catégories pertinentes pour un formateur
const CATEGORIES_FORMATEUR = [
  'TOUTES',
  'PLANNING',
  'EVALUATION',
  'ABSENCE',
  'ELEVE',
  'SESSION',
  'COURS',
  'ALERTE',
  'DISPONIBILITE'
]

export function NotificationFilters({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  categorieFilter,
  onCategorieChange
}: NotificationFiltersProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Rechercher dans les notifications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
          />
        </div>

        {/* Filtre par catégorie */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <select
            value={categorieFilter}
            onChange={(e) => onCategorieChange(e.target.value)}
            className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            {CATEGORIES_FORMATEUR.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'TOUTES' ? 'Toutes catégories' : cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par priorité/état */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            <option value="TOUTES">Toutes</option>
            <option value="NON_LUES">Non lues</option>
            <option value="URGENTE">Urgentes</option>
            <option value="HAUTE">Haute priorité</option>
            <option value="NORMALE">Normale</option>
            <option value="BASSE">Basse priorité</option>
          </select>
        </div>
      </div>
    </div>
  )
}