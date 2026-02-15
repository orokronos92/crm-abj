/**
 * Composant Filtres pour les notifications élève
 */

'use client'

import { Search, Filter, BookOpen } from 'lucide-react'

interface NotificationFiltersEleveProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  categorieFilter: string
  onCategorieChange: (value: string) => void
}

// Catégories pertinentes pour un élève
const CATEGORIES_ELEVE = [
  'TOUTES',
  'COURS',
  'EVALUATION',
  'PLANNING',
  'DOCUMENT',
  'PAIEMENT',
  'SESSION',
  'ALERTE',
  'FORMATION'
]

export function NotificationFiltersEleve({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  categorieFilter,
  onCategorieChange
}: NotificationFiltersEleveProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Rechercher dans mes notifications..."
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
            {CATEGORIES_ELEVE.map(cat => (
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
            <option value="URGENTE">Importantes</option>
            <option value="HAUTE">Priorité haute</option>
            <option value="NORMALE">Normale</option>
            <option value="BASSE">Priorité basse</option>
          </select>
        </div>
      </div>
    </div>
  )
}