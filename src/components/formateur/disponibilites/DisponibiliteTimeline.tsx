/**
 * Timeline annuelle des disponibilités formateur
 * Affichage 12 mois avec code couleur
 */

'use client'

import { Calendar, BookOpen } from 'lucide-react'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

interface DisponibiliteTimelineProps {
  anneeSelectionnee: number
  disponibilites: any[]
  sessions: any[]
  onMonthClick: (mois: number) => void
}

export function DisponibiliteTimeline({
  anneeSelectionnee,
  disponibilites,
  sessions,
  onMonthClick,
}: DisponibiliteTimelineProps) {
  // Fonction helper pour vérifier si une session est active un mois donné
  const getSessionCeMois = (moisIdx: number) => {
    return sessions.find((session) => {
      const debut = new Date(session.dateDebut)
      const fin = new Date(session.dateFin)
      const moisCourant = new Date(anneeSelectionnee, moisIdx, 1)
      return debut <= moisCourant && fin >= moisCourant
    })
  }

  // Fonction helper pour compter les disponibilités par mois
  const getDisposCeMois = (moisIdx: number) => {
    return disponibilites.filter((dispo) => {
      const date = new Date(dispo.date)
      return (
        date.getMonth() === moisIdx &&
        date.getFullYear() === anneeSelectionnee &&
        dispo.typeDisponibilite === 'DISPONIBLE'
      )
    })
  }

  // Fonction helper pour compter les indisponibilités
  const getIndisposCeMois = (moisIdx: number) => {
    return disponibilites.filter((dispo) => {
      const date = new Date(dispo.date)
      return (
        date.getMonth() === moisIdx &&
        date.getFullYear() === anneeSelectionnee &&
        dispo.typeDisponibilite === 'INDISPONIBLE'
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Header avec noms des mois */}
      <div className="grid grid-cols-12 gap-1 mb-2">
        {MOIS.map((mois, idx) => (
          <div key={idx} className="text-center text-xs font-medium text-[rgb(var(--muted-foreground))]">
            {mois}
          </div>
        ))}
      </div>

      {/* Grille 12 mois */}
      <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }).map((_, moisIdx) => {
            const sessionCeMois = getSessionCeMois(moisIdx)
            const disposCeMois = getDisposCeMois(moisIdx)
            const indisposCeMois = getIndisposCeMois(moisIdx)

            const nbDispos = disposCeMois.length
            const nbIndispos = indisposCeMois.length
            const enSession = !!sessionCeMois

            return (
              <div
                key={moisIdx}
                onClick={() => onMonthClick(moisIdx)}
                className="h-14 rounded border border-[rgba(var(--border),0.3)] relative overflow-hidden cursor-pointer hover:border-[rgb(var(--accent))] transition-all group"
                style={{
                  backgroundColor: enSession
                    ? 'rgba(234, 179, 8, 0.15)' // Jaune pour session
                    : nbDispos > 0
                    ? 'rgba(34, 197, 94, 0.15)' // Vert pour disponible
                    : nbIndispos > 0
                    ? 'rgba(239, 68, 68, 0.15)' // Rouge pour indisponible
                    : 'transparent',
                  borderColor: enSession
                    ? 'rgba(234, 179, 8, 0.4)'
                    : nbDispos > 0
                    ? 'rgba(34, 197, 94, 0.4)'
                    : nbIndispos > 0
                    ? 'rgba(239, 68, 68, 0.4)'
                    : 'rgba(var(--border), 0.3)',
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {enSession ? (
                    <>
                      <BookOpen
                        className="w-4 h-4 mb-0.5"
                        style={{ color: 'rgb(234, 179, 8)' }}
                      />
                      <span className="text-[10px] font-medium" style={{ color: 'rgb(234, 179, 8)' }}>
                        Session
                      </span>
                    </>
                  ) : nbDispos > 0 ? (
                    <>
                      <span className="text-xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>
                        {nbDispos}
                      </span>
                      <span className="text-[10px]" style={{ color: 'rgb(34, 197, 94)' }}>
                        {nbDispos === 1 ? 'jour' : 'jours'}
                      </span>
                    </>
                  ) : nbIndispos > 0 ? (
                    <>
                      <span className="text-xl font-bold" style={{ color: 'rgb(239, 68, 68)' }}>
                        {nbIndispos}
                      </span>
                      <span className="text-[10px]" style={{ color: 'rgb(239, 68, 68)' }}>
                        indispo
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">—</span>
                  )}
                </div>

                {/* Tooltip au survol */}
                {sessionCeMois && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg p-3 shadow-lg whitespace-nowrap">
                      <p className="text-xs font-bold text-[rgb(var(--foreground))]">
                        {sessionCeMois.nomSession}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {new Date(sessionCeMois.dateDebut).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(sessionCeMois.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* Stats résumé */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-[rgba(34,197,94,0.05)] rounded-lg border border-[rgba(34,197,94,0.2)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Jours disponibles</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>
            {disponibilites.filter((d) => d.typeDisponibilite === 'DISPONIBLE').length}
          </p>
        </div>

        <div className="p-4 bg-[rgba(234,179,8,0.05)] rounded-lg border border-[rgba(234,179,8,0.2)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Sessions en cours</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(234, 179, 8)' }}>
            {sessions.length}
          </p>
        </div>

        <div className="p-4 bg-[rgba(239,68,68,0.05)] rounded-lg border border-[rgba(239,68,68,0.2)]">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Jours indisponibles</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(239, 68, 68)' }}>
            {disponibilites.filter((d) => d.typeDisponibilite === 'INDISPONIBLE').length}
          </p>
        </div>
      </div>
    </div>
  )
}
