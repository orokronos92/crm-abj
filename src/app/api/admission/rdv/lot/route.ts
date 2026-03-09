import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admission/rdv/lot?lot=TOKEN_LOT
 * Route publique — pas d'auth requise
 *
 * Retourne les paires de jours PREVUE disponibles pour un lot de RDV.
 * Chaque paire = Jour 1 (entretien présentiel) + Jour 2 (test technique), journées complètes 09h-17h.
 * Le candidat choisit une paire — les 2 réservations sont confirmées ensemble.
 * Le tokenPaire = token du hold Jour 1 (utilisé pour la confirmation).
 */
export async function GET(request: NextRequest) {
  const lot = request.nextUrl.searchParams.get('lot')

  if (!lot) {
    return NextResponse.json({ success: false, error: 'Paramètre lot manquant' }, { status: 400 })
  }

  try {
    const holds = await prisma.reservationSalle.findMany({
      where: {
        idLot:  lot,
        statut: 'PREVUE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        token:    true,
        dateDebut: true,
        dateFin:   true,
        salle:    { select: { nom: true } },
      },
      orderBy: { dateDebut: 'asc' },
    })

    const holdsTriés = [...holds].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    const datesUniques = [...new Set(holdsTriés.map(h => new Date(h.dateDebut).toISOString().split('T')[0]))]

    type PaireData = {
      tokenJ1: string
      dateJ1: Date
      dateJ2: Date
      nomSalle: string
      placesRestantes: number
      plein: boolean
    }

    const paireMap = new Map<string, PaireData>()

    for (let i = 0; i < datesUniques.length; i += 2) {
      const date1 = datesUniques[i]
      const date2 = datesUniques[i + 1]
      if (!date2) break

      const holdJ1 = holdsTriés.find(h => h.dateDebut.toISOString().split('T')[0] === date1)
      const holdJ2 = holdsTriés.find(h => h.dateDebut.toISOString().split('T')[0] === date2)
      if (!holdJ1 || !holdJ2) continue

      // Récupérer l'événement ENTRETIEN_PRESENTIEL du Jour 1 pour connaître la capacité et les inscrits
      const dateJ1Debut = new Date(holdJ1.dateDebut)
      dateJ1Debut.setHours(0, 0, 0, 0)
      const dateJ1Fin = new Date(holdJ1.dateDebut)
      dateJ1Fin.setHours(23, 59, 59, 999)

      const evtJ1 = await prisma.evenement.findFirst({
        where: {
          type:   'ENTRETIEN_PRESENTIEL',
          date:   { gte: dateJ1Debut, lte: dateJ1Fin },
          salle:  holdJ1.salle.nom,
          statut: { not: 'ANNULE' },
        },
        select: { nombreParticipants: true, participantsInscrits: true },
      })

      const capacite = evtJ1?.nombreParticipants ?? 0
      const inscrits = evtJ1?.participantsInscrits ?? 0
      const placesRestantes = Math.max(0, capacite - inscrits)
      const plein = capacite > 0 && placesRestantes === 0

      paireMap.set(`${date1}_${date2}`, {
        tokenJ1:  holdJ1.token!,
        dateJ1:   holdJ1.dateDebut,
        dateJ2:   holdJ2.dateDebut,
        nomSalle: holdJ1.salle.nom,
        placesRestantes,
        plein,
      })
    }

    const paires = [...paireMap.values()]

    return NextResponse.json({
      success: true,
      paires: paires.map(p => ({
        tokenJ1:         p.tokenJ1,
        dateJ1:          p.dateJ1,
        dateJ2:          p.dateJ2,
        nomSalle:        p.nomSalle,
        placesRestantes: p.placesRestantes,
        plein:           p.plein,
      })),
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur récupération lot:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
