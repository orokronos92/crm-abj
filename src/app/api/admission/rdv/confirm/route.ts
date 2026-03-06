import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admission/rdv/confirm?token=XXXX
 * Route publique — pas d'auth requise
 *
 * Confirme le créneau RDV choisi par le candidat :
 * 1. Valide le token et vérifie l'expiration
 * 2. Passe la réservation ciblée en CONFIRMEE
 * 3. Annule (ANNULEE) les autres holds du même candidat
 * 4. Retourne les infos du RDV confirmé
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 400 })
  }

  try {
    // Récupérer le hold correspondant au token
    const reservation = await prisma.reservationSalle.findUnique({
      where: { token },
      include: {
        salle: { select: { idSalle: true, nom: true } },
        candidat: {
          select: {
            idCandidat: true,
            numeroDossier: true,
            prospect: { select: { nom: true, prenom: true } }
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Lien invalide ou déjà utilisé' },
        { status: 404 }
      )
    }

    // Vérifier le statut
    if (reservation.statut === 'CONFIRMEE') {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        rdv: {
          salle: reservation.salle?.nom,
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          numeroDossier: reservation.candidat?.numeroDossier,
          prenom: reservation.candidat?.prospect?.prenom,
          nom: reservation.candidat?.prospect?.nom,
        }
      })
    }

    if (reservation.statut === 'ANNULEE') {
      return NextResponse.json(
        { success: false, error: 'Ce créneau a déjà été pris par un autre candidat ou est annulé' },
        { status: 410 }
      )
    }

    // Vérifier l'expiration
    if (reservation.expiresAt && reservation.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Ce lien a expiré (72h dépassées). Contactez l\'ABJ pour de nouveaux créneaux.' },
        { status: 410 }
      )
    }

    const idCandidat = reservation.idCandidat

    // Transaction : confirmer ce hold + annuler tous les autres du même candidat
    await prisma.$transaction(async (tx) => {
      // 1. Confirmer la réservation choisie
      await tx.reservationSalle.update({
        where: { idReservation: reservation.idReservation },
        data: { statut: 'CONFIRMEE' }
      })

      // 2. Annuler les autres holds PREVUE du même candidat (si idCandidat présent)
      if (idCandidat) {
        await tx.reservationSalle.updateMany({
          where: {
            idCandidat,
            statut: 'PREVUE',
            idReservation: { not: reservation.idReservation }
          },
          data: { statut: 'ANNULEE' }
        })
      }
    })

    console.log(`[ADMISSION] ✅ RDV confirmé — token ${token.slice(0, 8)}... — candidat ${reservation.candidat?.numeroDossier}`)

    return NextResponse.json({
      success: true,
      alreadyConfirmed: false,
      rdv: {
        salle: reservation.salle?.nom,
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        numeroDossier: reservation.candidat?.numeroDossier,
        prenom: reservation.candidat?.prospect?.prenom,
        nom: reservation.candidat?.prospect?.nom,
      }
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur confirmation RDV:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
