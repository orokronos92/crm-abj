/**
 * PlanningWeekView — Timeline hebdomadaire granularité 30 minutes
 * Style Google Calendar : blocs d'événements positionnés en absolute
 * Plage horaire : 08:00 → 21:00 (26 créneaux de 30 min)
 */

'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// --- Constantes ---
const SLOT_HEIGHT = 40      // px par créneau de 30 min
const START_HOUR = 8
const END_HOUR = 21
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2  // 26
const GRID_HEIGHT = SLOT_HEIGHT * TOTAL_SLOTS     // 1040px

// --- Types ---
interface Reservation {
  id: number
  idSession?: number | null
  idEvenement?: number | null
  dateDebut: string
  dateFin: string
  statut: string
}

interface EventBlock {
  id: string
  label: string
  startSlot: number
  endSlot: number
  color: 'success' | 'info' | 'warning' | 'error' | 'accent'
  type: string
}

interface PlanningWeekViewProps {
  mois: number
  annee: number
  sessions: Array<{
    id: number
    codeFormation?: string
    formation?: string
    nom?: string
    dateDebut: string
    dateFin: string
    nbInscrits?: number
  }>
  evenements: Array<{
    idEvenement: number
    titre: string
    date: string
    heureDebut: string
    heureFin: string
    type: string
  }>
  reservations: Reservation[]
}

// --- Couleurs CSS pour chaque type ---
const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(34,197,94,0.25)', border: 'rgb(34,197,94)', text: 'rgb(34,197,94)' },
  info:    { bg: 'rgba(59,130,246,0.25)', border: 'rgb(59,130,246)', text: 'rgb(59,130,246)' },
  warning: { bg: 'rgba(234,179,8,0.25)',  border: 'rgb(234,179,8)',  text: 'rgb(234,179,8)' },
  error:   { bg: 'rgba(239,68,68,0.25)',  border: 'rgb(239,68,68)',  text: 'rgb(239,68,68)' },
  accent:  { bg: 'rgba(212,175,55,0.25)', border: 'rgb(212,175,55)', text: 'rgb(212,175,55)' },
}

/** Convertit une heure HH:MM en index de slot (0 = 08:00, 1 = 08:30, ...) */
function timeToSlot(h: number, m: number): number {
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0)
}

/** Détermine la couleur selon le code formation */
function getColorForFormation(codeFormation: string): EventBlock['color'] {
  if (codeFormation.includes('CAP')) return 'success'
  if (codeFormation.includes('SERTI')) return 'info'
  if (codeFormation.includes('CAO') || codeFormation.includes('DAO')) return 'info'
  return 'accent'
}

/** Génère un acronyme depuis un nom de formation */
function toAcronyme(nom: string): string {
  return nom
    .split(/[\s/\-]+/)
    .filter(Boolean)
    .map((mot: string) => mot[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 4)
}

export function PlanningWeekView({
  mois, annee, sessions, evenements, reservations
}: PlanningWeekViewProps) {

  // --- Navigation semaine ---
  const [semaineOffset, setSemaineOffset] = useState(0)

  // Jours du mois
  const premierDuMois = new Date(annee, mois, 1)
  const dernierDuMois = new Date(annee, mois + 1, 0)
  const nbJours = dernierDuMois.getDate()

  // Découper en semaines (groupes de 7 jours)
  const semaines = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < nbJours; i += 7) {
      const semaine: Date[] = []
      for (let j = i; j < Math.min(i + 7, nbJours); j++) {
        semaine.push(new Date(annee, mois, j + 1))
      }
      result.push(semaine)
    }
    return result
  }, [annee, mois, nbJours])

  const nbSemaines = semaines.length
  const semaineIdx = Math.min(semaineOffset, nbSemaines - 1)
  const joursSemaine = semaines[semaineIdx] || []

  const moisNom = premierDuMois.toLocaleDateString('fr-FR', { month: 'long' })

  // Labels heures pour la colonne gauche
  const heureLabels = useMemo(() => {
    const labels: { heure: string; estHeurePleine: boolean }[] = []
    for (let h = START_HOUR; h < END_HOUR; h++) {
      labels.push({ heure: `${String(h).padStart(2, '0')}:00`, estHeurePleine: true })
      labels.push({ heure: `${String(h).padStart(2, '0')}:30`, estHeurePleine: false })
    }
    return labels
  }, [])

  // --- Construction des blocs par jour ---
  const blocksParJour = useMemo(() => {
    const result: Map<number, EventBlock[]> = new Map()

    for (const jour of joursSemaine) {
      const jourNum = jour.getDate()
      const blocks: EventBlock[] = []

      // 1. Réservations (priorité — précision horaire)
      const reservationsJour = reservations.filter(r => {
        const d = new Date(r.dateDebut)
        return d.getDate() === jourNum && d.getMonth() === mois && d.getFullYear() === annee
      })

      for (const resa of reservationsJour) {
        const dDebut = new Date(resa.dateDebut)
        const dFin = new Date(resa.dateFin)
        const startSlot = timeToSlot(dDebut.getHours(), dDebut.getMinutes())
        const endSlot = timeToSlot(dFin.getHours(), dFin.getMinutes())

        let label = 'Réservé'
        let color: EventBlock['color'] = 'accent'

        if (resa.idSession) {
          const session = sessions.find(s => s.id === resa.idSession)
          if (session) {
            const code = session.codeFormation || ''
            label = toAcronyme(session.formation || session.nom || 'Formation')
            color = getColorForFormation(code)
          }
        } else if (resa.idEvenement) {
          const evt = evenements.find(e => e.idEvenement === resa.idEvenement)
          label = evt ? evt.titre : 'Événement'
          color = 'warning'
        }

        blocks.push({
          id: `resa-${resa.id}`,
          label,
          startSlot: Math.max(0, startSlot),
          endSlot: Math.min(TOTAL_SLOTS, Math.max(endSlot, startSlot + 1)),
          color,
          type: resa.idSession ? 'session' : 'evenement'
        })
      }

      // 2. Événements sans réservation associée
      const evenementsJour = evenements.filter(evt => {
        const d = new Date(evt.date)
        return d.getDate() === jourNum && d.getMonth() === mois && d.getFullYear() === annee
      })
      for (const evt of evenementsJour) {
        // Vérifier qu'il n'est pas déjà couvert par une réservation
        const dejaCouvert = blocks.some(b => b.id.startsWith('resa-') && b.type === 'evenement')
        if (dejaCouvert) continue

        const [hD, mD] = (evt.heureDebut || '09:00').split(':').map(Number)
        const [hF, mF] = (evt.heureFin || '17:00').split(':').map(Number)
        blocks.push({
          id: `evt-${evt.idEvenement}`,
          label: evt.titre || 'Événement',
          startSlot: Math.max(0, timeToSlot(hD, mD)),
          endSlot: Math.min(TOTAL_SLOTS, timeToSlot(hF, mF)),
          color: 'warning',
          type: 'evenement'
        })
      }

      // 3. Sessions qui couvrent ce jour sans réservation précise
      const sessionsCouvrant = sessions.filter(s => {
        const sd = new Date(s.dateDebut)
        const sf = new Date(s.dateFin)
        return jour >= sd && jour <= sf
      })
      for (const session of sessionsCouvrant) {
        const dejaParResa = blocks.some(b => b.id.startsWith('resa-') && b.type === 'session')
        if (dejaParResa) continue

        const code = session.codeFormation || ''
        blocks.push({
          id: `session-${session.id}-${jourNum}`,
          label: toAcronyme(session.formation || session.nom || 'Formation'),
          startSlot: timeToSlot(9, 0),   // défaut 09:00-17:00
          endSlot: timeToSlot(17, 0),
          color: getColorForFormation(code),
          type: 'session'
        })
      }

      result.set(jourNum, blocks)
    }

    return result
  }, [joursSemaine, reservations, sessions, evenements, mois, annee])

  // --- Rendu ---
  return (
    <div className="flex flex-col h-full">
      {/* Header navigation semaine */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-[rgba(var(--border),0.3)]">
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
          <span className="capitalize">{moisNom} {annee}</span>
          <span className="text-[rgb(var(--foreground))] font-medium">
            — Semaine du {joursSemaine[0]?.getDate()} au {joursSemaine[joursSemaine.length - 1]?.getDate()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[rgb(var(--muted-foreground))] mr-2">
            Semaine {semaineIdx + 1}/{nbSemaines}
          </span>
          <button
            onClick={() => setSemaineOffset(Math.max(0, semaineIdx - 1))}
            disabled={semaineIdx === 0}
            className="p-1.5 rounded hover:bg-[rgb(var(--secondary))] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSemaineOffset(Math.min(nbSemaines - 1, semaineIdx + 1))}
            disabled={semaineIdx >= nbSemaines - 1}
            className="p-1.5 rounded hover:bg-[rgb(var(--secondary))] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grille principale avec scroll vertical */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          {/* En-têtes jours */}
          <div className="flex sticky top-0 z-10 bg-[rgb(var(--card))] border-b border-[rgba(var(--border),0.3)]">
            <div className="w-[60px] flex-shrink-0" />
            {joursSemaine.map((jour) => {
              const isAujourdhui = jour.toDateString() === new Date().toDateString()
              return (
                <div
                  key={jour.getDate()}
                  className={`flex-1 text-center py-2 border-l border-[rgba(var(--border),0.15)] ${
                    isAujourdhui ? 'bg-[rgba(var(--accent),0.08)]' : ''
                  }`}
                >
                  <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase">
                    {jour.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-bold ${
                    isAujourdhui ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--foreground))]'
                  }`}>
                    {jour.getDate()}
                  </p>
                </div>
              )
            })}
            {/* Colonnes vides si semaine incomplète */}
            {Array.from({ length: 7 - joursSemaine.length }).map((_, i) => (
              <div key={`empty-h-${i}`} className="flex-1 border-l border-[rgba(var(--border),0.15)]" />
            ))}
          </div>

          {/* Corps timeline */}
          <div className="flex" style={{ height: GRID_HEIGHT }}>
            {/* Colonne heures */}
            <div className="w-[60px] flex-shrink-0 relative">
              {heureLabels.map((h, idx) => (
                <div
                  key={h.heure}
                  className="absolute right-2 flex items-start"
                  style={{ top: idx * SLOT_HEIGHT - 6 }}
                >
                  {h.estHeurePleine && (
                    <span className="text-[11px] font-medium text-[rgb(var(--muted-foreground))]">
                      {h.heure}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {joursSemaine.map((jour) => {
              const jourNum = jour.getDate()
              const blocks = blocksParJour.get(jourNum) || []
              const hasBlocks = blocks.length > 0

              return (
                <div
                  key={jourNum}
                  className="flex-1 relative border-l border-[rgba(var(--border),0.15)]"
                  style={{
                    height: GRID_HEIGHT,
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent 0px,
                      transparent ${SLOT_HEIGHT - 1}px,
                      rgba(var(--border), 0.08) ${SLOT_HEIGHT - 1}px,
                      rgba(var(--border), 0.08) ${SLOT_HEIGHT}px
                    )`,
                    backgroundSize: `100% ${SLOT_HEIGHT}px`,
                  }}
                >
                  {/* Lignes heures pleines (plus visibles) */}
                  {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-[rgba(var(--border),0.25)]"
                      style={{ top: i * 2 * SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Blocs événements */}
                  {blocks.map((block) => {
                    const top = block.startSlot * SLOT_HEIGHT
                    const height = (block.endSlot - block.startSlot) * SLOT_HEIGHT
                    const colors = COLOR_MAP[block.color] || COLOR_MAP.accent

                    return (
                      <div
                        key={block.id}
                        className="absolute left-1 right-1 rounded-md overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          top: top + 1,
                          height: height - 2,
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          boxShadow: `0 1px 3px rgba(0,0,0,0.2)`,
                        }}
                        title={`${block.label} (${heureLabels[block.startSlot]?.heure || ''} - ${heureLabels[block.endSlot]?.heure || ''})`}
                      >
                        <div className="px-2 py-1 h-full flex flex-col justify-start">
                          <span
                            className="text-xs font-bold truncate"
                            style={{ color: colors.text }}
                          >
                            {block.label}
                          </span>
                          {height > SLOT_HEIGHT * 2 && (
                            <span className="text-[10px] opacity-70" style={{ color: colors.text }}>
                              {heureLabels[block.startSlot]?.heure} - {heureLabels[block.endSlot]?.heure || `${END_HOUR}:00`}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Indicateur "Libre" si aucun bloc */}
                  {!hasBlocks && (
                    <div
                      className="absolute left-0 right-0 flex items-center justify-center"
                      style={{ top: (timeToSlot(12, 0) - 1) * SLOT_HEIGHT, height: SLOT_HEIGHT * 2 }}
                    >
                      <span className="text-xs text-[rgb(var(--muted-foreground))] opacity-40">
                        Libre
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Colonnes vides si semaine incomplète */}
            {Array.from({ length: 7 - joursSemaine.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-1 border-l border-[rgba(var(--border),0.1)]"
                style={{ height: GRID_HEIGHT }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="px-4 py-3 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MAP.success.bg, border: `1px solid ${COLOR_MAP.success.border}` }} />
            <span className="text-[rgb(var(--muted-foreground))]">CAP / Formation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MAP.info.bg, border: `1px solid ${COLOR_MAP.info.border}` }} />
            <span className="text-[rgb(var(--muted-foreground))]">Sertissage / CAO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MAP.warning.bg, border: `1px solid ${COLOR_MAP.warning.border}` }} />
            <span className="text-[rgb(var(--muted-foreground))]">Événement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MAP.error.bg, border: `1px solid ${COLOR_MAP.error.border}` }} />
            <span className="text-[rgb(var(--muted-foreground))]">Bloqué</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]" />
            <span className="text-[rgb(var(--muted-foreground))]">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  )
}
