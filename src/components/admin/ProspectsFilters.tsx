/**
 * ProspectsFilters
 * Composant client pour gérer les filtres avec URL params
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { useState } from 'react'

export function ProspectsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/admin/prospects?${params.toString()}`)
  }

  const currentStatut = searchParams.get('statut') || ''
  const currentFormation = searchParams.get('formation') || ''
  const currentFinancement = searchParams.get('financement') || ''

  return (
    <>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`px-4 py-2.5 rounded-lg border ${
          showFilters
            ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] border-[rgb(var(--accent))]'
            : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border-[rgba(var(--border),0.5)]'
        } transition-all flex items-center gap-2`}
      >
        <Filter className="w-5 h-5" />
        Filtres
      </button>

      {/* Filtres détaillés */}
      {showFilters && (
        <div className="mt-4 p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            {/* Filtre Statut */}
            <select
              value={currentStatut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]"
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
              className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]"
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
              className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]"
            >
              <option value="">Tous les financements</option>
              <option value="CPF">CPF</option>
              <option value="OPCO">OPCO</option>
              <option value="France Travail">France Travail</option>
              <option value="Personnel">Personnel</option>
            </select>
          </div>
        </div>
      )}
    </>
  )
}
