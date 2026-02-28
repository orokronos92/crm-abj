/**
 * PlanningWeekView — Timeline hebdomadaire granularité 30 minutes
 * Style Google Calendar : jours en colonnes, heures en lignes horizontales
 * Plage horaire : 08:00 → 21:00 (26 créneaux de 30 min)
 * Blocs d'événements positionnés en absolute
 */

'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLOT_HEIGHT = 40
const START_HOUR = 8
const END_HOUR = 21
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2
const GRID_HEIGHT = SLOT_HEIGHT * TOTAL_SLOTS

// Couleurs lignes de grille (hex direct — rgba(var()) ne marche PAS en inline style)
const LINE_HOUR = '#ffffff18'    // ligne heure pleine — visible
const LINE_HALF = '#ffffff08'    // ligne demi-heure — subtile
const COL_BORDER = '#ffffff10'   // séparation colonnes jours

interface Reservation {
  id: number
  idSession?: number | null
  idEvenement?: number | null
  dateDebut: string
  dateFin: string
  statut: string
}

interface Block {
  id: string
  label: string
  startSlot: number
  endSlot: number
  colorKey: string
  horaires: string
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

const COLORS: Record<string, { bg: string; border: string; text: string }> = {
  cap:   { bg: '#22c55e20', border: '#22c55e', text: '#4ade80' },
  serti: { bg: '#3b82f620', border: '#3b82f6', text: '#60a5fa' },
  event: { bg: '#eab30825', border: '#eab308', text: '#facc15' },
  block: { bg: '#ef444420', border: '#ef4444', text: '#f87171' },
  other: { bg: '#d4af3720', border: '#d4af37', text: '#fbbf24' },
}

function timeToSlot(h: number, m: number): number {
  return Math.max(0, Math.min(TOTAL_SLOTS, (h - START_HOUR) * 2 + Math.floor(m / 30)))
}

function slotToTime(slot: number): string {
  const h = START_HOUR + Math.floor(slot / 2)
  const m = (slot % 2) * 30
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getColorKey(code: string): string {
  if (code.includes('CAP')) return 'cap'
  if (code.includes('SERTI')) return 'serti'
  if (code.includes('CAO') || code.includes('DAO')) return 'serti'
  return 'other'
}

function acronyme(nom: string): string {
  return nom.split(/[\s/\-]+/).filter(Boolean).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 5)
}

export function PlanningWeekView({ mois, annee, sessions, evenements, reservations }: PlanningWeekViewProps) {
  const [semaineOffset, setSemaineOffset] = useState(0)

  const nbJours = new Date(annee, mois + 1, 0).getDate()
  const moisLabel = new Date(annee, mois, 1).toLocaleDateString('fr-FR', { month: 'long' })

  const semaines = useMemo(() => {
    const res: Date[][] = []
    for (let i = 0; i < nbJours; i += 7) {
      const s: Date[] = []
      for (let j = i; j < Math.min(i + 7, nbJours); j++) s.push(new Date(annee, mois, j + 1))
      res.push(s)
    }
    return res
  }, [annee, mois, nbJours])

  const idx = Math.min(semaineOffset, semaines.length - 1)
  const jours = semaines[idx] || []

  const blocksMap = useMemo(() => {
    const map = new Map<number, Block[]>()
    for (const jour of jours) {
      const d = jour.getDate()
      const blocks: Block[] = []
      const sessionIds = new Set<number>()
      const eventIds = new Set<number>()

      for (const r of reservations) {
        const rd = new Date(r.dateDebut)
        if (rd.getDate() !== d || rd.getMonth() !== mois || rd.getFullYear() !== annee) continue
        const rf = new Date(r.dateFin)
        const s0 = timeToSlot(rd.getHours(), rd.getMinutes())
        const s1 = timeToSlot(rf.getHours(), rf.getMinutes())
        let label = 'Réservé'
        let ck = 'other'
        if (r.idSession) {
          sessionIds.add(r.idSession)
          const sess = sessions.find(s => s.id === r.idSession)
          if (sess) { label = acronyme(sess.formation || sess.nom || 'Formation'); ck = getColorKey(sess.codeFormation || '') }
        } else if (r.idEvenement) {
          eventIds.add(r.idEvenement)
          const ev = evenements.find(e => e.idEvenement === r.idEvenement)
          label = ev?.titre || 'Événement'; ck = 'event'
        }
        blocks.push({ id: `r${r.id}`, label, startSlot: s0, endSlot: Math.max(s0 + 1, s1), colorKey: ck, horaires: `${slotToTime(s0)} – ${slotToTime(s1)}` })
      }

      for (const ev of evenements) {
        const ed = new Date(ev.date)
        if (ed.getDate() !== d || ed.getMonth() !== mois || ed.getFullYear() !== annee) continue
        if (eventIds.has(ev.idEvenement)) continue
        const [hd, md] = (ev.heureDebut || '09:00').split(':').map(Number)
        const [hf, mf] = (ev.heureFin || '17:00').split(':').map(Number)
        const s0 = timeToSlot(hd, md)
        const s1 = timeToSlot(hf, mf)
        blocks.push({ id: `e${ev.idEvenement}`, label: ev.titre || 'Événement', startSlot: s0, endSlot: Math.max(s0 + 1, s1), colorKey: 'event', horaires: `${slotToTime(s0)} – ${slotToTime(s1)}` })
      }

      for (const sess of sessions) {
        if (sessionIds.has(sess.id)) continue
        const sd = new Date(sess.dateDebut); const sf = new Date(sess.dateFin)
        if (jour < sd || jour > sf) continue
        const s0 = timeToSlot(9, 0); const s1 = timeToSlot(17, 0)
        blocks.push({ id: `s${sess.id}-${d}`, label: acronyme(sess.formation || sess.nom || 'Formation'), startSlot: s0, endSlot: s1, colorKey: getColorKey(sess.codeFormation || ''), horaires: '09:00 – 17:00' })
      }

      map.set(d, blocks)
    }
    return map
  }, [jours, reservations, sessions, evenements, mois, annee])

  // Lignes horizontales de grille (rendues une seule fois, toute la largeur)
  const gridLines = useMemo(() => {
    const lines: Array<{ top: number; isHour: boolean }> = []
    for (let i = 0; i <= TOTAL_SLOTS; i++) {
      lines.push({ top: i * SLOT_HEIGHT, isHour: i % 2 === 0 })
    }
    return lines
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Navigation semaine */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${COL_BORDER}` }}>
        <span className="text-sm" style={{ color: '#e5e5e5' }}>
          <span className="capitalize">{moisLabel} {annee}</span>
          {' — Semaine du '}
          <strong>{jours[0]?.getDate()}</strong>
          {' au '}
          <strong>{jours[jours.length - 1]?.getDate()}</strong>
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs mr-2" style={{ color: '#888' }}>{idx + 1}/{semaines.length}</span>
          <button onClick={() => setSemaineOffset(Math.max(0, idx - 1))} disabled={idx === 0} className="p-1 rounded disabled:opacity-20" style={{ color: '#ccc' }}><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setSemaineOffset(Math.min(semaines.length - 1, idx + 1))} disabled={idx >= semaines.length - 1} className="p-1 rounded disabled:opacity-20" style={{ color: '#ccc' }}><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grille scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {/* Header jours (sticky) */}
        <div className="flex sticky top-0 z-10" style={{ backgroundColor: '#1a1a1a', borderBottom: `1px solid ${LINE_HOUR}` }}>
          <div className="flex-shrink-0" style={{ width: 56 }} />
          {jours.map(j => {
            const today = j.toDateString() === new Date().toDateString()
            return (
              <div key={j.getDate()} className="flex-1 text-center py-2" style={{ borderLeft: `1px solid ${COL_BORDER}` }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#888' }}>
                  {j.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className="text-base font-bold" style={{ color: today ? '#d4af37' : '#e5e5e5' }}>
                  {j.getDate()}
                </div>
              </div>
            )
          })}
          {Array.from({ length: 7 - jours.length }).map((_, i) => (
            <div key={`eh${i}`} className="flex-1" style={{ borderLeft: `1px solid ${COL_BORDER}` }} />
          ))}
        </div>

        {/* Corps : heures à gauche + colonnes jours */}
        <div className="flex relative" style={{ height: GRID_HEIGHT }}>
          {/* Lignes horizontales sur TOUTE la largeur */}
          {gridLines.map((line, i) => (
            <div
              key={`gl${i}`}
              className="absolute left-0 right-0"
              style={{
                top: line.top,
                height: 1,
                backgroundColor: line.isHour ? LINE_HOUR : LINE_HALF,
              }}
            />
          ))}

          {/* Colonne heures */}
          <div className="flex-shrink-0 relative" style={{ width: 56, borderRight: `1px solid ${COL_BORDER}` }}>
            {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
              const h = START_HOUR + i
              return (
                <div key={h} className="absolute right-2" style={{ top: i * 2 * SLOT_HEIGHT - 7 }}>
                  <span className="text-[11px] font-medium" style={{ color: '#888' }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              )
            })}
          </div>

          {/* Colonnes jours */}
          {jours.map(jour => {
            const jourNum = jour.getDate()
            const blocks = blocksMap.get(jourNum) || []
            return (
              <div key={jourNum} className="flex-1 relative" style={{ height: GRID_HEIGHT, borderLeft: `1px solid ${COL_BORDER}` }}>
                {/* Blocs */}
                {blocks.map(block => {
                  const c = COLORS[block.colorKey] || COLORS.other
                  const top = block.startSlot * SLOT_HEIGHT + 1
                  const height = (block.endSlot - block.startSlot) * SLOT_HEIGHT - 2
                  return (
                    <div
                      key={block.id}
                      className="absolute left-[2px] right-[2px] rounded-sm overflow-hidden"
                      style={{
                        top,
                        height: Math.max(height, SLOT_HEIGHT - 2),
                        backgroundColor: c.bg,
                        borderLeft: `3px solid ${c.border}`,
                        border: `1px solid ${c.border}40`,
                        borderLeftWidth: 3,
                        borderLeftColor: c.border,
                      }}
                      title={`${block.label}\n${block.horaires}`}
                    >
                      <div className="px-1.5 py-1 flex flex-col h-full overflow-hidden">
                        <span className="text-[11px] font-bold leading-tight truncate" style={{ color: c.text }}>{block.label}</span>
                        {height >= SLOT_HEIGHT * 1.5 && (
                          <span className="text-[9px] mt-0.5" style={{ color: c.text, opacity: 0.7 }}>{block.horaires}</span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* "Libre" en bas de la colonne si aucun bloc */}
                {blocks.length === 0 && (
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <span className="text-xs" style={{ color: '#555' }}>Libre</span>
                  </div>
                )}
              </div>
            )
          })}
          {Array.from({ length: 7 - jours.length }).map((_, i) => (
            <div key={`ec${i}`} className="flex-1" style={{ height: GRID_HEIGHT, borderLeft: `1px solid ${COL_BORDER}` }} />
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-5 px-4 py-2 flex-shrink-0 text-[11px]" style={{ borderTop: `1px solid ${LINE_HOUR}`, backgroundColor: '#1a1a1a' }}>
        {[
          { key: 'cap', label: 'CAP / Formation' },
          { key: 'serti', label: 'Sertissage / CAO' },
          { key: 'event', label: 'Événement' },
          { key: 'block', label: 'Bloqué' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[key].bg, border: `1px solid ${COLORS[key].border}` }} />
            <span style={{ color: '#888' }}>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
          <span style={{ color: '#888' }}>Disponible</span>
        </div>
      </div>
    </div>
  )
}
