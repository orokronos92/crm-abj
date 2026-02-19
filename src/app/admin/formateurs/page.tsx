export const dynamic = 'force-dynamic'

/**
 * Page Formateurs (Server Component)
 * Liste des formateurs avec fiche détaillée conforme Qualiopi
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FormateursFilters } from '@/components/admin/FormateursFilters'
import { FormateursPageClient } from '@/components/admin/FormateursPageClient'
import { FormateurService } from '@/services/formateur.service'
import { FormateursPageHeader } from '@/components/admin/FormateursPageHeader'
import { Award, Users, BookOpen, Star } from 'lucide-react'

interface FormateursPageProps {
  searchParams: Promise<{
    statut?: string
    specialite?: string
    conformeQualiopi?: string
    search?: string
  }>
}

export default async function FormateursPage({ searchParams }: FormateursPageProps) {
  const formateurService = new FormateurService()
  const params = await searchParams

  // Récupération des données depuis la base
  const [
    { formateurs, total },
    filterValues,
    globalStats
  ] = await Promise.all([
    formateurService.getFormateurs({
      statut: params.statut,
      specialite: params.specialite,
      conformeQualiopi: params.conformeQualiopi === 'true' ? true : params.conformeQualiopi === 'false' ? false : undefined,
      search: params.search,
      take: 100
    }),
    formateurService.getFilterValues(),
    formateurService.getGlobalStats()
  ])

  // Calculs pour les statistiques
  const totalEleves = formateurs.reduce((sum, f) => sum + f.elevesActifs, 0)
  const totalSessions = formateurs.reduce((sum, f) => sum + f.sessionsActives, 0)
  const satisfactionMoyenne = formateurs.length > 0
    ? formateurs.reduce((sum, f) => sum + f.satisfactionMoyenne, 0) / formateurs.length
    : 0

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Filtres - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          {/* Header avec bouton créer */}
          <FormateursPageHeader />

          {/* Statistiques globales */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Total formateurs</p>
                  <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                    {globalStats.totalFormateurs}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                    {globalStats.formateursActifs} actifs
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgba(var(--accent),0.6)] flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves suivis</p>
                  <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                    {globalStats.totalEleves}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                    Tous formateurs confondus
                  </p>
                </div>
                <Users className="w-6 h-6 text-[rgb(var(--accent))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions actives</p>
                  <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                    {globalStats.sessionsActives}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                    En cours ou confirmées
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-[rgb(var(--accent))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Documents manquants</p>
                  <p className={`text-3xl font-bold mt-1 ${
                    globalStats.documentsManquants > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'
                  }`}>
                    {globalStats.documentsManquants}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                    Pour conformité Qualiopi
                  </p>
                </div>
                <Star className={`w-6 h-6 ${
                  globalStats.documentsManquants > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'
                }`} />
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <FormateursFilters
            statuts={filterValues.statuts}
            specialites={filterValues.specialites}
          />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* Table formateurs */}
          <FormateursPageClient
            formateurs={formateurs}
            total={total}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}