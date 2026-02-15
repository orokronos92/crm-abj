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
    formateur: params.formateur ? Number(params.formateur) : undefined,
    statut: params.statut,
    alertes: params.alertes === 'true' ? true : undefined,
    take: 100
  })

  // Récupération des valeurs pour les filtres
  const filterValues = await eleveService.getFilterValues()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Élèves</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion des élèves en formation active
            </p>
          </div>
        </div>

        {/* Filtres */}
        <ElevesFilters
          formations={filterValues.formations}
          formateurs={filterValues.formateurs}
          statuts={filterValues.statuts}
        />

        {/* Tableau et modal */}
        <ElevesPageClient
          eleves={eleves}
          total={total}
        />
      </div>
    </DashboardLayout>
  )
}