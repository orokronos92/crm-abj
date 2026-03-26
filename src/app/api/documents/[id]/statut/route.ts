/**
 * API Route: PATCH /api/documents/[id]/statut
 * Valider ou refuser un document candidat
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

const STATUTS_VALIDES = ['ATTENDU', 'RECU', 'A_VALIDER', 'VALIDE', 'REFUSE', 'EXPIRE'] as const

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const docId = parseInt(id, 10)

    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { statut, commentaire } = body

    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      statut,
    }

    // Si validation ou refus, enregistrer la date
    if (statut === 'VALIDE' || statut === 'REFUSE') {
      updateData.dateValidation = new Date()
    }

    if (commentaire !== undefined) {
      updateData.commentaire = commentaire || null
    }

    const updated = await prisma.documentCandidat.update({
      where: { idDocument: docId },
      data: updateData,
      select: {
        idDocument: true,
        typeDocument: true,
        statut: true,
        commentaire: true,
        dateValidation: true,
      },
    })

    return NextResponse.json({ success: true, document: updated })
  } catch (error) {
    console.error('Erreur mise à jour statut document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
