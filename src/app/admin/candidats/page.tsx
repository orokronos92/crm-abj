export const dynamic = 'force-dynamic'

/**
 * Page Candidats
 * Server Component - Gestion des candidatures
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Users } from 'lucide-react'
import { CandidatService } from '@/services/candidat.service'
import { CandidatsFilters } from '@/components/admin/CandidatsFilters'
import { CandidatsPageClient } from '@/components/admin/CandidatsPageClient'

interface CandidatsPageProps {
  searchParams: Promise<{
    statutDossier?: string
    statutFinancement?: string
    formation?: string
    search?: string
  }>
}

export default async function CandidatsPage({ searchParams }: CandidatsPageProps) {
  const candidatService = new CandidatService()
  const params = await searchParams
  const { statutDossier, statutFinancement, formation, search } = params

  // Récupérer les candidats avec filtres
  const { candidats, total } = await candidatService.getCandidats({
    statutDossier,
    statutFinancement,
    formation,
    search,
    take: 100
  })

  // Récupérer les valeurs pour les filtres
  const filterValues = await candidatService.getFilterValues()

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Filtres - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Candidats</h1>
              <p className="text-[rgb(var(--muted-foreground))] mt-1">
                Gestion des candidatures et parcours d'admission
              </p>
            </div>
          </div>

          {/* Total candidats */}
          <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
                <Users className="w-6 h-6 text-[rgb(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
                  Total candidats
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{total}</p>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <CandidatsFilters
            statutsDossier={filterValues.statutsDossier}
            statutsFinancement={filterValues.statutsFinancement}
            formations={filterValues.formations}
          />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* Tableau candidats */}
          <CandidatsPageClient candidats={candidats} total={total} />
        </div>
      </div>
    </DashboardLayout>
  )
}
