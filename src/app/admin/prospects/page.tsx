export const dynamic = 'force-dynamic'

/**
 * Page Prospects
 * Liste et gestion des prospects
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProspectsPageClient } from '@/components/admin/ProspectsPageClient'
import { ProspectsFilters } from '@/components/admin/ProspectsFilters'
import { ProspectService } from '@/services/prospect.service'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'

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

  // Récupération des formations actives depuis la BDD
  const formationsRef = await prisma.formation.findMany({
    where: { actif: true },
    select: { codeFormation: true, nom: true },
    orderBy: { nom: 'asc' }
  })
  const formations = formationsRef.map(f => ({ code: f.codeFormation, label: f.nom }))

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

          {/* Filtres de recherche */}
          <ProspectsFilters formations={formations} />
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
