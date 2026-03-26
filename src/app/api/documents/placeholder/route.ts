/**
 * API Route: POST /api/documents/placeholder
 * Crée un placeholder de document en base (statut ATTENDU)
 * utilisé quand l'admin veut uploader un document qui n'a pas encore d'entrée en BDD.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { numeroDossier, idProspect, typeDocument, obligatoire } = body

    if (!numeroDossier || !typeDocument) {
      return NextResponse.json(
        { error: 'numeroDossier et typeDocument sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si un placeholder existe déjà pour ce type + dossier
    const existing = await prisma.documentCandidat.findFirst({
      where: {
        numeroDossier,
        typeDocument,
      },
      select: { idDocument: true, statut: true },
    })

    if (existing) {
      return NextResponse.json({ idDocument: existing.idDocument, existe: true })
    }

    const doc = await prisma.documentCandidat.create({
      data: {
        numeroDossier,
        idProspect: idProspect || null,
        typeDocument,
        statut: 'ATTENDU',
        obligatoire: obligatoire ?? false,
      },
      select: { idDocument: true },
    })

    return NextResponse.json({ idDocument: doc.idDocument, existe: false })
  } catch (error) {
    console.error('Erreur création placeholder document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du placeholder' },
      { status: 500 }
    )
  }
}
