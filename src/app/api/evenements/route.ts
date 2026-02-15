import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * API Route POST /api/evenements
 *
 * Crée un nouvel événement après validation de conflit de salle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des champs obligatoires
    const { type, titre, date, heureDebut, heureFin, salle, nombreParticipants } = body

    if (!type || !titre || !date || !heureDebut || !heureFin || !salle || !nombreParticipants) {
      return NextResponse.json(
        {
          success: false,
          error: 'Champs obligatoires manquants'
        },
        { status: 400 }
      )
    }

    // Conversion de la date en objet Date
    const dateEvenement = new Date(date)

    // ===== VALIDATION CONFLIT DE SALLE =====

    // 1. Vérifier conflit avec autres événements
    const conflitEvenement = await prisma.evenement.findFirst({
      where: {
        salle,
        date: dateEvenement,
        statut: { notIn: ['ANNULE'] } // Ignorer les événements annulés
      },
      select: {
        idEvenement: true,
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
            salle,
            date: dateEvenement.toISOString().split('T')[0],
            conflitAvec: `${conflitEvenement.titre} (${conflitEvenement.heureDebut}-${conflitEvenement.heureFin})`
          }
        },
        { status: 409 } // Conflict
      )
    }

    // 2. Vérifier conflit avec sessions
    // Pour les sessions, on vérifie si la date de l'événement tombe dans la période de la session
    const conflitSession = await prisma.session.findFirst({
      where: {
        OR: [
          { sallePrincipale: salle },
          { salle: { nom: salle } }
        ],
        AND: [
          { dateDebut: { lte: dateEvenement } },
          { dateFin: { gte: dateEvenement } }
        ],
        statutSession: { notIn: ['ANNULEE'] }
      },
      select: {
        idSession: true,
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
            salle,
            date: dateEvenement.toISOString().split('T')[0],
            conflitAvec: `Session ${conflitSession.nomSession} (${dateDebut} - ${dateFin})`
          }
        },
        { status: 409 }
      )
    }

    // ===== CRÉATION DE L'ÉVÉNEMENT =====

    // TODO: Récupérer l'userId depuis la session NextAuth
    // Pour l'instant, on utilise null (sera ajouté après connexion auth)
    const userId = null

    const evenement = await prisma.evenement.create({
      data: {
        type,
        titre,
        description: body.description || null,
        date: dateEvenement,
        heureDebut,
        heureFin,
        salle,
        nombreParticipants: parseInt(String(nombreParticipants), 10),
        participantsInscrits: body.participantsInscrits ? parseInt(String(body.participantsInscrits), 10) : 0,
        statut: body.statut || 'PLANIFIE',
        notes: body.notes || null,
        creePar: userId
      }
    })

    return NextResponse.json({
      success: true,
      evenement: {
        idEvenement: evenement.idEvenement,
        type: evenement.type,
        titre: evenement.titre,
        description: evenement.description,
        date: evenement.date.toISOString().split('T')[0],
        heureDebut: evenement.heureDebut,
        heureFin: evenement.heureFin,
        salle: evenement.salle,
        nombreParticipants: evenement.nombreParticipants,
        participantsInscrits: evenement.participantsInscrits,
        statut: evenement.statut,
        notes: evenement.notes,
        creeLe: evenement.creeLe.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erreur POST /api/evenements:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'événement'
      },
      { status: 500 }
    )
  }
}

/**
 * API Route GET /api/evenements
 *
 * Liste des événements avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Récupération des paramètres
    const anneeParam = searchParams.get('annee')
    const moisParam = searchParams.get('mois')
    const typeParam = searchParams.get('type')
    const salleParam = searchParams.get('salle')
    const statutParam = searchParams.get('statut')
    const includeAnnulesParam = searchParams.get('includeAnnules')

    // Construction du filtre where
    const where: any = {}

    // Filtre par année
    if (anneeParam) {
      const annee = parseInt(anneeParam, 10)
      where.date = {
        gte: new Date(`${annee}-01-01`),
        lt: new Date(`${annee + 1}-01-01`)
      }
    }

    // Filtre par mois (si année spécifiée)
    if (moisParam && anneeParam) {
      const annee = parseInt(anneeParam, 10)
      const mois = parseInt(moisParam, 10)

      // Calculer le dernier jour du mois
      const dernierJour = new Date(annee, mois, 0).getDate()

      where.date = {
        gte: new Date(`${annee}-${String(mois).padStart(2, '0')}-01`),
        lt: new Date(`${annee}-${String(mois).padStart(2, '0')}-${dernierJour}`)
      }
    }

    // Filtre par type
    if (typeParam) {
      where.type = typeParam
    }

    // Filtre par salle
    if (salleParam) {
      where.salle = salleParam
    }

    // Filtre par statut
    if (statutParam) {
      where.statut = statutParam
    } else if (includeAnnulesParam !== 'true') {
      // Par défaut, exclure les événements annulés
      where.statut = { notIn: ['ANNULE'] }
    }

    // Requête avec filtres
    const evenements = await prisma.evenement.findMany({
      where,
      orderBy: { date: 'asc' },
      select: {
        idEvenement: true,
        type: true,
        titre: true,
        description: true,
        date: true,
        heureDebut: true,
        heureFin: true,
        salle: true,
        nombreParticipants: true,
        participantsInscrits: true,
        statut: true,
        notes: true,
        creeLe: true
      }
    })

    // Formater les dates pour le frontend
    const evenementsFormatted = evenements.map(evt => ({
      ...evt,
      date: evt.date.toISOString().split('T')[0],
      creeLe: evt.creeLe.toISOString()
    }))

    return NextResponse.json({
      success: true,
      evenements: evenementsFormatted,
      total: evenements.length
    })

  } catch (error) {
    console.error('❌ Erreur GET /api/evenements:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des événements'
      },
      { status: 500 }
    )
  }
}
