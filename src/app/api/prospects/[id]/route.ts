/**
 * API Route Prospect individuel
 * GET, PATCH, DELETE pour un prospect spécifique
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authConfig } from '@/config/auth.config'
import { ROLES } from '@/config/constants'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Récupération d'un prospect
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const prospect = await prisma.prospect.findUnique({
      where: { idProspect: params.id },
      include: {
        candidats: {
          orderBy: { dateCandidature: 'desc' }
        },
        documentsCandidat: {
          orderBy: { creeLe: 'desc' }
        },
        historiqueEmails: {
          orderBy: { dateReception: 'desc' },
          take: 10
        }
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: prospect
    })

  } catch (error) {
    console.error('Erreur GET prospect:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Modification d'un prospect
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Mise à jour du prospect
    const prospect = await prisma.prospect.update({
      where: { idProspect: params.id },
      data: {
        ...body,
        dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : undefined,
        dateDernierContact: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: prospect,
      message: 'Prospect modifié avec succès'
    })

  } catch (error) {
    console.error('Erreur PATCH prospect:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

// DELETE - Suppression d'un prospect
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérification si le prospect a des candidatures
    const candidatsCount = await prisma.candidat.count({
      where: { idProspect: params.id }
    })

    if (candidatsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un prospect avec des candidatures' },
        { status: 400 }
      )
    }

    // Suppression du prospect
    await prisma.prospect.delete({
      where: { idProspect: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Prospect supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE prospect:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}