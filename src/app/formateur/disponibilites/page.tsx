/**
 * Page Disponibilités Formateur
 * Gestion des disponibilités sur 2 ans avec timeline interactive
 */

'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DisponibiliteTimeline } from '@/components/formateur/disponibilites/DisponibiliteTimeline'
import { DisponibiliteMonthModal } from '@/components/formateur/disponibilites/DisponibiliteMonthModal'
import { Calendar, Info } from 'lucide-react'

export default function DisponibilitesPage() {
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(2026)
  const [disponibilites, setDisponibilites] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // État modal
  const [monthModalOpen, setMonthModalOpen] = useState<{
    mois: number
    annee: number
  } | null>(null)

  // Récupération données
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // TODO: Remplacer par vraies API calls
        // const resDispos = await fetch(`/api/formateur/disponibilites?annee=${anneeSelectionnee}`)
        // const resSessions = await fetch(`/api/formateur/sessions?annee=${anneeSelectionnee}`)

        // Mock data temporaire
        setDisponibilites([])
        setSessions([])
      } catch (error) {
        console.error('Erreur chargement disponibilités:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [anneeSelectionnee])

  const handleMonthClick = (mois: number) => {
    setMonthModalOpen({ mois, annee: anneeSelectionnee })
  }

  const handleSaveDispo = async (date: string, creneau: string, statut: string) => {
    // TODO: API call POST/PATCH
    console.log('Sauvegarde dispo:', { date, creneau, statut })
    // Recharger les données
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              Mes Disponibilités
            </h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Gérez vos créneaux disponibles sur 2 ans
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--muted-foreground))]">Année</span>
            <select
              value={anneeSelectionnee}
              onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
              className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
              <option value={2029}>2029</option>
              <option value={2030}>2030</option>
            </select>
          </div>
        </div>

        {/* Info box */}
        <div className="card p-4 bg-[rgba(var(--accent),0.05)] border-[rgba(var(--accent),0.2)]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[rgb(var(--foreground))]">
              <p className="font-medium mb-1">Comment ça marche ?</p>
              <p className="text-[rgb(var(--muted-foreground))]">
                Cliquez sur un mois pour voir le détail jour par jour. Vous pouvez ajouter ou retirer des disponibilités.
                Les sessions en cours (rouge) ne peuvent pas être modifiées sans accord de la direction.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-[rgb(var(--muted-foreground))]">
                <Calendar className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Chargement des disponibilités...</span>
              </div>
            </div>
          ) : (
            <DisponibiliteTimeline
              anneeSelectionnee={anneeSelectionnee}
              disponibilites={disponibilites}
              sessions={sessions}
              onMonthClick={handleMonthClick}
            />
          )}
        </div>

        {/* Légende */}
        <div className="card p-4">
          <div className="flex items-center gap-8 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.4)]"></div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.4)]"></div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Session en cours (verrouillée)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.4)]"></div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Indisponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {monthModalOpen && (
        <DisponibiliteMonthModal
          mois={monthModalOpen.mois}
          annee={monthModalOpen.annee}
          disponibilites={disponibilites}
          sessions={sessions}
          onClose={() => setMonthModalOpen(null)}
          onAddDispo={handleSaveDispo}
        />
      )}
    </DashboardLayout>
  )
}
