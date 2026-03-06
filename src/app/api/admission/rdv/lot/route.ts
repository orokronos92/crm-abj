import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admission/rdv/lot?lot=TOKEN_LOT
 * Route publique — pas d'auth requise
 *
 * Retourne les créneaux PREVUE disponibles pour un lot de RDV.
 * Utilisé par la page publique /admission/rdv/choisir pour afficher le mini-calendrier.
 */
export async function GET(request: NextRequest) {
  const lot = request.nextUrl.searchParams.get('lot')

  if (!lot) {
    return NextResponse.json({ success: false, error: 'Paramètre lot manquant' }, { status: 400 })
  }

  try {
    const creneaux = await prisma.reservationSalle.findMany({
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

    return NextResponse.json({
      success: true,
      creneaux: creneaux.map(c => ({
        token:     c.token,
        dateDebut: c.dateDebut,
        dateFin:   c.dateFin,
        nomSalle:  c.salle.nom,
      })),
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur récupération lot:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
