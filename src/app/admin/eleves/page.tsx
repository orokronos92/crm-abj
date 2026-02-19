export const dynamic = 'force-dynamic'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EleveService } from '@/services/eleve.service'
import { ElevesPageClient } from '@/components/admin/ElevesPageClient'
import { ElevesFilters } from '@/components/admin/ElevesFilters'

interface ElevesPageProps {
  searchParams: Promise<{
    search?: string
    formation?: string
    formateur?: string
    statut?: string
    alertes?: string
  }>
}

export default async function ElevesPage({ searchParams }: ElevesPageProps) {
  const eleveService = new EleveService()
  const params = await searchParams

  // Récupération des données
  const { eleves, total } = await eleveService.getEleves({
    search: params.search,
    formation: params.formation,
    formateur: params.formateur,
    statut: params.statut,
    hasAlert: params.alertes === 'true' ? true : undefined,
    take: 100
  })

  // Récupération des valeurs pour les filtres
  const filterValues = await eleveService.getFilterValues()

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Filtres - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Élèves</h1>
              <p className="text-[rgb(var(--muted-foreground))] mt-1">
                Gestion des élèves en formation active
              </p>
            </div>
          </div>

          {/* Total élèves */}
          <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgb(var(--primary))]">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
                  Total élèves
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{total}</p>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <ElevesFilters
            formations={filterValues.formations}
            formateurs={filterValues.formateurs}
            statuts={filterValues.statuts}
          />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* Tableau et modal */}
          <ElevesPageClient
            eleves={eleves}
            total={total}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}