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
  params: Promise<{
    id: string
  }>
}

// GET - Récupération d'un prospect
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Bypass auth pour le moment (mode démo)
    // const session = await getServerSession(authConfig)
    // if (!session || session.user.role !== ROLES.ADMIN) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    // }

    const { id } = await params

    const prospect = await prisma.prospect.findUnique({
      where: { idProspect: id },
      select: {
        idProspect: true,
        nom: true,
        prenom: true,
        emails: true,
        telephones: true,
        formationPrincipale: true,
        statutProspect: true,
        sourceOrigine: true,
        modeFinancement: true,
        nbEchanges: true,
        dateDernierContact: true,
        datePremierContact: true,
        ville: true,
        codePostal: true,
        resumeIa: true
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect non trouvé' },
        { status: 404 }
      )
    }

    // Formater les données pour le client
    const formatted = {
      id: prospect.idProspect,
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      email: prospect.emails?.[0] || '',
      telephone: prospect.telephones?.[0] || '',
      formationSouhaitee: prospect.formationPrincipale || 'Non définie',
      statut: prospect.statutProspect || 'NOUVEAU',
      source: prospect.sourceOrigine || 'Non renseignée',
      financement: prospect.modeFinancement || 'Non défini',
      nbEchanges: prospect.nbEchanges || 0,
      dernierContact: prospect.dateDernierContact
        ? new Date(prospect.dateDernierContact).toISOString().split('T')[0]
        : 'Non renseigné',
      datePremierContact: prospect.datePremierContact
        ? new Date(prospect.datePremierContact).toISOString().split('T')[0]
        : 'Non renseigné',
      ville: prospect.ville || '',
      codePostal: prospect.codePostal || '',
      resumeIa: prospect.resumeIa || 'Aucune analyse disponible'
    }

    return NextResponse.json(formatted)

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

    const { id } = await params
    const body = await request.json()

    // Mise à jour du prospect
    const prospect = await prisma.prospect.update({
      where: { idProspect: id },
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

    const { id } = await params

    // Vérification si le prospect a des candidatures
    const candidatsCount = await prisma.candidat.count({
      where: { idProspect: id }
    })

    if (candidatsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un prospect avec des candidatures' },
        { status: 400 }
      )
    }

    // Suppression du prospect
    await prisma.prospect.delete({
      where: { idProspect: id }
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