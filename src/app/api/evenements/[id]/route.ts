import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Type pour les paramètres de route dynamique
type RouteParams = {
  params: Promise<{ id: string }>
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
    const dataUpdate: any = {}

    if (body.type) dataUpdate.type = body.type
    if (body.titre) dataUpdate.titre = body.titre
    if (body.description !== undefined) dataUpdate.description = body.description
    if (body.date) dataUpdate.date = new Date(body.date)
    if (body.heureDebut) dataUpdate.heureDebut = body.heureDebut
    if (body.heureFin) dataUpdate.heureFin = body.heureFin
    if (body.salle) dataUpdate.salle = body.salle
    if (body.nombreParticipants) dataUpdate.nombreParticipants = parseInt(String(body.nombreParticipants), 10)
    if (body.participantsInscrits !== undefined) dataUpdate.participantsInscrits = parseInt(String(body.participantsInscrits), 10)
    if (body.statut) dataUpdate.statut = body.statut
    if (body.notes !== undefined) dataUpdate.notes = body.notes

    // TODO: Récupérer userId depuis session NextAuth
    dataUpdate.modifiePar = null

    // Mise à jour
    const evenementUpdated = await prisma.evenement.update({
      where: { idEvenement },
      data: dataUpdate
    })

    return NextResponse.json({
      success: true,
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

    // Soft delete : mise à jour du statut
    // TODO: Récupérer userId depuis session NextAuth
    const userId = null

    const evenementAnnule = await prisma.evenement.update({
      where: { idEvenement },
      data: {
        statut: 'ANNULE',
        motifAnnulation,
        annulePar: userId,
        dateAnnulation: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Événement annulé (conservé en base)',
      evenement: {
        idEvenement: evenementAnnule.idEvenement,
        titre: evenementAnnule.titre,
        statut: evenementAnnule.statut,
        motifAnnulation: evenementAnnule.motifAnnulation,
        dateAnnulation: evenementAnnule.dateAnnulation?.toISOString()
      }
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
