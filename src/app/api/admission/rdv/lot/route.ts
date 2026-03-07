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

    // Grouper par paires : les holds sont toujours par 2 (Jour1 + Jour2)
    // On les groupe par date unique et on associe le premier = entretien, le second = test
    const paireMap = new Map<string, { tokenJ1: string; dateJ1: Date; dateJ2: Date; nomSalle: string }>()

    // Collecter les dates uniques triées
    const holdsTriés = [...holds].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())

    // Grouper par paires de 2 (chaque paire partage le même idLot)
    // Stratégie : grouper les holds par proximité de dates (même salle, mêmes 2 dates)
    // On cherche les paires uniques de (date1, date2)
    const datesUniques = [...new Set(holdsTriés.map(h => new Date(h.dateDebut).toISOString().split('T')[0]))]

    for (let i = 0; i < datesUniques.length; i += 2) {
      const date1 = datesUniques[i]
      const date2 = datesUniques[i + 1]
      if (!date2) break // nombre impair — ignorer le dernier

      const holdJ1 = holdsTriés.find(h => h.dateDebut.toISOString().split('T')[0] === date1)
      const holdJ2 = holdsTriés.find(h => h.dateDebut.toISOString().split('T')[0] === date2)
      if (!holdJ1 || !holdJ2) continue

      paireMap.set(`${date1}_${date2}`, {
        tokenJ1:  holdJ1.token!,
        dateJ1:   holdJ1.dateDebut,
        dateJ2:   holdJ2.dateDebut,
        nomSalle: holdJ1.salle.nom,
      })
    }

    const paires = [...paireMap.values()]

    return NextResponse.json({
      success: true,
      paires: paires.map(p => ({
        tokenJ1:  p.tokenJ1,
        dateJ1:   p.dateJ1,
        dateJ2:   p.dateJ2,
        nomSalle: p.nomSalle,
      })),
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur récupération lot:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
