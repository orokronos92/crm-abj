/**
 * API Disponibilités Formateur
 * GET: Récupérer les disponibilités d'un formateur pour une année
 * POST: Créer/Modifier une disponibilité
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/formateur/disponibilites?formateurId=1&annee=2026
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const formateurId = searchParams.get('formateurId')
    const annee = searchParams.get('annee')

    if (!formateurId) {
      return NextResponse.json(
        { success: false, error: 'formateurId requis' },
        { status: 400 }
      )
    }

    const anneeInt = annee ? parseInt(annee) : new Date().getFullYear()

    // Récupérer toutes les disponibilités de l'année
    const dateDebut = new Date(anneeInt, 0, 1) // 1er janvier
    const dateFin = new Date(anneeInt, 11, 31) // 31 décembre

    const disponibilites = await prisma.disponibiliteFormateur.findMany({
      where: {
        idFormateur: parseInt(formateurId),
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
        formateurPrincipalId: parseInt(formateurId),
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
    const body = await request.json()
    const { formateurId, date, creneauJournee, typeDisponibilite, commentaire } = body

    // Validation
    if (!formateurId || !date || !creneauJournee || !typeDisponibilite) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier si une disponibilité existe déjà pour ce jour/créneau
    const existing = await prisma.disponibiliteFormateur.findFirst({
      where: {
        idFormateur: formateurId,
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
          idFormateur: formateurId,
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
