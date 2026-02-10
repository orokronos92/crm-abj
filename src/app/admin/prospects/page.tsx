/**
 * Page Prospects
 * Liste et gestion des prospects
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProspectsPageClient } from '@/components/admin/ProspectsPageClient'
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Prospects</h1>
          <Link href="/admin/prospects/nouveau">
            <button className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau prospect
            </button>
          </Link>
        </div>

        {/* Card total prospects */}
        <div className="mb-4 p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
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
      </div>

      {/* Composant client pour le tableau interactif */}
      <ProspectsPageClient prospects={prospects} total={total} />
    </DashboardLayout>
  )
}
