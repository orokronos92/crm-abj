export const dynamic = 'force-dynamic'

/**
 * Page Prospects
 * Liste et gestion des prospects
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProspectsPageClient } from '@/components/admin/ProspectsPageClient'
import { ProspectsFilters } from '@/components/admin/ProspectsFilters'
import { ProspectService } from '@/services/prospect.service'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

interface ProspectsPageProps {
  searchParams: Promise<{
    statut?: string
    formation?: string
    financement?: string
    search?: string
  }>
}

export default async function ProspectsPage({ searchParams }: ProspectsPageProps) {
  const prospectService = new ProspectService()

  // Récupération des paramètres de recherche
  const params = await searchParams
  const { statut, formation, financement, search } = params

  // Récupération des données depuis la BDD avec filtres
  const { prospects, total } = await prospectService.getProspects({
    take: 100,
    statut,
    formation,
    financement,
    search
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Filtres - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Prospects</h1>
            <Link href="/admin/prospects/nouveau">
              <button className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouveau prospect
              </button>
            </Link>
          </div>

          {/* Card total prospects */}
          <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
                <Users className="w-6 h-6 text-[rgb(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
                  Total prospects
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{total}</p>
              </div>
            </div>
          </div>

          {/* Filtres de recherche */}
          <ProspectsFilters />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* Composant client pour le tableau interactif */}
          <ProspectsPageClient prospects={prospects} total={total} />
        </div>
      </div>
    </DashboardLayout>
  )
}
