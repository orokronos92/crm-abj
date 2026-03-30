import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Type pour les paramètres de route dynamique
type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/evenements/[id]
 * Retourne l'événement + la liste des candidats inscrits (pour ENTRETIEN_PRESENTIEL et TEST_TECHNIQUE)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const idEvenement = parseInt(id, 10)
    if (isNaN(idEvenement)) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
    }

    const evenement = await prisma.evenement.findUnique({
      where: { idEvenement },
      select: {
        idEvenement: true, type: true, titre: true, date: true,
        heureDebut: true, heureFin: true, salle: true,
        nombreParticipants: true, participantsInscrits: true, statut: true
      }
    })

    if (!evenement) {
      return NextResponse.json({ success: false, error: 'Événement introuvable' }, { status: 404 })
    }

    const isEntretien = evenement.type === 'ENTRETIEN_PRESENTIEL'
    const isTest = evenement.type === 'TEST_TECHNIQUE'

    if (!isEntretien && !isTest) {
      return NextResponse.json({ success: true, evenement: { ...evenement, date: evenement.date.toISOString().split('T')[0] }, candidats: [] })
    }

    // Élargir la plage à ±1 jour pour absorber les décalages UTC/timezone
    // (n8n écrit dateRdvPresentiel en heure locale, la date événement est stockée en UTC)
    const dateDebut = new Date(evenement.date)
    dateDebut.setDate(dateDebut.getDate() - 1)
    dateDebut.setHours(0, 0, 0, 0)
    const dateFin = new Date(evenement.date)
    dateFin.setDate(dateFin.getDate() + 1)
    dateFin.setHours(23, 59, 59, 999)

    const candidats = await prisma.candidat.findMany({
      where: isEntretien
        ? { dateRdvPresentiel: { gte: dateDebut, lte: dateFin } }
        : { dateTestTechnique: { gte: dateDebut, lte: dateFin } },
      select: {
        idCandidat: true,
        numeroDossier: true,
        prospect: { select: { nom: true, prenom: true, emails: true, telephones: true } }
      },
      orderBy: { numeroDossier: 'asc' }
    })

    return NextResponse.json({
      success: true,
      evenement: { ...evenement, date: evenement.date.toISOString().split('T')[0] },
      candidats: candidats.map(c => ({
        idCandidat: c.idCandidat,
        numeroDossier: c.numeroDossier,
        nom: c.prospect?.nom ?? '',
        prenom: c.prospect?.prenom ?? '',
        email: c.prospect?.emails?.[0] ?? null,
        telephone: c.prospect?.telephones?.[0] ?? null,
      }))
    })
  } catch (error) {
    console.error('❌ Erreur GET /api/evenements/[id]:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}

/**
 * API Route PATCH /api/evenements/[id]
 *
 * Modifie un événement existant (avec validation de conflit si changement de salle/date)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const idEvenement = parseInt(id, 10)

    if (isNaN(idEvenement)) {
      return NextResponse.json(
        { success: false, error: 'ID événement invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Récupérer l'événement actuel
    const evenementActuel = await prisma.evenement.findUnique({
      where: { idEvenement },
      select: {
        idEvenement: true,
        type: true,
        titre: true,
        date: true,
        salle: true,
        statut: true
      }
    })

    if (!evenementActuel) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si changement de date ou salle → revérifier conflit
    const changementDate = body.date && body.date !== evenementActuel.date.toISOString().split('T')[0]
    const changementSalle = body.salle && body.salle !== evenementActuel.salle

    if (changementDate || changementSalle) {
      const dateVerif = changementDate ? new Date(body.date) : evenementActuel.date
      const salleVerif = changementSalle ? body.salle : evenementActuel.salle

      // Vérifier conflit avec autres événements (sauf celui-ci)
      const conflitEvenement = await prisma.evenement.findFirst({
        where: {
          salle: salleVerif,
          date: dateVerif,
          statut: { notIn: ['ANNULE'] },
          idEvenement: { not: idEvenement } // Exclure l'événement actuel
        },
        select: {
          titre: true,
          heureDebut: true,
          heureFin: true
        }
      })

      if (conflitEvenement) {
        return NextResponse.json(
          {
            success: false,
            error: 'Salle déjà occupée',
            details: {
              salle: salleVerif,
              date: dateVerif.toISOString().split('T')[0],
              conflitAvec: `${conflitEvenement.titre} (${conflitEvenement.heureDebut}-${conflitEvenement.heureFin})`
            }
          },
          { status: 409 }
        )
      }

      // Vérifier conflit avec sessions
      const conflitSession = await prisma.session.findFirst({
        where: {
          OR: [
            { sallePrincipale: salleVerif },
            { salle: { nom: salleVerif } }
          ],
          AND: [
            { dateDebut: { lte: dateVerif } },
            { dateFin: { gte: dateVerif } }
          ],
          statutSession: { notIn: ['ANNULEE'] }
        },
        select: {
          nomSession: true,
          dateDebut: true,
          dateFin: true
        }
      })

      if (conflitSession) {
        const dateDebut = conflitSession.dateDebut?.toLocaleDateString('fr-FR') || ''
        const dateFin = conflitSession.dateFin?.toLocaleDateString('fr-FR') || ''

        return NextResponse.json(
          {
            success: false,
            error: 'Salle déjà occupée',
            details: {
              salle: salleVerif,
              date: dateVerif.toISOString().split('T')[0],
              conflitAvec: `Session ${conflitSession.nomSession} (${dateDebut} - ${dateFin})`
            }
          },
          { status: 409 }
        )
      }
    }

    // Préparer les données de mise à jour
    const dataUpdate: Record<string, unknown> = {}

    if (body.type) dataUpdate.type = body.type

    // Si le titre suit le pattern "Type — DD/MM/YYYY" et qu'on change la date,
    // mettre à jour le titre automatiquement (sauf si un titre explicite est fourni)
    if (body.titre) {
      dataUpdate.titre = body.titre
    } else if (changementDate && evenementActuel.titre) {
      const datePattern = /\d{2}\/\d{2}\/\d{4}$/
      if (datePattern.test(evenementActuel.titre)) {
        const [anneeT, moisT, jourT] = body.date.split('-')
        const nouvelleDateFormatee = `${jourT}/${moisT}/${anneeT}`
        dataUpdate.titre = evenementActuel.titre.replace(datePattern, nouvelleDateFormatee)
      }
    }
    if (body.description !== undefined) dataUpdate.description = body.description
    if (body.date) dataUpdate.date = new Date(body.date)
    if (body.heureDebut) dataUpdate.heureDebut = body.heureDebut
    if (body.heureFin) dataUpdate.heureFin = body.heureFin
    if (body.salle) dataUpdate.salle = body.salle
    if (body.nombreParticipants) dataUpdate.nombreParticipants = parseInt(String(body.nombreParticipants), 10)
    if (body.participantsInscrits !== undefined) dataUpdate.participantsInscrits = parseInt(String(body.participantsInscrits), 10)
    if (body.statut) dataUpdate.statut = body.statut
    if (body.notes !== undefined) dataUpdate.notes = body.notes
    dataUpdate.modifiePar = null

    // Cascade sur les holds et candidats si changement de date sur ENTRETIEN/TEST
    const isRdvType = evenementActuel.type === 'ENTRETIEN_PRESENTIEL' || evenementActuel.type === 'TEST_TECHNIQUE'
    let holdsModifies = 0

    if (changementDate && isRdvType) {
      const ancienneDate = new Date(evenementActuel.date)
      // Plage ±1 jour pour absorber les décalages UTC/timezone
      const ancienneDateDebut = new Date(ancienneDate)
      ancienneDateDebut.setDate(ancienneDateDebut.getDate() - 1)
      ancienneDateDebut.setHours(0, 0, 0, 0)
      const ancienneDateFin = new Date(ancienneDate)
      ancienneDateFin.setDate(ancienneDateFin.getDate() + 1)
      ancienneDateFin.setHours(23, 59, 59, 999)

      const nouvelleDate = new Date(body.date)
      const [annee, moisNum, jourNum] = body.date.split('-').map(Number)

      // Récupérer les holds liés à cette date et salle
      const holdsLies = await prisma.reservationSalle.findMany({
        where: {
          token: { not: null },
          dateDebut: { gte: ancienneDateDebut, lte: ancienneDateFin },
          salle: { nom: evenementActuel.salle ?? '' },
        },
        select: { idReservation: true, dateDebut: true, dateFin: true }
      })

      await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour l'événement
        await tx.evenement.update({ where: { idEvenement }, data: dataUpdate })

        // 2. Cascade sur les holds
        for (const hold of holdsLies) {
          const hDebut = new Date(hold.dateDebut).getHours()
          const minDebut = new Date(hold.dateDebut).getMinutes()
          const hFin = new Date(hold.dateFin).getHours()
          const minFin = new Date(hold.dateFin).getMinutes()
          await tx.reservationSalle.update({
            where: { idReservation: hold.idReservation },
            data: {
              dateDebut: new Date(annee, moisNum - 1, jourNum, hDebut, minDebut, 0),
              dateFin:   new Date(annee, moisNum - 1, jourNum, hFin, minFin, 0),
            }
          })
        }
        holdsModifies = holdsLies.length

        // 3. Cascade sur les dates des candidats inscrits
        if (evenementActuel.type === 'ENTRETIEN_PRESENTIEL') {
          await tx.candidat.updateMany({
            where: { dateRdvPresentiel: { gte: ancienneDateDebut, lte: ancienneDateFin } },
            data: { dateRdvPresentiel: nouvelleDate }
          })
        } else {
          await tx.candidat.updateMany({
            where: { dateTestTechnique: { gte: ancienneDateDebut, lte: ancienneDateFin } },
            data: { dateTestTechnique: nouvelleDate }
          })
        }
      })

      console.log(`[API] ✅ Cascade date événement ${idEvenement} : ${holdsModifies} hold(s) mis à jour`)
    }

    // Mise à jour simple si pas de cascade nécessaire
    const evenementUpdated = isRdvType && changementDate
      ? await prisma.evenement.findUnique({
          where: { idEvenement },
          select: {
            idEvenement: true, type: true, titre: true, description: true,
            date: true, heureDebut: true, heureFin: true, salle: true,
            nombreParticipants: true, participantsInscrits: true, statut: true, notes: true, modifieLe: true
          }
        })
      : await prisma.evenement.update({ where: { idEvenement }, data: dataUpdate })

    if (!evenementUpdated) {
      return NextResponse.json({ success: false, error: 'Événement introuvable après mise à jour' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      holdsModifies,
      evenement: {
        idEvenement: evenementUpdated.idEvenement,
        type: evenementUpdated.type,
        titre: evenementUpdated.titre,
        description: evenementUpdated.description,
        date: evenementUpdated.date.toISOString().split('T')[0],
        heureDebut: evenementUpdated.heureDebut,
        heureFin: evenementUpdated.heureFin,
        salle: evenementUpdated.salle,
        nombreParticipants: evenementUpdated.nombreParticipants,
        participantsInscrits: evenementUpdated.participantsInscrits,
        statut: evenementUpdated.statut,
        notes: evenementUpdated.notes,
        modifieLe: evenementUpdated.modifieLe.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erreur PATCH /api/evenements/[id]:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la modification de l\'événement'
      },
      { status: 500 }
    )
  }
}

/**
 * API Route DELETE /api/evenements/[id]
 *
 * Soft delete - Annule un événement sans le supprimer physiquement
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const idEvenement = parseInt(id, 10)

    if (isNaN(idEvenement)) {
      return NextResponse.json(
        { success: false, error: 'ID événement invalide' },
        { status: 400 }
      )
    }

    // Récupérer motif d'annulation depuis le body (optionnel)
    let motifAnnulation = null
    try {
      const body = await request.json()
      motifAnnulation = body.motifAnnulation || null
    } catch {
      // Pas de body, c'est OK
    }

    // Vérifier que l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { idEvenement },
      select: { idEvenement: true, statut: true }
    })

    if (!evenement) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete : mise à jour du statut + cascade vers ReservationSalle
    // TODO: Récupérer userId depuis session NextAuth
    const userId = null

    const [reservationsAnnulees, evenementAnnule] = await prisma.$transaction([
      // 1. Annuler toutes les réservations de salle liées à cet événement
      prisma.reservationSalle.updateMany({
        where: {
          idEvenement,
          statut: { not: 'ANNULE' }
        },
        data: {
          statut: 'ANNULE',
          motifAnnulation: motifAnnulation || 'Événement annulé'
        }
      }),
      // 2. Annuler l'événement lui-même
      prisma.evenement.update({
        where: { idEvenement },
        data: {
          statut: 'ANNULE',
          motifAnnulation,
          annulePar: userId,
          dateAnnulation: new Date()
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Événement annulé (conservé en base)',
      evenement: {
        idEvenement: evenementAnnule.idEvenement,
        titre: evenementAnnule.titre,
        statut: evenementAnnule.statut,
        motifAnnulation: evenementAnnule.motifAnnulation,
        dateAnnulation: evenementAnnule.dateAnnulation?.toISOString()
      },
      reservationsAnnulees: reservationsAnnulees.count
    })

  } catch (error) {
    console.error('❌ Erreur DELETE /api/evenements/[id]:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'annulation de l\'événement'
      },
      { status: 500 }
    )
  }
}
