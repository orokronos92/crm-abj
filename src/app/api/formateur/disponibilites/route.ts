/**
 * API Disponibilités Formateur
 * GET: Récupérer les disponibilités d'un formateur pour une année
 * POST: Créer/Modifier une disponibilité
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config'
import prisma from '@/lib/prisma'

// GET /api/formateur/disponibilites?annee=2026
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'professeur') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const formateur = await prisma.formateur.findUnique({
      where: { idUtilisateur: session.user.id },
      select: { idFormateur: true },
    })

    if (!formateur) {
      return NextResponse.json({ success: false, error: 'Formateur non trouvé' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const annee = searchParams.get('annee')
    const anneeInt = annee ? parseInt(annee) : new Date().getFullYear()

    // Récupérer toutes les disponibilités de l'année
    const dateDebut = new Date(anneeInt, 0, 1) // 1er janvier
    const dateFin = new Date(anneeInt, 11, 31) // 31 décembre

    const disponibilites = await prisma.disponibiliteFormateur.findMany({
      where: {
        idFormateur: formateur.idFormateur,
        date: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Récupérer aussi les sessions confirmées du formateur pour l'année
    const sessions = await prisma.session.findMany({
      where: {
        formateurPrincipalId: formateur.idFormateur,
        OR: [
          {
            dateDebut: {
              gte: dateDebut,
              lte: dateFin,
            },
          },
          {
            dateFin: {
              gte: dateDebut,
              lte: dateFin,
            },
          },
        ],
      },
      select: {
        idSession: true,
        nomSession: true,
        dateDebut: true,
        dateFin: true,
        statutSession: true,
      },
    })

    return NextResponse.json({
      success: true,
      disponibilites: disponibilites.map((d) => ({
        id: d.idDisponibilite,
        date: d.date.toISOString().split('T')[0],
        creneauJournee: d.creneauJournee,
        typeDisponibilite: d.typeDisponibilite,
        idSession: d.idSession,
        formationConcernee: d.formationConcernee,
        commentaire: d.commentaire,
      })),
      sessions: sessions.map((s) => ({
        id: s.idSession,
        nom: s.nomSession,
        dateDebut: s.dateDebut.toISOString().split('T')[0],
        dateFin: s.dateFin.toISOString().split('T')[0],
        statut: s.statutSession,
      })),
    })
  } catch (error) {
    console.error('Erreur GET /api/formateur/disponibilites:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/formateur/disponibilites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'professeur') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const formateur = await prisma.formateur.findUnique({
      where: { idUtilisateur: session.user.id },
      select: { idFormateur: true },
    })

    if (!formateur) {
      return NextResponse.json({ success: false, error: 'Formateur non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { date, creneauJournee, typeDisponibilite, commentaire } = body

    // Validation
    if (!date || !creneauJournee || !typeDisponibilite) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier si une disponibilité existe déjà pour ce jour/créneau
    const existing = await prisma.disponibiliteFormateur.findFirst({
      where: {
        idFormateur: formateur.idFormateur,
        date: new Date(date),
        creneauJournee,
      },
    })

    let result

    if (existing) {
      // Mise à jour
      result = await prisma.disponibiliteFormateur.update({
        where: {
          idDisponibilite: existing.idDisponibilite,
        },
        data: {
          typeDisponibilite,
          commentaire,
        },
      })
    } else {
      // Création
      result = await prisma.disponibiliteFormateur.create({
        data: {
          idFormateur: formateur.idFormateur,
          date: new Date(date),
          creneauJournee,
          typeDisponibilite,
          commentaire,
        },
      })
    }

    return NextResponse.json({
      success: true,
      disponibilite: {
        id: result.idDisponibilite,
        date: result.date.toISOString().split('T')[0],
        creneauJournee: result.creneauJournee,
        typeDisponibilite: result.typeDisponibilite,
        commentaire: result.commentaire,
      },
    })
  } catch (error) {
    console.error('Erreur POST /api/formateur/disponibilites:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
