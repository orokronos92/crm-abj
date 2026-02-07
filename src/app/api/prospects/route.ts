/**
 * API Route Prospects
 * CRUD pour la gestion des prospects
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authConfig } from '@/config/auth.config'
import { ROLES } from '@/config/constants'

// GET - Liste des prospects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    // Vérification autorisation
    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Paramètres de pagination et recherche
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const statut = searchParams.get('statut') || ''

    const skip = (page - 1) * limit

    // Construction du filtre
    const where: any = {}

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { emails: { has: search } }
      ]
    }

    if (statut) {
      where.statutProspect = statut
    }

    // Requête avec pagination
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateDernierContact: 'desc' },
        include: {
          _count: {
            select: {
              candidats: true,
              historiqueEmails: true
            }
          }
        }
      }),
      prisma.prospect.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: prospects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Erreur GET prospects:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Création d'un prospect
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation des données requises
    if (!body.emails || body.emails.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un email est requis' },
        { status: 400 }
      )
    }

    // Génération de l'ID prospect
    const idProspect = `PROS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Création du prospect
    const prospect = await prisma.prospect.create({
      data: {
        idProspect,
        emails: body.emails,
        telephones: body.telephones || [],
        nom: body.nom,
        prenom: body.prenom,
        dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : null,
        adresse: body.adresse,
        codePostal: body.codePostal,
        ville: body.ville,
        formationsSouhaitees: body.formationsSouhaitees || [],
        formationPrincipale: body.formationPrincipale,
        modeFinancement: body.modeFinancement,
        situationActuelle: body.situationActuelle,
        niveauEtudes: body.niveauEtudes,
        projetProfessionnel: body.projetProfessionnel,
        sourceOrigine: body.sourceOrigine,
        messageInitial: body.messageInitial,
        statutProspect: 'NOUVEAU',
        datePremierContact: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: prospect,
      message: 'Prospect créé avec succès'
    })

  } catch (error) {
    console.error('Erreur POST prospect:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}