import prisma from '@/lib/prisma'

export interface RdvConfirme {
  salle?: string
  dateJ1: Date
  dateJ2?: Date
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
 * Confirme une paire de créneaux RDV à partir du token du Jour 1.
 * Gère les race conditions via transaction Prisma.
 * Confirme le hold J1 ET le hold J2 (même idLot, date suivante).
 * Décrémente participantsInscrits sur les événements ENTRETIEN_PRESENTIEL et TEST_TECHNIQUE liés.
 *
 * @param tokenJ1             - Token UUID du hold Jour 1 (entretien présentiel)
 * @param idCandidatConfirmant - ID du candidat qui confirme
 */
export async function confirmerCreneauRdv(
  tokenJ1: string,
  idCandidatConfirmant: number | null
): Promise<ResultatConfirmation> {
  // 1. Charger le hold J1
  const holdJ1 = await prisma.reservationSalle.findUnique({
    where: { token: tokenJ1 },
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

  if (!holdJ1) {
    return { success: false, errorStatus: 404, error: 'Lien invalide ou déjà utilisé' }
  }

  // 2. Déjà confirmé
  if (holdJ1.statut === 'CONFIRMEE') {
    return {
      success: true,
      alreadyConfirmed: true,
      rdv: {
        salle: holdJ1.salle?.nom,
        dateJ1: holdJ1.dateDebut,
        numeroDossier: holdJ1.candidat?.numeroDossier ?? undefined,
        prenom: holdJ1.candidat?.prospect?.prenom ?? undefined,
        nom: holdJ1.candidat?.prospect?.nom ?? undefined,
      }
    }
  }

  // 3. Annulé
  if (holdJ1.statut === 'ANNULEE') {
    return {
      success: false,
      errorStatus: 410,
      error: 'Ce créneau a déjà été pris par un autre candidat ou est annulé.'
    }
  }

  // 4. Expiré
  if (holdJ1.expiresAt && holdJ1.expiresAt < new Date()) {
    return {
      success: false,
      errorStatus: 410,
      error: 'Ce lien a expiré (72h dépassées). Contactez l\'ABJ pour de nouveaux créneaux.'
    }
  }

  // 5. Chercher le hold J2 (même idLot, même salle, date postérieure)
  let holdJ2: { idReservation: number; dateDebut: Date } | null = null
  if (holdJ1.idLot) {
    holdJ2 = await prisma.reservationSalle.findFirst({
      where: {
        idLot:    holdJ1.idLot,
        idSalle:  holdJ1.idSalle,
        statut:   'PREVUE',
        token:    { not: tokenJ1 },
        dateDebut: { gt: holdJ1.dateDebut },
      },
      select: { idReservation: true, dateDebut: true },
      orderBy: { dateDebut: 'asc' },
    })
  }

  // 6. Transaction avec vérification de concurrence
  let confirmed = false
  await prisma.$transaction(async (tx) => {
    const holdActuel = await tx.reservationSalle.findUnique({
      where: { idReservation: holdJ1.idReservation },
      select: { statut: true },
    })

    if (!holdActuel || holdActuel.statut !== 'PREVUE') return

    // Confirmer J1
    await tx.reservationSalle.update({
      where: { idReservation: holdJ1.idReservation },
      data: {
        statut:     'CONFIRMEE',
        idCandidat: idCandidatConfirmant ?? holdJ1.idCandidat ?? null,
      }
    })

    // Confirmer J2 si trouvé
    if (holdJ2) {
      await tx.reservationSalle.update({
        where: { idReservation: holdJ2.idReservation },
        data: {
          statut:     'CONFIRMEE',
          idCandidat: idCandidatConfirmant ?? holdJ1.idCandidat ?? null,
        }
      })
    }

    // Décrémenter participantsInscrits sur l'événement ENTRETIEN_PRESENTIEL (Jour 1)
    const dateJ1Debut = new Date(holdJ1.dateDebut)
    dateJ1Debut.setHours(0, 0, 0, 0)
    const dateJ1Fin = new Date(holdJ1.dateDebut)
    dateJ1Fin.setHours(23, 59, 59, 999)

    const evtEntretien = await tx.evenement.findFirst({
      where: {
        type:  'ENTRETIEN_PRESENTIEL',
        date:  { gte: dateJ1Debut, lte: dateJ1Fin },
        salle: holdJ1.salle?.nom ?? '',
        statut: { not: 'ANNULE' },
      },
      select: { idEvenement: true, participantsInscrits: true, nombreParticipants: true },
    })

    if (evtEntretien) {
      const inscritsActuels = evtEntretien.participantsInscrits ?? 0
      if (inscritsActuels < evtEntretien.nombreParticipants) {
        await tx.evenement.update({
          where: { idEvenement: evtEntretien.idEvenement },
          data: { participantsInscrits: { increment: 1 } },
        })
      }
    }

    // Décrémenter sur l'événement TEST_TECHNIQUE (Jour 2)
    if (holdJ2) {
      const dateJ2Debut = new Date(holdJ2.dateDebut)
      dateJ2Debut.setHours(0, 0, 0, 0)
      const dateJ2Fin = new Date(holdJ2.dateDebut)
      dateJ2Fin.setHours(23, 59, 59, 999)

      const evtTest = await tx.evenement.findFirst({
        where: {
          type:  'TEST_TECHNIQUE',
          date:  { gte: dateJ2Debut, lte: dateJ2Fin },
          salle: holdJ1.salle?.nom ?? '',
          statut: { not: 'ANNULE' },
        },
        select: { idEvenement: true, participantsInscrits: true, nombreParticipants: true },
      })

      if (evtTest) {
        const inscritsActuels = evtTest.participantsInscrits ?? 0
        if (inscritsActuels < evtTest.nombreParticipants) {
          await tx.evenement.update({
            where: { idEvenement: evtTest.idEvenement },
            data: { participantsInscrits: { increment: 1 } },
          })
        }
      }
    }

    confirmed = true
  })

  // 7. Race condition
  if (!confirmed) {
    return {
      success: false,
      errorStatus: 409,
      error: 'Ce créneau vient d\'être pris par un autre candidat. Veuillez choisir un autre créneau.'
    }
  }

  return {
    success: true,
    alreadyConfirmed: false,
    rdv: {
      salle:         holdJ1.salle?.nom ?? undefined,
      dateJ1:        holdJ1.dateDebut,
      dateJ2:        holdJ2?.dateDebut ?? undefined,
      numeroDossier: holdJ1.candidat?.numeroDossier ?? undefined,
      prenom:        holdJ1.candidat?.prospect?.prenom ?? undefined,
      nom:           holdJ1.candidat?.prospect?.nom ?? undefined,
    }
  }
}
