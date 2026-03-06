import prisma from '@/lib/prisma'

export interface RdvConfirme {
  salle?: string
  dateDebut: Date
  dateFin: Date
  numeroDossier?: string
  prenom?: string
  nom?: string
}

export interface ResultatConfirmation {
  success: boolean
  alreadyConfirmed?: boolean
  errorStatus?: number
  error?: string
  rdv?: RdvConfirme
}

/**
 * Confirme un créneau RDV à partir d'un token.
 * Gère les race conditions via transaction Prisma.
 *
 * @param token   - Token UUID du hold ReservationSalle
 * @param idCandidatConfirmant - ID du candidat qui confirme (null si mode individuel)
 */
export async function confirmerCreneauRdv(
  token: string,
  idCandidatConfirmant: number | null
): Promise<ResultatConfirmation> {
  // 1. Charger le hold
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
    return { success: false, errorStatus: 404, error: 'Lien invalide ou déjà utilisé' }
  }

  // 2. Déjà confirmé
  if (reservation.statut === 'CONFIRMEE') {
    return {
      success: true,
      alreadyConfirmed: true,
      rdv: {
        salle: reservation.salle?.nom,
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        numeroDossier: reservation.candidat?.numeroDossier ?? undefined,
        prenom: reservation.candidat?.prospect?.prenom ?? undefined,
        nom: reservation.candidat?.prospect?.nom ?? undefined,
      }
    }
  }

  // 3. Annulé
  if (reservation.statut === 'ANNULEE') {
    return {
      success: false,
      errorStatus: 410,
      error: 'Ce créneau a déjà été pris par un autre candidat ou est annulé.'
    }
  }

  // 4. Expiré
  if (reservation.expiresAt && reservation.expiresAt < new Date()) {
    return {
      success: false,
      errorStatus: 410,
      error: 'Ce lien a expiré (72h dépassées). Contactez l\'ABJ pour de nouveaux créneaux.'
    }
  }

  // 5. Transaction avec vérification de concurrence
  let confirmed = false
  await prisma.$transaction(async (tx) => {
    const holdActuel = await tx.reservationSalle.findUnique({
      where: { idReservation: reservation.idReservation },
      select: { statut: true },
    })

    if (!holdActuel || holdActuel.statut !== 'PREVUE') return

    await tx.reservationSalle.update({
      where: { idReservation: reservation.idReservation },
      data: {
        statut:     'CONFIRMEE',
        idCandidat: idCandidatConfirmant ?? reservation.idCandidat ?? null,
      }
    })

    confirmed = true
  })

  // 6. Race condition — créneau pris entre-temps
  if (!confirmed) {
    return {
      success: false,
      errorStatus: 409,
      error: 'Ce créneau vient d\'être pris par un autre candidat. Veuillez choisir un autre créneau.'
    }
  }

  // 7. Recharger pour la réponse
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

  return {
    success: true,
    alreadyConfirmed: false,
    rdv: {
      salle: reservationFinale?.salle?.nom ?? reservation.salle?.nom,
      dateDebut: reservation.dateDebut,
      dateFin: reservation.dateFin,
      numeroDossier: reservationFinale?.candidat?.numeroDossier ?? undefined,
      prenom: reservationFinale?.candidat?.prospect?.prenom ?? undefined,
      nom: reservationFinale?.candidat?.prospect?.nom ?? undefined,
    }
  }
}
