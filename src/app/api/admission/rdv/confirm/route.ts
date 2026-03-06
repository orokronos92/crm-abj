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
        { success: false, error: 'Ce créneau a déjà été pris par un autre candidat ou est annulé.' },
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

    // Récupérer idCandidat depuis le query param (mode lot : hold sans candidat à la création)
    const idCandidatParam = request.nextUrl.searchParams.get('candidat')
    const idCandidatConfirmant = idCandidatParam ? parseInt(idCandidatParam, 10) : reservation.idCandidat

    // Mode lot : transaction avec vérification de concurrence
    // Si deux candidats cliquent simultanément, le premier gagne.
    let confirmed = false
    await prisma.$transaction(async (tx) => {
      // Re-lire le statut dans la transaction pour éviter les race conditions
      const holdActuel = await tx.reservationSalle.findUnique({
        where: { idReservation: reservation.idReservation },
        select: { statut: true, idCandidat: true },
      })

      if (!holdActuel || holdActuel.statut !== 'PREVUE') {
        // Créneau déjà pris pendant qu'on vérifiait — ne pas confirmer
        return
      }

      // Confirmer et associer le candidat
      await tx.reservationSalle.update({
        where: { idReservation: reservation.idReservation },
        data: {
          statut:     'CONFIRMEE',
          idCandidat: idCandidatConfirmant ?? null,
        }
      })

      confirmed = true
    })

    // Créneau pris entre notre vérification et la transaction
    if (!confirmed) {
      return NextResponse.json(
        { success: false, error: 'Ce créneau vient d\'être pris par un autre candidat. Veuillez choisir un autre créneau.' },
        { status: 409 }
      )
    }

    console.log(`[ADMISSION] ✅ RDV confirmé — token ${token.slice(0, 8)}... — candidat ${idCandidatConfirmant ?? 'inconnu'}`)

    // Recharger les infos pour la réponse (le candidat vient peut-être d'être associé)
    const reservationFinale = await prisma.reservationSalle.findUnique({
      where: { idReservation: reservation.idReservation },
      include: {
        salle: { select: { nom: true } },
        candidat: {
          select: {
            numeroDossier: true,
            prospect: { select: { nom: true, prenom: true } }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      alreadyConfirmed: false,
      rdv: {
        salle: reservationFinale?.salle?.nom ?? reservation.salle?.nom,
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        numeroDossier: reservationFinale?.candidat?.numeroDossier,
        prenom: reservationFinale?.candidat?.prospect?.prenom,
        nom: reservationFinale?.candidat?.prospect?.nom,
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
